import React from 'react';
import { X, CheckCircle2, Award, BookOpen, Layers, Users } from 'lucide-react';

export const ProjectInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const team = [
    { name: 'Pavan R Bhat', usn: '1BY23IS145', role: 'Full Stack & SLA Engine' },
    { name: 'Pracheth Kashyap', usn: '1BY23IS152', role: 'Auto-Routing & React UI' },
    { name: 'Pranab Bhardwaj', usn: '1BY23IS154', role: 'Asset Lifecycle & Data Layer' },
    { name: 'Puneethgouda Patil', usn: '1BY23IS165', role: 'n8n Workflows & Security' }
  ];

  const frList = [
    { id: 'FR-1', title: 'Ticket Raising & Tracking', desc: 'Category-based raising (hardware, software, network, new asset) and progress tracking.' },
    { id: 'FR-2', title: 'Category-to-Department Auto-Routing', desc: 'Automated assignment of tickets to support staff based on department routing rules.' },
    { id: 'FR-3', title: 'SLA Monitoring & Flagging', desc: 'Automatic flagging of tickets exceeding predefined SLA thresholds and supervisor notification.' },
    { id: 'FR-4', title: 'Asset Request & Approval Workflow', desc: 'Admin and staff raising/approving hardware requests with Routine, Urgent, and Critical priorities.' },
    { id: 'FR-5', title: 'Hardware Asset Register', desc: 'Tracking hardware assignment, warranty expiry dates, and maintenance logs per department/user.' },
    { id: 'FR-6', title: 'Escalation & Queue Re-prioritization', desc: 'Critical and breached tickets automatically prioritized at the top of the agent queue.' },
    { id: 'FR-7', title: 'Real-Time Notifications', desc: 'In-app notification feed and simulated email/SMS delivery for status changes and SLA alerts.' },
    { id: 'FR-8', title: 'Admin Metrics & Analytics', desc: 'Administrative dashboard for ticket volume, MTTR, SLA compliance, and asset utilization.' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Course Mini Project Report Verification</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Enterprise IT Helpdesk & Asset Management System (ITSM)
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            BMS Institute of Technology & Management • Building Enterprise Applications (BCS703B)
          </p>
          <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs border border-white/20">
            <span className="text-sky-300 font-semibold">Under the Guidance of:</span>
            <span className="font-bold text-white">Mrs. Poornima GJ, Asst. Professor</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Team Members */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Project Team (Dept. of Information Science & Engineering)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.map((member) => (
                <div key={member.usn} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                  <p className="text-xs font-mono font-semibold text-sky-700">{member.usn}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Layer Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Multi-Tier Enterprise Architecture (Report Section 4)</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 flex items-start space-x-2">
                <span className="font-bold text-sky-900 shrink-0">Presentation:</span>
                <span className="text-sky-800">React 18 + Tailwind CSS + Lucide Icons (Responsive Role-based Dashboards)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 flex items-start space-x-2">
                <span className="font-bold text-blue-900 shrink-0">Application:</span>
                <span className="text-blue-800">Node.js + Express.js REST APIs with JWT & RBAC Middleware, SLA Engine & Auto-Routing</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-start space-x-2">
                <span className="font-bold text-emerald-900 shrink-0">Data Layer:</span>
                <span className="text-emerald-800">MongoDB Atlas / Mongoose + Embedded Resilient DataStore (Zero config required)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-100 flex items-start space-x-2">
                <span className="font-bold text-purple-900 shrink-0">Automation & AI:</span>
                <span className="text-purple-800">n8n Workflow Webhooks + Gemini AI Ticket Categorization & Escalation Rule Engine</span>
              </div>
            </div>
          </div>

          {/* Functional Requirements Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <span>SRS Functional Requirements Compliance (100% Implemented)</span>
            </h3>
            <div className="space-y-2">
              {frList.map((fr) => (
                <div key={fr.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-xs font-mono mr-1.5">{fr.id}:</span>
                    <span className="font-semibold text-slate-800 text-xs">{fr.title}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{fr.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

