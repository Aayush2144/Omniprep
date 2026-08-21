import React, { Component } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { QuickTimerBar } from './components/layout/QuickTimerBar';
import { FocusTimerModal } from './components/timer/FocusTimerModal';
import { AuthModal } from './components/auth/AuthModal';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { GateDashboard } from './components/gate/GateDashboard';
import { AcademicDashboard } from './components/academic/AcademicDashboard';
import { JobDashboard } from './components/job/JobDashboard';
import { EnglishDashboard } from './components/english/EnglishDashboard';
import { MasterAnalytics } from './components/analytics/MasterAnalytics';
import { CommunityHub } from './components/community/CommunityHub';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong while rendering</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 font-mono">
            {this.state.error?.message || 'Unknown error occurred.'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Data & Reload</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const { activeTab } = useTracker();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {activeTab === 'dashboard' && <OverviewDashboard />}
          {activeTab === 'community' && <CommunityHub />}
          {activeTab === 'gate' && <GateDashboard />}
          {activeTab === 'academic' && <AcademicDashboard />}
          {activeTab === 'job' && <JobDashboard />}
          {activeTab === 'english' && <EnglishDashboard />}
          {activeTab === 'analytics' && <MasterAnalytics />}
          {activeTab === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Persistent Global Focus Timer & Auth Modal */}
      <FocusTimerModal />
      <QuickTimerBar />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TrackerProvider>
          <AppContent />
        </TrackerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
