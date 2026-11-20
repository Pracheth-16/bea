import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import {
  ShieldCheck,
  Bell,
  Clock,
  Layers,
  FileText,
  Boxes,
  HelpCircle,
  RotateCw,
  LogOut,
  ChevronDown,
  Activity,
  Zap,
  Info
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenNotifs, onOpenAbout, onSweepSLA, isSweeping }) => {
  const { user, quickSwitchRole, unreadNotifs } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/10 text-amber-600 border-amber-300';
      case 'supervisor':
        return 'bg-purple-500/10 text-purple-600 border-purple-300';
      case 'agent':
        return 'bg-blue-500/10 text-blue-600 border-blue-300';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner with BMSIT & Project Header */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="bg-sky-500 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide">
            BMSIT&M
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Department of Information Science & Engineering
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400">Building Enterprise Applications (BCS703B)</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <button
            onClick={onOpenAbout}
            className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Project & Team Info</span>
          </button>
          <span>•</span>
          <span className="text-slate-400">Course Mini-Project 2026-2027</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Enterprise ITSM
                </span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  ITIL v4
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                IT Helpdesk, SLA Monitoring & Asset Management
              </p>
            </div>
          </div>

          {/* Navigation Tabs based on Role */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            {/* Admin & Supervisor Dashboard */}
            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Dashboard & KPIs</span>
              </button>
            )}

            {/* Tickets Tab for all */}
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'tickets'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>
                {user?.role === 'employee'
                  ? 'My Tickets'
                  : user?.role === 'agent'
                  ? 'Priority Queue'
                  : 'Ticket Console'}
              </span>
            </button>

            {/* Asset Register Tab */}
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'assets'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>
                {user?.role === 'employee' ? 'My Hardware' : 'Asset Register'}
              </span>
            </button>

            {/* Asset Requests Tab */}
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Asset Requests</span>
            </button>

            {/* Automation & SLA Engine tab for Admin & Supervisor */}
            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <button
                onClick={() => setActiveTab('automation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'automation'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>SLA & n8n Engine</span>
              </button>
            )}
          </nav>

          {/* Right Action Tools: SLA Sweep Button, Notifications, Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Quick SLA Engine Trigger */}
            <button
              onClick={onSweepSLA}
              disabled={isSweeping}
              title="Trigger background SLA Engine sweep across all active tickets (FR-3, NFR-2)"
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
              <span>Sweep SLA</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifs}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Real-time in-app notifications and email/SMS dispatch logs"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse shadow-xs">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Quick Role Switcher (Academic Evaluation Feature) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-left transition-all shadow-2xs"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {user?.name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getRoleBadge(
                        user?.role
                      )}`}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user?.department}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowRoleMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role (Viva Demo Mode)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instantly test the app from any role's perspective
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    {DEMO_USERS.map((demo) => {
                      const isActive = user?.role === demo.role;
                      return (
                        <button
                          key={demo.role}
                          onClick={() => {
                            quickSwitchRole(demo.role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                            isActive
                              ? 'bg-sky-50 text-sky-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-medium">{demo.label}</span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {demo.name}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${demo.badge}`}
                          >
                            {demo.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    Password for all accounts: <code className="text-slate-600 font-mono">password123</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center space-x-2 py-2 border-t border-slate-100 overflow-x-auto text-xs">
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded-lg shrink-0 ${
                activeTab === 'dashboard' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1 rounded-lg shrink-0 ${
              activeTab === 'tickets' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3 py-1 rounded-lg shrink-0 ${
              activeTab === 'assets' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1 rounded-lg shrink-0 ${
              activeTab === 'requests' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Requests
          </button>
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <button
              onClick={() => setActiveTab('automation')}
              className={`px-3 py-1 rounded-lg shrink-0 ${
                activeTab === 'automation' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              SLA Engine
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

