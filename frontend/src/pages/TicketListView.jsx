import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  RotateCw,
  HardDrive,
  Wifi,
  Package,
  Layers
} from 'lucide-react';

export const TicketListView = ({ onSelectTicket, onOpenCreate }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, search]);

  const loadTickets = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;
      const res = await api.getTickets(params);
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority, isEscalated) => {
    if (isEscalated) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-rose-600 text-white animate-pulse shadow-xs">
          <ShieldAlert className="w-3 h-3" />
          <span>ESCALATED (CRITICAL)</span>
        </span>
      );
    }

    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>CRITICAL</span>
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            <span>URGENT</span>
          </span>
        );
      case 'routine':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-sky-100 text-sky-800 border border-sky-300">
            ROUTINE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase bg-slate-100 text-slate-700">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Open</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'escalated':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Escalated</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">Closed</span>;
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'hardware':
        return <HardDrive className="w-3.5 h-3.5 text-blue-600" />;
      case 'network':
        return <Wifi className="w-3.5 h-3.5 text-purple-600" />;
      case 'new_asset':
        return <Package className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const renderSLATimer = (ticket) => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return (
        <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>SLA Met</span>
        </span>
      );
    }

    const deadline = new Date(ticket.slaDeadline).getTime();
    const now = Date.now();
    const remainingMs = deadline - now;
    const remainingHours = (remainingMs / (3600 * 1000)).toFixed(1);

    if (ticket.isBreached || remainingMs <= 0) {
      return (
        <span className="text-[11px] font-bold text-rose-600 flex items-center space-x-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600 animate-bounce" />
          <span>SLA BREACHED ({Math.abs(remainingHours)}h overdue)</span>
        </span>
      );
    }

    if (ticket.isWarning || remainingHours <= ticket.slaHours * 0.25) {
      return (
        <span className="text-[11px] font-bold text-amber-600 flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span>{remainingHours}h remaining (75% Warn)</span>
        </span>
      );
    }

    return (
      <span className="text-[11px] font-medium text-slate-600 flex items-center space-x-1">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{remainingHours}h remaining</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.role === 'employee'
                ? 'My Support Tickets'
                : user?.role === 'agent'
                ? 'Priority Agent Queue'
                : 'Enterprise Ticket Management'}
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-sky-300">
              FR-1, FR-6
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'agent'
              ? 'Tickets auto-routed to your department. Escalated & Critical requests are prioritized at the top.'
              : 'Submit technical issues, track real-time resolution SLAs, and communicate with support teams.'}
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by ID, title, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical (4h SLA)</option>
          <option value="urgent">Urgent (12h SLA)</option>
          <option value="routine">Routine (48h SLA)</option>
          <option value="low">Low (72h SLA)</option>
        </select>

        <button
          onClick={loadTickets}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          title="Refresh ticket list"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
            <p className="text-base font-bold text-slate-800">No Tickets Found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no support tickets matching your current filter criteria.
            </p>
            <button
              onClick={onOpenCreate}
              className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Raise a New Ticket
            </button>
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTicket(t)}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer hover:shadow-md hover:border-sky-300 relative overflow-hidden ${
                t.isEscalated
                  ? 'border-rose-400 bg-rose-50/20 shadow-xs ring-1 ring-rose-300'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              {/* Top Accent Strip for Escalated tickets */}
              {t.isEscalated && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse"></div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left Metadata & Title */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {t.ticketNumber}
                    </span>
                    {getPriorityBadge(t.priority, t.isEscalated)}
                    {getStatusBadge(t.status)}
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      {getCategoryIcon(t.category)}
                      <span className="capitalize">{t.category.replace('_', ' ')}</span>
                    </span>
                    {t.relatedAssetTag && (
                      <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Asset: {t.relatedAssetTag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {t.description}
                  </p>
                </div>

                {/* Right Metadata: SLA Countdown & Assigned Person */}
                <div className="sm:text-right shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-1.5">
                  <div>{renderSLATimer(t)}</div>
                  <div className="text-[11px] text-slate-500">
                    Dept: <span className="font-semibold text-slate-700">{t.department}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Agent: <span className="font-medium text-slate-600">{t.assignedAgentName || 'Unassigned Queue'}</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-slate-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

