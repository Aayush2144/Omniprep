import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  Briefcase,
  Plus,
  Building,
  Calendar,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Trash2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const ApplicationKanban = () => {
  const { data, addJobApplication, updateJobAppStatus, deleteJobApplication, deleteRejectedApplications } = useTracker();
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Data Scientist');
  const [pack, setPack] = useState('₹25 LPA');
  const [status, setStatus] = useState('Applied');
  const [nextStep, setNextStep] = useState('');

  const applications = data.job?.applications || [];
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

  const columns = [
    { id: 'Wishlist', label: 'Wishlist', color: 'border-slate-500/30 text-slate-300' },
    { id: 'Applied', label: 'Applied', color: 'border-blue-500/30 text-blue-300' },
    { id: 'Online Assessment', label: 'OA / Test', color: 'border-purple-500/30 text-purple-300' },
    { id: 'Interview', label: 'Interviewing', color: 'border-amber-500/30 text-amber-300' },
    { id: 'Offer', label: 'Offer Received', color: 'border-emerald-500/30 text-emerald-300' },
    { id: 'Rejected', label: 'Rejected', color: 'border-rose-500/30 text-rose-400' },
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!company.trim()) return;
    addJobApplication({
      company: company.trim(),
      role: role.trim(),
      package: pack.trim(),
      status,
      nextStep: nextStep.trim() || 'Awaiting response.'
    });
    setCompany('');
    setNextStep('');
    setIsAdding(false);
  };

  const nextStatusMap = {
    'Wishlist': 'Applied',
    'Applied': 'Online Assessment',
    'Online Assessment': 'Interview',
    'Interview': 'Offer',
    'Offer': 'Offer',
    'Rejected': 'Rejected'
  };

  const handleDelete = (appId, companyName) => {
    if (window.confirm(`Delete application for ${companyName}?`)) {
      deleteJobApplication(appId);
    }
  };

  const handleClearAllRejected = () => {
    if (window.confirm(`Are you sure you want to delete all ${rejectedCount} rejected applications?`)) {
      deleteRejectedApplications();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-300">
            Application Pipeline ({applications.length} Tracked)
          </h4>
          <p className="text-[11px] text-slate-500">Manage recruitment stages, mark rejections and remove expired applications</p>
        </div>

        <div className="flex items-center space-x-2">
          {rejectedCount > 0 && (
            <button
              onClick={handleClearAllRejected}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
              title="Delete all rejected job applications"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Rejected ({rejectedCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-900/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Add Form Modal */}
      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-3 animate-slide-up">
          <h4 className="text-xs font-semibold text-white">Record New Job Application</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              placeholder="Company Name (e.g. Google, DeepMind)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
            <input
              type="text"
              placeholder="Role (e.g. Applied Scientist I)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Package (e.g. ₹32 LPA)"
              value={pack}
              onChange={(e) => setPack(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input
              type="text"
              placeholder="Next Step / Follow-up Notes (e.g. OA completed, technical interview on Aug 25)"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold">Save Application</button>
          </div>
        </form>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
        {columns.map((col) => {
          const colApps = applications.filter(a => a.status === col.id);
          const isRejectedCol = col.id === 'Rejected';

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-3 flex flex-col min-h-[360px] ${
                isRejectedCol ? 'bg-rose-950/20 border-rose-500/20' : 'bg-slate-900/60 border-white/5'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-0.5">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className={`glass-panel p-3.5 rounded-xl border space-y-2 transition ${
                      isRejectedCol ? 'border-rose-500/30 bg-rose-950/20' : 'border-white/5 hover:border-amber-500/30'
                    }`}
                  >
                    {/* Company & Role */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-white truncate">{app.company}</h5>
                        <div className="text-[10px] text-slate-400 truncate">{app.role}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(app.id, app.company)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
                        title="Delete application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Package */}
                    {app.package && (
                      <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                        {app.package}
                      </div>
                    )}

                    {/* Notes */}
                    {app.nextStep && (
                      <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-white/5 line-clamp-2">
                        {app.nextStep}
                      </div>
                    )}

                    {/* Move / Reject Actions */}
                    <div className="pt-1 flex flex-col gap-1">
                      {col.id !== 'Offer' && col.id !== 'Rejected' && (
                        <button
                          onClick={() => updateJobAppStatus(app.id, nextStatusMap[col.id])}
                          className="w-full py-1 bg-slate-800 hover:bg-amber-600/30 text-amber-300 rounded text-[10px] font-medium transition flex items-center justify-center gap-1"
                        >
                          <span>Advance to {nextStatusMap[col.id]}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      {col.id !== 'Rejected' && col.id !== 'Offer' && (
                        <button
                          onClick={() => updateJobAppStatus(app.id, 'Rejected')}
                          className="w-full py-0.5 text-slate-500 hover:text-rose-400 rounded text-[9px] transition flex items-center justify-center gap-1 hover:bg-rose-500/10"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Mark as Rejected</span>
                        </button>
                      )}

                      {isRejectedCol && (
                        <button
                          onClick={() => handleDelete(app.id, app.company)}
                          className="w-full py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-[10px] font-medium transition flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Rejected</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="text-[11px] text-slate-600 text-center py-10">No applications</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
