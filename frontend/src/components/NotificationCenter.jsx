import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mail,
  Send,
  CheckCheck,
  ShieldAlert
} from 'lucide-react';

export const NotificationCenter = ({ isOpen, onClose }) => {
  const { refreshNotifications } = useAuth();
  const [activeTab, setActiveTab] = useState('inapp');
  const [notifications, setNotifications] = useState([]);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const notifsRes = await api.getNotifications();
      setNotifications(notifsRes.notifications || []);
      const logsRes = await api.getDispatchLogs();
      setDispatchLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'sla_breach':
      case 'sla_escalation':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'sla_warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ticket_assigned':
        return <Clock className="w-5 h-5 text-sky-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              Notification Center (FR-7)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: In-App vs External Email/SMS */}
        <div className="flex border-b border-slate-200 px-4 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('inapp')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'inapp'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>In-App Alerts</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              {notifications.filter((n) => !n.read).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'dispatch'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Simulated Email / SMS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              {dispatchLogs.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'inapp' ? (
            <>
              {notifications.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={markAllRead}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all as read</span>
                  </button>
                </div>
              )}

              {loading ? (
                <p className="text-center text-xs text-slate-400 py-8">Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-slate-600">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      n.read
                        ? 'bg-white border-slate-200 opacity-80'
                        : 'bg-sky-50/70 border-sky-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="shrink-0 mt-0.5">{getNotifIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${n.read ? 'text-slate-800' : 'text-slate-900'}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0 ml-2"></span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' '}
                          • {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-2">
                <span className="font-semibold block mb-0.5">FR-7 Multi-Channel Dispatch Trace:</span>
                This log captures simulated external SMTP and SMS gateway payloads generated during ticket creation, SLA breaches, and approvals.
              </div>

              {dispatchLogs.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">No external dispatches recorded yet.</p>
              ) : (
                dispatchLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono space-y-1.5 border border-slate-800 shadow-md"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                      <span className="text-emerald-400 font-semibold">{log.channel}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">SUBJECT: </span>
                      <span className="text-amber-300">{log.subject}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                      {log.body}
                    </p>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

