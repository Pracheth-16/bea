import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Download,
  Layers,
  Server,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Boxes,
  RotateCw
} from 'lucide-react';

export const DashboardView = ({ onSweepSLA, isSweeping }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.getDashboardMetrics();
      setData(res);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('itsm_token');
      const res = await fetch('/api/reports/export-csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ITSM_Executive_Report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-2">
          <RotateCw className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading ITSM analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const distributions = data?.distributions || {};

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Executive ITSM Dashboard
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-sky-300">
              FR-8 Reporting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational metrics, SLA compliance rates, and organizational asset utilization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onSweepSLA}
            disabled={isSweeping}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
            <span>{isSweeping ? 'Evaluating SLA...' : 'Run SLA Sweep'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tickets</p>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{kpis.totalTickets}</span>
            <span className="text-xs text-slate-500">
              ({kpis.openCount} open, {kpis.inProgressCount} in-progress)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-1.5 rounded-full"
              style={{ width: `${kpis.totalTickets > 0 ? (kpis.resolvedCount / kpis.totalTickets) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* SLA Compliance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SLA Compliance</p>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {kpis.slaComplianceRate}%
            </span>
            <span className="text-xs text-emerald-700 font-medium">Target: &gt;90%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {kpis.breachedCount === 0
              ? 'Zero SLA breaches reported'
              : `${kpis.breachedCount} tickets exceeded SLA deadline`}
          </p>
        </div>

        {/* MTTR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">MTTR (Resolution)</p>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{kpis.mttrHours}h</span>
            <span className="text-xs text-slate-500">Mean Time to Resolve</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Calculated over {kpis.resolvedCount} resolved tickets
          </p>
        </div>

        {/* Asset Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Asset Utilization</p>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{kpis.assetUtilizationRate}%</span>
            <span className="text-xs text-slate-500">of {kpis.totalAssets} assets</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{kpis.assignedAssets} Assigned</span>
            <span>{kpis.inStockAssets} In Stock</span>
            <span>{kpis.maintenanceAssets} In Maint.</span>
          </div>
        </div>
      </div>

      {/* SLA Alert Banner if Breached or Escalated */}
      {kpis.escalatedCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">
                {kpis.escalatedCount} Critical or Breached Ticket(s) in Escalation Queue (FR-6)
              </p>
              <p className="text-xs text-rose-700">
                SLA engine has bumped escalated tickets to top priority in the agent queue.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-white text-rose-700 border border-rose-300 rounded-lg">
            Immediate Action Required
          </span>
        </div>
      )}

      {/* Visual Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Ticket Volume by Category (FR-1, FR-2)</span>
            <span className="text-xs text-slate-400 font-normal">Auto-routed departments</span>
          </h2>

          <div className="space-y-3.5">
            {[
              { key: 'hardware', label: 'Hardware & Facilities', count: distributions.ticketsByCategory?.hardware || 0, color: 'bg-blue-600' },
              { key: 'software', label: 'Enterprise Software & Licenses', count: distributions.ticketsByCategory?.software || 0, color: 'bg-emerald-600' },
              { key: 'network', label: 'Campus Network & Wi-Fi', count: distributions.ticketsByCategory?.network || 0, color: 'bg-purple-600' },
              { key: 'new_asset', label: 'Asset Procurement & Requests', count: distributions.ticketsByCategory?.new_asset || 0, color: 'bg-amber-500' }
            ].map((cat) => {
              const total = kpis.totalTickets || 1;
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={cat.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat.label}</span>
                    <span className="font-bold text-slate-900">
                      {cat.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset Inventory Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Asset Category Breakdown (FR-5)</span>
            <span className="text-xs text-slate-400 font-normal">Registered Hardware</span>
          </h2>

          <div className="space-y-3.5">
            {Object.entries(distributions.assetsByCategory || {}).map(([category, count]) => {
              const total = kpis.totalAssets || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 capitalize">{category}</span>
                    <span className="font-bold text-slate-900">
                      {count} units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-700 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickets by Department */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Department Support Distribution
          </h2>
          <div className="space-y-2.5">
            {Object.entries(distributions.ticketsByDept || {}).map(([dept, count]) => (
              <div
                key={dept}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="text-slate-700 font-medium">{dept}</span>
                <span className="font-bold text-slate-900 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                  {count} {count === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Matrix & Policy Benchmarks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-2">
            SLA Policy Matrix (Report Sec 3.1)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Thresholds enforced by the background SLA evaluation engine.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
              <span className="font-bold text-rose-800 uppercase tracking-wide block">Critical SLA</span>
              <span className="text-lg font-black text-rose-900">4 Hours</span>
              <p className="text-[10px] text-rose-700 mt-1">Warning at 3h (75%) • Auto-escalates</p>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
              <span className="font-bold text-amber-800 uppercase tracking-wide block">Urgent SLA</span>
              <span className="text-lg font-black text-amber-900">12 Hours</span>
              <p className="text-[10px] text-amber-700 mt-1">Warning at 9h (75%)</p>
            </div>

            <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/50">
              <span className="font-bold text-sky-800 uppercase tracking-wide block">Routine SLA</span>
              <span className="text-lg font-black text-sky-900">48 Hours</span>
              <p className="text-[10px] text-sky-700 mt-1">Warning at 36h (75%)</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-700 uppercase tracking-wide block">Low SLA</span>
              <span className="text-lg font-black text-slate-800">72 Hours</span>
              <p className="text-[10px] text-slate-500 mt-1">General inquiries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

