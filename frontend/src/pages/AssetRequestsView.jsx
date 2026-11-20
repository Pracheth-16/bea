import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCw,
  Send,
  Boxes,
  User,
  X
} from 'lucide-react';

export const AssetRequestsView = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stockAssets, setStockAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState(null);

  // Form states
  const [assetType, setAssetType] = useState('Laptop Workstation');
  const [priority, setPriority] = useState('routine');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review states
  const [reviewNotes, setReviewNotes] = useState('');
  const [allocatedAssetId, setAllocatedAssetId] = useState('');

  useEffect(() => {
    loadRequests();
    loadStockAssets();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await api.getAssetRequests();
      setRequests(res.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStockAssets = async () => {
    try {
      const res = await api.getAssets({ status: 'in_stock' });
      setStockAssets(res.assets || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createAssetRequest({
        assetType,
        priority,
        justification
      });
      setShowRequestModal(false);
      setJustification('');
      loadRequests();
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (status) => {
    if (!reviewingRequest) return;
    setSubmitting(true);
    try {
      await api.reviewAssetRequest(
        reviewingRequest.id,
        status,
        reviewNotes,
        allocatedAssetId || null
      );
      setReviewingRequest(null);
      setReviewNotes('');
      setAllocatedAssetId('');
      loadRequests();
      loadStockAssets();
    } catch (err) {
      alert(err.message || 'Review action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">URGENT</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-sky-100 text-sky-800 border border-sky-300">ROUTINE</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>;
    }
  };

  const canReview = user?.role === 'admin' || user?.role === 'supervisor';

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hardware Asset Requests & Approvals
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-sky-300">
              FR-4 Workflow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit equipment requirements with priority tiers (Routine, Urgent, Critical) and departmental justification.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Equipment Request</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            Loading asset requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Layers className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
            <p className="font-bold text-slate-800">No Asset Requests</p>
            <p className="text-xs text-slate-400 mt-1">Submit your first asset request above.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {req.requestNumber}
                  </span>
                  {getPriorityBadge(req.priority)}
                  {getStatusBadge(req.status)}
                </div>

                <div className="text-xs text-slate-400">
                  Submitted {new Date(req.createdAt).toLocaleDateString()} at{' '}
                  {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {req.assetType}
                </h3>
                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  <span className="font-semibold text-slate-700">Justification: </span>
                  {req.justification}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="text-slate-500">
                  Requester: <span className="font-semibold text-slate-800">{req.requestedByName}</span> ({req.department})
                </div>

                {req.reviewedByName && (
                  <div className="text-slate-500">
                    Reviewed by <span className="font-semibold text-slate-800">{req.reviewedByName}</span>
                    {req.reviewNotes && ` — "${req.reviewNotes}"`}
                  </div>
                )}

                {canReview && req.status === 'pending' && (
                  <button
                    onClick={() => setReviewingRequest(req)}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Review & Approve / Reject
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Asset Request */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold">Submit Hardware Asset Request (FR-4)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Requests are reviewed by the IT Department Supervisor and Administrative Procurement.
              </p>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Equipment / Asset Type *</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Laptop Workstation (Dell Latitude i7)">Laptop Workstation (Dell Latitude i7)</option>
                  <option value="High-Performance GPU Desktop (HP Z4)">High-Performance GPU Desktop (HP Z4)</option>
                  <option value="Dual 27-inch 4K Monitor Setup">Dual 27-inch 4K Monitor Setup</option>
                  <option value="Laboratory Interactive Projector">Laboratory Interactive Projector</option>
                  <option value="Gigabit PoE Switch 24-Port">Gigabit PoE Switch 24-Port</option>
                  <option value="iPad Pro for Digital Classrooms">iPad Pro for Digital Classrooms</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Priority Tier (FR-4)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="routine">Routine - Standard procurement cycle</option>
                  <option value="urgent">Urgent - Required for ongoing lab/evaluations</option>
                  <option value="critical">Critical - Halting project delivery or faculty work</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business Justification *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain why this hardware is required, project course code, or replacement necessity..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review Asset Request */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setReviewingRequest(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold">Review Request: {reviewingRequest.requestNumber}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {reviewingRequest.requestedByName} • {reviewingRequest.assetType}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Requester Justification:</span>
                <p className="text-slate-600 mt-1">{reviewingRequest.justification}</p>
              </div>

              {/* Allocate asset from in-stock inventory */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Allocate In-Stock Hardware Asset (Optional):
                </label>
                <select
                  value={allocatedAssetId}
                  onChange={(e) => setAllocatedAssetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                >
                  <option value="">Do not allocate immediately (Order/Pending)</option>
                  {stockAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} - {a.name} ({a.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {stockAssets.length} unit(s) currently In Stock. Selecting one will automatically mark it Assigned.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Review Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Enter approval remarks or procurement dispatch comments..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleReview('rejected')}
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReview('approved')}
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

