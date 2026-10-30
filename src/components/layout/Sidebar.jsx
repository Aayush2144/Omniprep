import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
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
  Sparkles,
  Trophy,
  Users,
  Shield,
  Video
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, data } = useTracker();
  const { isAdmin } = useAuth();

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
      id: 'community',
      label: 'Community & Live Hall',
      icon: Trophy,
      desc: 'Live studiers & Leaderboards',
      badge: 'Live 🟢',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300 shadow-glow-academic'
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
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      color: 'text-sky-400',
      activeBg: 'bg-sky-600/15 border-sky-500/40 text-sky-300 shadow-glow-academic'
    },
    {
      id: 'interview',
      label: 'AI Live Interview Room',
      icon: Video,
      desc: 'Live 1-on-1 Meeting & Diagnostic Report',
      badge: 'Live Meet 🎥',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      color: 'text-purple-400',
      activeBg: 'bg-purple-600/15 border-purple-500/40 text-purple-300 shadow-glow-gate'
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
    }
  ];

  // If Admin, include Admin Console
  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Console 👑',
      icon: Shield,
      desc: 'Users, Telemetry & Broadcasts',
      badge: 'Admin',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      color: 'text-purple-400',
      activeBg: 'bg-purple-600/20 border-purple-500/50 text-purple-200'
    });
  }

  return (
    <aside className="w-64 lg:w-72 bg-[#060911] border-r border-white/5 flex flex-col justify-between p-4 shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-600/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">OmniPrep</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                Multi-User
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Routine & Mastery Suite</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 group text-left ${
                  isActive
                    ? `${item.activeBg} shadow-sm font-semibold`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`p-2 rounded-xl transition ${isActive ? 'bg-white/10 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-normal">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target Exam Countdown Widgets */}
      <div className="space-y-3 pt-6 border-t border-white/5">
        <div className="glass-panel p-3.5 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-950/20 to-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              GATE DA 2027
            </span>
            <span className="text-indigo-400 font-mono font-bold text-xs">{daysToGate} Days</span>
          </div>
          <div className="text-[11px] text-slate-400">Target Date: Feb 6, 2027</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-950/20 to-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Job Interview Sprint
            </span>
            <span className="text-amber-400 font-mono font-bold text-xs">{daysToInterview} Days</span>
          </div>
          <div className="text-[11px] text-slate-400">Target Date: Oct 15, 2026</div>
        </div>

        {/* User Card */}
        <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.profile?.name || 'Aayush'}`}
              alt="Avatar"
              className="w-full h-full rounded-full bg-slate-900 object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{data.profile?.name || 'Aayush Kumar'}</div>
            <div className="text-[10px] text-slate-500 truncate">{data.profile?.targetRole || 'Data Scientist'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
