import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  HardDrive,
  History,
  Send,
  ArrowUpRight,
  UserCheck,
  Layers,
  Building
} from 'lucide-react';

export const TicketDetailModal = ({ ticket, isOpen, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [showEscalateInput, setShowEscalateInput] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentTicket(ticket);
    if (ticket?.id) {
      loadLatest();
      loadUsers();
    }
  }, [ticket]);

  const loadLatest = async () => {
    try {
      const res = await api.getTicket(ticket.id);
      setCurrentTicket(res.ticket);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setAllUsers(res.users.filter((u) => u.role === 'agent' || u.role === 'supervisor'));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !currentTicket) return null;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'resolved' && !resolutionNotes.trim()) {
      alert('Please enter resolution notes and steps taken before marking the ticket resolved.');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateTicketStatus(currentTicket.id, newStatus, resolutionNotes);
      setResolutionNotes('');
      await loadLatest();
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update ticket status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) {
      alert('Please state a reason for escalating this ticket to the supervisor.');
      return;
    }

    setSubmitting(true);
    try {
      await api.escalateTicket(currentTicket.id, escalateReason);
      setEscalateReason('');
      setShowEscalateInput(false);
      await loadLatest();
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to escalate ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedAgentId) return;
    setSubmitting(true);
    try {
      await api.reassignTicket(currentTicket.id, selectedAgentId);
      setSelectedAgentId('');
      await loadLatest();
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to reassign');
    } finally {
      setSubmitting(false);
    }
  };

  const isStaff = user?.role === 'agent' || user?.role === 'supervisor' || user?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`p-6 text-white relative ${
          currentTicket.isEscalated
            ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-red-950'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">
              {currentTicket.ticketNumber}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 border border-white/20">
              {currentTicket.priority} Priority ({currentTicket.slaHours}h SLA)
            </span>
            {currentTicket.isEscalated && (
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                AUTO-ESCALATED (FR-6)
              </span>
            )}
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/30 text-sky-200">
              {currentTicket.status}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
            {currentTicket.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3 pt-3 border-t border-white/10">
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Raised by: {currentTicket.createdByName}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              <span>Dept: {currentTicket.department}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Deadline: {new Date(currentTicket.slaDeadline).toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Issue Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Problem Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {currentTicket.description}
            </div>
          </div>

          {/* Associated Asset Info (if any) */}
          {currentTicket.relatedAssetTag && (
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-sky-600 text-white">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-sky-900">
                    Linked Hardware Asset: {currentTicket.relatedAssetTag}
                  </p>
                  <p className="text-[11px] text-sky-700">
                    Asset records and maintenance logs automatically synced with this ticket.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Notes Display (if resolved) */}
          {currentTicket.resolutionNotes && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resolution Remarks:</span>
              </p>
              <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-wrap">
                {currentTicket.resolutionNotes}
              </p>
            </div>
          )}

          {/* Support Actions Bar (For Agent, Supervisor, Admin) */}
          {isStaff && currentTicket.status !== 'closed' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Support Agent & Supervisor Actions
              </h3>

              {/* Status Change Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {currentTicket.status === 'open' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={submitting}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                )}

                {currentTicket.status !== 'resolved' && (
                  <div className="w-full space-y-2 mt-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Resolution Notes (Required to resolve):
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Specify root cause diagnosis, hardware repair steps, or license activation details..."
                      rows={2}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    ></textarea>
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      disabled={submitting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolve Ticket</span>
                    </button>
                  </div>
                )}

                {currentTicket.status === 'resolved' && (
                  <button
                    onClick={() => handleStatusChange('closed')}
                    disabled={submitting}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Close Ticket
                  </button>
                )}
              </div>

              {/* Reassignment Dropdown (Supervisor & Admin) */}
              {(user?.role === 'supervisor' || user?.role === 'admin') && (
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Reassign to Agent:</span>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700"
                  >
                    <option value="">Select an agent...</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.department})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleReassign}
                    disabled={!selectedAgentId || submitting}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Assign
                  </button>
                </div>
              )}

              {/* Manual Escalation Override */}
              {!currentTicket.isEscalated && (
                <div className="pt-3 border-t border-slate-200">
                  {!showEscalateInput ? (
                    <button
                      onClick={() => setShowEscalateInput(true)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Manually Escalate to IT Supervisor (FR-6)</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Reason for escalation (e.g. requires higher-level vendor intervention)..."
                        value={escalateReason}
                        onChange={(e) => setEscalateReason(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEscalate}
                          disabled={submitting}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Confirm Escalation
                        </button>
                        <button
                          onClick={() => setShowEscalateInput(false)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Audit History Timeline (FR-3, FR-6) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <History className="w-4 h-4 text-sky-600" />
              <span>Complete Lifecycle Audit Trail</span>
            </h3>
            <div className="border-l-2 border-slate-200 ml-3 space-y-4">
              {(currentTicket.history || []).map((entry, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-sky-600 border-2 border-white"></div>
                  <p className="text-xs font-bold text-slate-800">{entry.action}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    by <span className="font-semibold text-slate-700">{entry.by}</span> •{' '}
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

