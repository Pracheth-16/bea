import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './pages/DashboardView';
import { TicketListView } from './pages/TicketListView';
import { AssetRegisterView } from './pages/AssetRegisterView';
import { AssetRequestsView } from './pages/AssetRequestsView';
import { AutomationCenterView } from './pages/AutomationCenterView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CreateTicketModal } from './components/CreateTicketModal';
import { NotificationCenter } from './components/NotificationCenter';
import { ProjectInfoModal } from './components/ProjectInfoModal';
import { api } from './services/api';
import { RotateCw, CheckCircle, Boxes, ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, loading, refreshNotifications } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // SLA sweep state
  const [isSweeping, setIsSweeping] = useState(false);
  const [lastSweepResult, setLastSweepResult] = useState(null);
  const [sweepToast, setSweepToast] = useState(null);

  // Update default tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'supervisor') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('tickets');
      }
    }
  }, [user?.role]);

  const handleSweepSLA = async () => {
    setIsSweeping(true);
    try {
      const res = await api.evaluateSLA();
      setLastSweepResult(res.metrics);
      await refreshNotifications();
      setSweepToast({
        success: true,
        message: `SLA sweep completed in ${res.metrics?.durationMs || 2}ms. ${res.metrics?.newEscalations || 0} new escalations triggered.`
      });
      setTimeout(() => setSweepToast(null), 4000);
    } catch (err) {
      setSweepToast({
        success: false,
        message: 'SLA evaluation failed'
      });
      setTimeout(() => setSweepToast(null), 4000);
    } finally {
      setIsSweeping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-700">
        <Boxes className="w-12 h-12 text-sky-600 animate-bounce mb-3" />
        <h2 className="text-lg font-bold">Enterprise ITSM System</h2>
        <p className="text-xs text-slate-400 mt-1">Initializing multi-tier architecture & data layer...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Toast Notification */}
      {sweepToast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-300">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border flex items-center space-x-2.5 text-xs font-semibold ${
              sweepToast.success
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{sweepToast.message}</span>
          </div>
        </div>
      )}

      {/* Main App Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifs={() => setShowNotifs(true)}
        onOpenAbout={() => setShowAbout(true)}
        onSweepSLA={handleSweepSLA}
        isSweeping={isSweeping}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView onSweepSLA={handleSweepSLA} isSweeping={isSweeping} />
        )}
        {activeTab === 'tickets' && (
          <TicketListView
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
            onOpenCreate={() => setShowCreateTicket(true)}
          />
        )}
        {activeTab === 'assets' && <AssetRegisterView />}
        {activeTab === 'requests' && <AssetRequestsView />}
        {activeTab === 'automation' && (
          <AutomationCenterView
            onSweepSLA={handleSweepSLA}
            isSweeping={isSweeping}
            lastSweepResult={lastSweepResult}
          />
        )}
      </main>

      {/* Modals & Slide-overs */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onRefresh={() => setSelectedTicket(null)}
      />

      <CreateTicketModal
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onCreated={() => {
          setActiveTab('tickets');
          refreshNotifications();
        }}
      />

      <NotificationCenter
        isOpen={showNotifs}
        onClose={() => setShowNotifs(false)}
      />

      <ProjectInfoModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Enterprise ITSM</span>
            <span>•</span>
            <span>BMS Institute of Technology & Management</span>
            <span>•</span>
            <span>BCS703B CCA Phase-1</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span>Team: Pavan R Bhat, Pracheth Kashyap, Pranab Bhardwaj, Puneethgouda Patil</span>
            <span>•</span>
            <button
              onClick={() => setShowAbout(true)}
              className="text-sky-600 hover:text-sky-800 font-medium cursor-pointer"
            >
              Rubrics Verification
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

