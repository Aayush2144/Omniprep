import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTracker } from '../../context/TrackerContext.jsx';
import {
  Shield,
  Users,
  Clock,
  Zap,
  Activity,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  UserCheck,
  UserX,
  Send,
  Database,
  RotateCcw
} from 'lucide-react';

export const AdminDashboard = () => {
  const { currentUser, userProfile, isAdmin, updateUserProfileData } = useAuth();
  const { resetToZeroData } = useTracker();

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    liveUsers: 0,
    totalHours: 0,
    totalTodayHours: 0,
    recentUsers: []
  });
  const [usersList, setUsersList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [announcementType, setAnnouncementType] = useState('info'); // 'info' | 'alert' | 'motivation'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'user'
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch admin telemetry
  const fetchAdminData = async () => {
    try {
      const [metricRes, usersRes, annRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/users'),
        fetch('/api/community/announcements')
      ]);

      if (metricRes.ok) {
        const mJson = await metricRes.json();
        if (mJson.success) setMetrics(mJson.metrics);
      }

      if (usersRes.ok) {
        const uJson = await usersRes.json();
        if (uJson.success) setUsersList(uJson.users || []);
      }

      if (annRes.ok) {
        const aJson = await annRes.json();
        if (aJson.success) setAnnouncements(aJson.announcements || []);
      }
    } catch (err) {
      console.warn('[Admin] Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Promote / Demote Role
  const handleToggleRole = async (targetUid, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: targetUid, role: newRole })
      });
      if (res.ok) {
        setActionSuccess(`User role updated to ${newRole.toUpperCase()}`);
        fetchAdminData();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      alert('Failed to update role');
    }
  };

  // Broadcast Announcement
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newAnnouncement.trim(),
          type: announcementType,
          createdBy: currentUser?.displayName || 'Admin'
        })
      });
      if (res.ok) {
        setNewAnnouncement('');
        setActionSuccess('Global announcement published successfully!');
        fetchAdminData();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      alert('Failed to post announcement');
    }
  };

  // Toggle announcement active status
  const handleToggleAnnouncement = async (id, currentActive) => {
    try {
      const res = await fetch('/api/admin/toggle-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {}
  };

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.target_role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* Admin Top Header */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Platform Operations & Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            OmniPrep Admin Console 👑
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time multi-tenant telemetry, user permissions, and platform-wide broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* SECTION 1: PLATFORM TELEMETRY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {metrics.totalUsers}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>✓ Multi-tenant isolated databases</span>
          </div>
        </div>

        {/* Live Active Studiers */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Studying Live Right Now</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {metrics.liveUsers}
          </div>
          <div className="text-[11px] text-slate-400">
            Active heartbeat in last 5m
          </div>
        </div>

        {/* Platform Total Hours */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Study Hours Logged</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300">
            {metrics.totalHours} <span className="text-xs text-slate-400 font-normal">hrs</span>
          </div>
          <div className="text-[11px] text-amber-400">
            ⚡ {metrics.totalTodayHours} hrs today
          </div>
        </div>

        {/* Database Health */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>SQLite Database</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-sky-300">
            SQLite (WAL)
          </div>
          <div className="text-[11px] text-emerald-400">
            ● High-concurrency online
          </div>
        </div>

      </div>

      {/* SECTION 2: BROADCAST GLOBAL ANNOUNCEMENTS */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Broadcast Global Platform Announcement</h3>
              <p className="text-xs text-slate-400">Displays a real-time banner across all active users' headers</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePostAnnouncement} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="e.g. 📢 GATE DA Mock Exam #4 is now live for all scholars! Best of luck!"
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />

          <select
            value={announcementType}
            onChange={(e) => setAnnouncementType(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="info">Info (Blue)</option>
            <option value="alert">Alert (Rose)</option>
            <option value="motivation">Motivation (Amber)</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Broadcast</span>
          </button>
        </form>

        {/* Existing Announcements List */}
        {announcements.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-400">Active Broadcasts:</h4>
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2 h-2 rounded-full ${ann.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-white font-medium">{ann.message}</span>
                    <span className="text-[10px] text-slate-500 font-mono">by {ann.created_by}</span>
                  </div>

                  <button
                    onClick={() => handleToggleAnnouncement(ann.id, ann.active)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition ${
                      ann.active
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {ann.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: USER MANAGEMENT CONSOLE TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">User Management & Permissions</h3>
              <p className="text-xs text-slate-400">View registered scholars, study statistics, and assign Admin roles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email..."
                className="bg-slate-900/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only 👑</option>
              <option value="user">Scholars Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5 font-semibold">
                <tr>
                  <th className="px-4 py-3">Scholar</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Today</th>
                  <th className="px-4 py-3">Total Study</th>
                  <th className="px-4 py-3">Streak</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf = user.uid === currentUser?.uid;

                    return (
                      <tr key={user.uid} className="hover:bg-slate-900/40 transition">
                        
                        {/* User Profile */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                              alt={user.display_name}
                              className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-white/10"
                            />
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1">
                                <span>{user.display_name}</span>
                                {isSelf && <span className="text-[10px] text-indigo-400">(You)</span>}
                              </div>
                              <div className="text-[10px] text-slate-400">{user.target_role || 'Scholar'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                          {user.email || '—'}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          {user.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-fit">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-white/5 w-fit">
                              Scholar
                            </span>
                          )}
                        </td>

                        {/* Live Status */}
                        <td className="px-4 py-3">
                          {user.is_studying ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live Studying
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Offline / Idle</span>
                          )}
                        </td>

                        {/* Today Hours */}
                        <td className="px-4 py-3 font-mono text-white">
                          {user.today_hours || 0} hrs
                        </td>

                        {/* Total Hours */}
                        <td className="px-4 py-3 font-mono font-bold text-amber-300">
                          {user.total_hours || 0} hrs
                        </td>

                        {/* Streak */}
                        <td className="px-4 py-3 font-mono text-orange-400">
                          {user.streak || 0}d 🔥
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          {!isSelf ? (
                            <button
                              onClick={() => handleToggleRole(user.uid, user.role)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border transition ${
                                user.role === 'admin'
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
                              }`}
                            >
                              {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin 👑'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Current User</span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 4: DANGER ZONE (ADMIN ONLY) */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-950/30 via-slate-900/60 to-slate-900/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Admin Danger Zone</span>
            </div>
            <h3 className="text-base font-bold text-white">Reset Platform & Analytics State to Zero</h3>
            <p className="text-xs text-slate-400">
              Only accessible by verified Administrators. This clears your workspace logs and restores initial baseline.
            </p>
          </div>

          <button
            onClick={resetToZeroData}
            className="px-5 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Workspace Data to Zero</span>
          </button>
        </div>
      </div>

    </div>
  );
};
