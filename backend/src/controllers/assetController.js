import { store } from '../services/dataStore.js';
import { ASSET_STATUS, ROLES } from '../config/constants.js';

export const getAssets = (req, res) => {
  const { category, status, department, search } = req.query;
  let assets = store.getCollection('assets');

  // If normal employee, show their assigned assets or all assets if searching
  if (category) {
    assets = assets.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    assets = assets.filter((a) => a.status === status);
  }
  if (department) {
    assets = assets.filter((a) => a.department.toLowerCase() === department.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.assetTag.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q)
    );
  }

  res.json({ assets, total: assets.length });
};

export const getAssetById = (req, res) => {
  const { id } = req.params;
  const asset = store.findById('assets', id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found in registry.' });
  }
  res.json({ asset });
};

export const createAsset = (req, res) => {
  const {
    assetTag,
    name,
    category,
    serialNumber,
    model,
    vendor,
    purchaseDate,
    warrantyExpiryDate,
    status = ASSET_STATUS.IN_STOCK,
    department,
    location,
    assignedToId,
    ipAddress,
    macAddress
  } = req.body;

  if (!assetTag || !name || !category || !serialNumber) {
    return res.status(400).json({ error: 'Asset Tag, Name, Category, and Serial Number are required.' });
  }

  // Check unique asset tag
  const existing = store.findOne('assets', { assetTag: assetTag.trim().toUpperCase() });
  if (existing) {
    return res.status(409).json({ error: `Asset Tag '${assetTag}' already exists in registry.` });
  }

  let assignedToName = null;
  if (assignedToId) {
    const user = store.findById('users', assignedToId);
    if (user) assignedToName = user.name;
  }

  const newAsset = store.create('assets', {
    assetTag: assetTag.trim().toUpperCase(),
    name,
    category,
    serialNumber: serialNumber.trim().toUpperCase(),
    model: model || '',
    vendor: vendor || 'Enterprise OEM',
    purchaseDate: purchaseDate || new Date().toISOString(),
    warrantyExpiryDate: warrantyExpiryDate || new Date(Date.now() + 365 * 86400 * 1000).toISOString(),
    status: assignedToId ? ASSET_STATUS.ASSIGNED : status,
    assignedToId: assignedToId || null,
    assignedToName,
    department: department || 'IT Hardware & Facilities',
    location: location || 'Central Warehouse',
    ipAddress: ipAddress || '',
    macAddress: macAddress || '',
    maintenanceHistory: []
  });

  store.logAudit('ASSET_REGISTERED', req.user.id, req.user.name, `Registered asset ${newAsset.assetTag} (${name})`);

  res.status(201).json({ success: true, asset: newAsset });
};

export const updateAsset = (req, res) => {
  const { id } = req.params;
  const asset = store.findById('assets', id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found.' });
  }

  const updates = { ...req.body };
  if (updates.assignedToId) {
    const user = store.findById('users', updates.assignedToId);
    if (user) {
      updates.assignedToName = user.name;
      updates.status = ASSET_STATUS.ASSIGNED;
    }
  } else if (updates.assignedToId === null) {
    updates.assignedToName = null;
    updates.status = ASSET_STATUS.IN_STOCK;
  }

  const updatedAsset = store.updateById('assets', id, updates);
  store.logAudit('ASSET_UPDATED', req.user.id, req.user.name, `Updated asset ${asset.assetTag}`);

  res.json({ success: true, asset: updatedAsset });
};

export const addMaintenanceRecord = (req, res) => {
  const { id } = req.params;
  const { serviceType, technician, notes, cost = 0, date } = req.body;

  const asset = store.findById('assets', id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found.' });
  }

  if (!serviceType) {
    return res.status(400).json({ error: 'Service type is required.' });
  }

  const record = {
    id: `mnt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: date || new Date().toISOString(),
    serviceType,
    technician: technician || req.user.name,
    notes: notes || '',
    cost: Number(cost) || 0
  };

  const maintenanceHistory = asset.maintenanceHistory || [];
  maintenanceHistory.unshift(record);

  const updatedAsset = store.updateById('assets', id, {
    maintenanceHistory,
    status: ASSET_STATUS.UNDER_MAINTENANCE
  });

  store.logAudit(
    'ASSET_MAINTENANCE_LOGGED',
    req.user.id,
    req.user.name,
    `Logged maintenance for ${asset.assetTag}: ${serviceType}`
  );

  res.json({ success: true, asset: updatedAsset, record });
};

export const deleteAsset = (req, res) => {
  const { id } = req.params;
  const asset = store.findById('assets', id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found.' });
  }

  store.deleteById('assets', id);
  store.logAudit('ASSET_DELETED', req.user.id, req.user.name, `Deleted asset ${asset.assetTag}`);

  res.json({ success: true, message: `Asset ${asset.assetTag} removed from register.` });
};

