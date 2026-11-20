import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Sparkles,
  Send,
  HardDrive,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const CreateTicketModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hardware');
  const [priority, setPriority] = useState('routine');
  const [relatedAssetId, setRelatedAssetId] = useState('');
  const [assets, setAssets] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
      setAiSuggestion(null);
    }
  }, [isOpen]);

  const loadAssets = async () => {
    try {
      const res = await api.getAssets();
      setAssets(res.assets || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleAiClassify = async () => {
    if (!title.trim()) {
      alert('Please enter a brief ticket title first so the AI can analyze it.');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.aiClassify(title, description);
      if (res.success && res.analysis) {
        setAiSuggestion(res.analysis);
        if (res.analysis.category) setCategory(res.analysis.category);
        if (res.analysis.priority) setPriority(res.analysis.priority);
      }
    } catch (err) {
      alert('AI classification service unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please enter both title and description');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTicket({
        title,
        description,
        category,
        priority,
        relatedAssetId: relatedAssetId || null
      });
      setTitle('');
      setDescription('');
      setCategory('hardware');
      setPriority('routine');
      setRelatedAssetId('');
      onCreated();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to raise ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoutingTarget = (cat) => {
    switch (cat) {
      case 'hardware':
        return 'IT Hardware & Facilities';
      case 'software':
        return 'Enterprise Software Support';
      case 'network':
        return 'Campus Network & Infrastructure';
      case 'new_asset':
        return 'IT Assets & Procurement';
      default:
        return 'IT Hardware & Facilities';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>FR-1 Ticket Dispatch</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Raise New IT Support Ticket</h2>
          <p className="text-slate-400 text-xs mt-1">
            Issue will be auto-routed to the designated department based on category.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Issue Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Issue Title *</label>
              <button
                type="button"
                onClick={handleAiClassify}
                disabled={aiLoading}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1 cursor-pointer bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200"
              >
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>{aiLoading ? 'Analyzing...' : 'AI Auto-Classify'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Seminar Hall projector not displaying HDMI input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-xs space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Gemini ITSM Smart Suggestion:</span>
                </span>
                <span className="text-[10px] font-mono text-sky-700 font-bold">
                  {Math.round(aiSuggestion.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-slate-700">{aiSuggestion.summary}</p>
              {aiSuggestion.recommendedAction && (
                <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-sky-100">
                  <span className="font-semibold text-sky-800">Self-Service Tip: </span>
                  {aiSuggestion.recommendedAction}
                </p>
              )}
            </div>
          )}

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category (FR-1)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="hardware">Hardware & Facilities</option>
                <option value="software">Software Access & Licenses</option>
                <option value="network">Campus Network & Wi-Fi</option>
                <option value="new_asset">New Asset Request</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Priority (SLA Tier)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
              >
                <option value="routine">Routine (48 Hours SLA)</option>
                <option value="urgent">Urgent (12 Hours SLA)</option>
                <option value="critical">Critical (4 Hours SLA - Auto-escalation)</option>
                <option value="low">Low (72 Hours SLA)</option>
              </select>
            </div>
          </div>

          {/* Auto-Routing Preview Badge (FR-2) */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
            <span className="text-blue-900 font-medium">FR-2 Auto-Routing Target:</span>
            <span className="font-bold text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
              {getRoutingTarget(category)}
            </span>
          </div>

          {/* Affected Hardware Asset */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Affected Hardware Asset (Optional)
            </label>
            <select
              value={relatedAssetId}
              onChange={(e) => setRelatedAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            >
              <option value="">None / Not linked to specific hardware</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} - {a.name} ({a.location})
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Provide complete symptoms, error codes, steps to reproduce, or affected classroom/lab..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispatching...' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

