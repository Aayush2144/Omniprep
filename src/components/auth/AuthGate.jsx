import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Layers,
  Sparkles,
  Mail,
  Lock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Cpu,
  GraduationCap,
  Briefcase,
  Mic,
  Trophy,
  Users,
  Flame,
  Zap
} from 'lucide-react';

export const AuthGate = () => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, authLoading } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetRole, setTargetRole] = useState('Data Scientist & AI');
  const [avatarSeed, setAvatarSeed] = useState('Scholar');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const targetRoles = [
    'Data Scientist & AI',
    'Machine Learning Engineer',
    'GATE DA / CS Aspirant',
    'Deep Learning Researcher',
    'Software & Data Engineer'
  ];

  const avatarSeeds = ['Aayush', 'Sophia', 'Alex', 'Elena', 'Rahul', 'Zoe', 'Leo', 'Maya'];

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
      await signupWithEmail(email, password, displayName, targetRole, avatarUrl);
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      
      {/* Container Box */}
      <div className="w-full max-w-5xl bg-[#0a0f1d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* LEFT COLUMN: HERO SHOWCASE (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/80 via-purple-950/50 to-slate-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="space-y-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                  <Layers className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">OmniPrep Suite</h1>
                <p className="text-xs text-indigo-300 font-medium">Preparation & Routine Hub</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white leading-snug">
                Your Complete Preparation Command Center 🎯
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Join thousands of scholars preparing for GATE DS & AI, Academic Coursework, Technical Job Interviews, and English Fluency with Gemini AI.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-200">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <span>Full GATE DS & AI Syllabus & Mock Analyzer</span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-200">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>Gemini AI Mock Interviews with Live Audio Voice</span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-200">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Users className="w-4 h-4" />
                </div>
                <span>"Who Is Studying Live" Presence & Global Leaderboards</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Tag */}
          <div className="pt-6 relative z-10 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>● Isolated Cloud Database</span>
            <span>● 100% Free Access</span>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION FORM (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          
          {/* Header Title */}
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">
              {authMode === 'login' ? 'Welcome Back, Scholar 👋' : 'Create Your Scholar Account 🚀'}
            </h3>
            <p className="text-xs text-slate-400">
              {authMode === 'login'
                ? 'Sign in to access your personal syllabus, routine tracker, and AI studios.'
                : 'Set up your profile to start tracking your preparation today.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-white/10 text-xs font-semibold">
            <button
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition ${authMode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition ${authMode === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Continue with Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={authLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-850 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-semibold text-white transition flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">or with email</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* 1. SIGN IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full bg-slate-950 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <span>{authLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Your Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Aayush Kumar"
                    className="w-full bg-slate-950 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full bg-slate-950 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-950 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Target Role Selector */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Primary Target Goal</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Avatar Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs text-slate-300 font-semibold">Select Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {avatarSeeds.map((seed) => {
                    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    const isSelected = avatarSeed === seed;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setAvatarSeed(seed)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition shrink-0 ${isSelected ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={url} alt={seed} className="w-full h-full object-cover bg-slate-800" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2"
              >
                <span>{authLoading ? 'Creating Workspace...' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
