import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  LayoutDashboard,
  Cpu,
  GraduationCap,
  Briefcase,
  Mic,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, data } = useTracker();

  // Compute countdown to GATE Exam
  const getDaysRemaining = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysToGate = getDaysRemaining(data.profile?.gateExamDate || '2027-02-06');
  const daysToInterview = getDaysRemaining(data.profile?.interviewSprintDate || '2026-10-15');

  const pendingAssignments = (data.academic?.assignments || []).filter(a => a.status === 'Pending').length;
  const dsRevCount = (data.job?.dsRevision?.topics || []).filter(t => t.status === 'Interview Ready').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview & Routines',
      icon: LayoutDashboard,
      desc: 'Unified daily command center',
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
    },
    {
      id: 'gate',
      label: 'GATE DS & AI Hub',
      icon: Cpu,
      desc: 'Syllabus, PYQs & Mocks',
      badge: `${data.gate?.dailyQuestionSolvedToday || 0}/${data.gate?.dailyQuestionTarget || 35} Qs`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300 shadow-glow-gate'
    },
    {
      id: 'academic',
      label: 'Academic Hub',
      icon: GraduationCap,
      desc: 'Semester, GPA & Labs',
      badge: pendingAssignments > 0 ? `${pendingAssignments} Due` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300 shadow-glow-academic'
    },
    {
      id: 'job',
      label: 'Job Prep & DS Revision',
      icon: Briefcase,
      desc: 'DSA, DS Concepts, Kanban',
      badge: `${dsRevCount} DS Topics`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      color: 'text-amber-400',
      activeBg: 'bg-amber-600/15 border-amber-500/40 text-amber-300 shadow-glow-job'
    },
    {
      id: 'english',
      label: 'English Speaking Hub',
      icon: Mic,
      desc: 'Fluency, Voice Memos, Vocab',
      badge: `${data.english?.minutesPracticedToday || 0}m Today`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      color: 'text-rose-400',
      activeBg: 'bg-rose-600/15 border-rose-500/40 text-rose-300 shadow-glow-english'
    },
    {
      id: 'analytics',
      label: 'Deep Analytics Suite',
      icon: BarChart3,
      desc: 'Separate & Master Reports',
      badge: 'Interactive',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-600/15 border-cyan-500/40 text-cyan-300'
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#0c121e]/90 border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
      {/* Brand & Logo */}
      <div>
        <div className="flex items-center space-x-3 px-3 py-3 mb-6 bg-slate-900/60 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
              OmniPrep <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400">Mastery Routine Suite</p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="space-y-1.5">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Preparation Pillars
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group ${
                  isActive
                    ? `${item.activeBg} border`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? item.color : 'text-slate-400'}`} />
                  <div>
                    <div className={isActive ? 'text-white font-semibold' : 'text-slate-300'}>{item.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                  </div>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Milestones & Target Countdown */}
      <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
        <div className="bg-slate-900/80 border border-white/5 p-3 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> GATE DS Exam</span>
            <span className="font-mono text-indigo-400 font-semibold">{daysToGate}d left</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interview Sprint</span>
            <span className="font-mono text-amber-400 font-semibold">{daysToInterview}d left</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {data.profile?.name ? data.profile.name.charAt(0) : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{data.profile?.name || 'Aayush Kumar'}</div>
            <div className="text-[10px] text-slate-400 truncate">Target: {data.profile?.targetRole || 'Data Scientist'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
