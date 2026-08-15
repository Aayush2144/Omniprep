import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  Briefcase,
  BrainCircuit,
  Code,
  Layers,
  BarChart2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Bot
} from 'lucide-react';
import { DataScienceRevision } from './DataScienceRevision.jsx';
import { DsaTracker } from './DsaTracker.jsx';
import { ApplicationKanban } from './ApplicationKanban.jsx';
import { AiInterviewStudio } from './AiInterviewStudio.jsx';
import { calculateJobAnalytics } from '../../utils/analyticsCalculators.js';

export const JobDashboard = () => {
  const { data, setActiveTab, setAnalyticsCategory } = useTracker();
  const [subTab, setSubTab] = useState('aiInterview'); // 'aiInterview' | 'dsRevision' | 'dsa' | 'kanban'
  const analytics = calculateJobAnalytics(data.job, data.activityLogs);

  const goToJobAnalytics = () => {
    setAnalyticsCategory('job');
    setActiveTab('analytics');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/20 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Job & Career Preparation Hub</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Target: {data.profile?.targetRole || 'Data Scientist'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gemini AI Mock Interviews, Data Science Revision, DSA / LeetCode & Application Kanban
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToJobAnalytics}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Job Prep Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DS Revision Progress */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">DS Revision Coverage</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {analytics.revisionProgress}%
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${analytics.revisionProgress}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            {analytics.readyTopics} of {analytics.dsTopicsCount} topics interview ready
          </div>
        </div>

        {/* DSA Problems Solved */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">DSA Problems Solved</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {analytics.totalDsaSolved} <span className="text-xs font-normal text-slate-400">/ {analytics.dsaTarget}</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            Target: 300 Problems (LeetCode)
          </div>
        </div>

        {/* Applications */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Active Applications</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {(data.job?.applications || []).length} Companies
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pipeline Tracking
          </div>
        </div>

        {/* AI Mock Interview Feature Badge */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Gemini AI Interviewer
          </div>
          <div className="text-sm font-bold text-white mt-1">
            Speech & Rubric Feedback
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verbal viva + technical critique
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setSubTab('aiInterview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
            subTab === 'aiInterview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>🤖 AI Mock Interview Studio (Gemini)</span>
        </button>

        <button
          onClick={() => setSubTab('dsRevision')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
            subTab === 'dsRevision'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Data Science Revision & Flashcards</span>
        </button>

        <button
          onClick={() => setSubTab('dsa')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
            subTab === 'dsa'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>DSA / LeetCode Tracker</span>
        </button>

        <button
          onClick={() => setSubTab('kanban')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
            subTab === 'kanban'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Application Kanban</span>
        </button>
      </div>

      {/* Sub-Tab View Rendering */}
      <div>
        {subTab === 'aiInterview' && <AiInterviewStudio />}
        {subTab === 'dsRevision' && <DataScienceRevision />}
        {subTab === 'dsa' && <DsaTracker />}
        {subTab === 'kanban' && <ApplicationKanban />}
      </div>

    </div>
  );
};
