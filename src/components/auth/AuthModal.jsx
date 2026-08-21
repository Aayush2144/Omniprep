import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Sparkles,
  X,
  Mail,
  Lock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Settings,
  Flame,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { getActiveFirebaseConfig, saveCustomFirebaseConfig, clearCustomFirebaseConfig } from '../../config/firebase.js';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    isFirebaseConfigured,
    authLoading
  } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'firebase_config'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetRole, setTargetRole] = useState('Data Scientist & AI');
  const [avatarSeed, setAvatarSeed] = useState('Scholar');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Firebase Config Form
  const currentConfig = getActiveFirebaseConfig();
  const [apiKeyInput, setApiKeyInput] = useState(currentConfig.apiKey || '');
  const [authDomainInput, setAuthDomainInput] = useState(currentConfig.authDomain || '');
  const [projectIdInput, setProjectIdInput] = useState(currentConfig.projectId || '');
  const [appIdInput, setAppIdInput] = useState(currentConfig.appId || '');

  if (!isAuthModalOpen) return null;

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
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
      await signupWithEmail(email, password, displayName, targetRole, avatarUrl);
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
    }
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim() || !projectIdInput.trim()) {
      setErrorMsg('API Key and Project ID are required for Firebase.');
      return;
    }
    saveCustomFirebaseConfig({
      apiKey: apiKeyInput.trim(),
      authDomain: authDomainInput.trim() || `${projectIdInput.trim()}.firebaseapp.com`,
      projectId: projectIdInput.trim(),
      storageBucket: `${projectIdInput.trim()}.appspot.com`,
      messagingSenderId: '123456789',
      appId: appIdInput.trim() || '1:123456789:web:abcdef'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c1222] border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">OmniPrep Multi-User Auth</h3>
              <p className="text-xs text-slate-400">
                {isFirebaseConfigured ? 'Firebase Live Authentication Active 🟢' : 'Multi-User Workspace & Profile System'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/5 text-xs font-semibold">
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
          <button
            onClick={() => { setAuthMode('firebase_config'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${authMode === 'firebase_config' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Firebase Config</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        {authMode !== 'firebase_config' && (
          <div className="space-y-3">
            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">or email</span>
              <div className="flex-1 border-t border-white/10" />
            </div>
          </div>
        )}

        {/* 1. SIGN IN VIEW */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 animate-fade-in">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
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
                  className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
            >
              <span>{authLoading ? 'Signing In...' : 'Sign In to OmniPrep'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 2. SIGN UP VIEW */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3 animate-fade-in">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Your Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rohit Sharma"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
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
                  className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
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
                  className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Target Role Selector */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Primary Target Goal</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Avatar Picker */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-slate-300 font-semibold">Choose Your Avatar</label>
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{authLoading ? 'Creating Account...' : 'Create Free Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 3. FIREBASE CONFIG EDITOR VIEW */}
        {authMode === 'firebase_config' && (
          <form onSubmit={handleSaveFirebaseConfig} className="space-y-3.5 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" /> Connect Your Firebase Project
                </span>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Paste your web credentials from your Firebase Project Settings $\rightarrow$ General $\rightarrow$ Your Apps.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Firebase apiKey</label>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">projectId</label>
              <input
                type="text"
                value={projectIdInput}
                onChange={(e) => setProjectIdInput(e.target.value)}
                placeholder="my-omniprep-app"
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">authDomain (Optional)</label>
                <input
                  type="text"
                  value={authDomainInput}
                  onChange={(e) => setAuthDomainInput(e.target.value)}
                  placeholder="app.firebaseapp.com"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">appId (Optional)</label>
                <input
                  type="text"
                  value={appIdInput}
                  onChange={(e) => setAppIdInput(e.target.value)}
                  placeholder="1:12345:web:abcdef"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={clearCustomFirebaseConfig}
                className="px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition"
              >
                Reset to Demo Auth
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                Save & Apply Config
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
