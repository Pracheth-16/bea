import { store } from '../services/dataStore.js';
import { notificationService } from '../services/notificationService.js';
import { ASSET_REQUEST_STATUS, ASSET_STATUS, PRIORITIES, ROLES } from '../config/constants.js';

export const getAssetRequests = (req, res) => {
  const { role, id: userId } = req.user;
  let requests = store.getCollection('assetRequests');

  if (role === ROLES.EMPLOYEE) {
    requests = requests.filter((r) => r.requestedById === userId);
  }

  // Sort by priority (Critical > Urgent > Routine) and then date
  const priorityRank = {
    [PRIORITIES.CRITICAL]: 3,
    [PRIORITIES.URGENT]: 2,
    [PRIORITIES.ROUTINE]: 1
  };

  const sorted = [...requests].sort((a, b) => {
    const rankDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({ requests: sorted, total: sorted.length });
};

export const createAssetRequest = (req, res) => {
  const { assetType, priority = PRIORITIES.ROUTINE, justification } = req.body;

  if (!assetType || !justification) {
    return res.status(400).json({ error: 'Asset type and business justification are required.' });
  }

  const allReqs = store.getCollection('assetRequests');
  const count = allReqs.length + 1;
  const requestNumber = `REQ-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

  const newRequest = store.create('assetRequests', {
    requestNumber,
    requestedById: req.user.id,
    requestedByName: req.user.name,
    department: req.user.department || 'Information Science & Engineering',
    assetType,
    priority,
    justification,
    status: ASSET_REQUEST_STATUS.PENDING,
    reviewedById: null,
    reviewedByName: null,
    reviewedAt: null,
    reviewNotes: '',
    allocatedAssetId: null
  });

  store.logAudit(
    'ASSET_REQUEST_CREATED',
    req.user.id,
    req.user.name,
    `Submitted asset request ${requestNumber} [${priority.toUpperCase()}] for ${assetType}`
  );

  // Notify Admin and Supervisor
  const admins = store.find('users', { role: ROLES.ADMIN });
  admins.forEach((admin) => {
    notificationService.notify({
      userId: admin.id,
      type: 'asset_request',
      title: `New Asset Request: ${requestNumber}`,
      message: `${req.user.name} submitted a ${priority.toUpperCase()} request for ${assetType}`,
      requestId: newRequest.id
    });
  });

  res.status(201).json({ success: true, request: newRequest });
};

export const reviewAssetRequest = (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes, allocatedAssetId } = req.body;

  const request = store.findById('assetRequests', id);
  if (!request) {
    return res.status(404).json({ error: 'Asset request not found.' });
  }

  if (![ASSET_REQUEST_STATUS.APPROVED, ASSET_REQUEST_STATUS.REJECTED].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }

  const updates = {
    status,
    reviewNotes: reviewNotes || '',
    reviewedById: req.user.id,
    reviewedByName: req.user.name,
    reviewedAt: new Date().toISOString()
  };

  // If approved and an asset is allocated from inventory, update the asset
  if (status === ASSET_REQUEST_STATUS.APPROVED && allocatedAssetId) {
    const asset = store.findById('assets', allocatedAssetId);
    if (asset) {
      updates.allocatedAssetId = asset.id;
      store.updateById('assets', asset.id, {
        status: ASSET_STATUS.ASSIGNED,
        assignedToId: request.requestedById,
        assignedToName: request.requestedByName,
        department: request.department
      });
    }
  }

  const updatedRequest = store.updateById('assetRequests', id, updates);

  store.logAudit(
    'ASSET_REQUEST_REVIEWED',
    req.user.id,
    req.user.name,
    `${status.toUpperCase()} asset request ${request.requestNumber}`
  );

  // Notify requester (FR-7)
  notificationService.notify({
    userId: request.requestedById,
    type: 'asset_request_decision',
    title: `Asset Request ${request.requestNumber} ${status.toUpperCase()}`,
    message: `Your request for ${request.assetType} was ${status} by ${req.user.name}. Remarks: ${reviewNotes || 'Approved per policy'}`,
    requestId: request.id
  });

  res.json({ success: true, request: updatedRequest });
};

