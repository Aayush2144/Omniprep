import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'omniprep.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  // 1. Multi-User Core Profile Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      email TEXT,
      display_name TEXT,
      photo_url TEXT,
      target_role TEXT DEFAULT 'Data Scientist',
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_studying INTEGER DEFAULT 0,
      current_task TEXT,
      current_category TEXT,
      timer_remaining_sec INTEGER DEFAULT 0,
      today_hours REAL DEFAULT 0,
      total_hours REAL DEFAULT 0,
      streak INTEGER DEFAULT 0,
      gate_progress REAL DEFAULT 0,
      dsa_solved INTEGER DEFAULT 0
    );
  `);

  // 2. Per-User State Snapshot Table (Multi-tenant isolated storage)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_state (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Fallback Legacy App State Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Platform Broadcast Announcements (Admin notifications)
  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      active INTEGER DEFAULT 1
    );
  `);

  // Relational Tables for queryable logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      user_id TEXT,
      date TEXT,
      gate_hours REAL DEFAULT 0,
      academic_hours REAL DEFAULT 0,
      job_hours REAL DEFAULT 0,
      english_hours REAL DEFAULT 0,
      total_hours REAL DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      streak_active INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, date)
    );
  `);

  // Seed default admin and demo community users if empty
  seedDefaultCommunityUsers();

  console.log(`[Database] Multi-Tenant SQLite Database initialized at ${DB_PATH}`);
}

// Seed active community members for rich live study hall and leaderboard experience
function seedDefaultCommunityUsers() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
  if (count.cnt === 0) {
    const seedStmt = db.prepare(`
      INSERT OR IGNORE INTO users (uid, email, display_name, photo_url, target_role, role, last_active, is_studying, current_task, current_category, timer_remaining_sec, today_hours, total_hours, streak, gate_progress, dsa_solved)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    seedStmt.run('demo-admin-1', 'admin@omniprep.io', 'OmniAdmin 👑', 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin', 'Lead AI Scientist', 'admin', 1, 'Reviewing Transformer Attention Math', 'gate', 850, 4.5, 92.5, 18, 74, 185);
    seedStmt.run('demo-user-1', 'rohit.gate@gmail.com', 'Rohit Sharma ⚡', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit', 'GATE DA AIR < 50', 'user', 1, 'Solving Linear Algebra Eigenvalues', 'gate', 1140, 5.2, 88.0, 14, 68, 140);
    seedStmt.run('demo-user-2', 'priya.ds@ai.org', 'Priya Patel 🚀', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 'ML Engineer @ Google', 'user', 1, 'Deep Learning Backprop Mock Interview', 'job', 920, 3.8, 64.5, 9, 52, 95);
    seedStmt.run('demo-user-3', 'ananya.english@gmail.com', 'Ananya Roy 🎙️', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', 'Applied Scientist', 'user', 1, 'Pronunciation & Pitch Practice with AI', 'english', 600, 2.5, 41.0, 6, 30, 45);
    seedStmt.run('demo-user-4', 'vikram.tech@outlook.com', 'Vikram Sen 💻', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', 'Data Engineer', 'user', 0, 'Completed LeetCode Hard DP', 'job', 0, 1.8, 35.0, 5, 25, 60);

    // Initial default announcement
    db.prepare(`
      INSERT OR IGNORE INTO announcements (id, message, type, created_by, active)
      VALUES ('ann-1', '🚀 Welcome to OmniPrep! Join live study sessions, climb the leaderboard, and prepare together!', 'info', 'Admin', 1)
    `).run();
  }
}

// ----------------------------------------------------
// USER & PROFILE MANAGEMENT
// ----------------------------------------------------

export function registerOrUpdateUser(userData) {
  if (!userData || !userData.uid) return null;

  const existing = db.prepare('SELECT * FROM users WHERE uid = ?').get(userData.uid);
  const now = new Date().toISOString();

  if (existing) {
    const stmt = db.prepare(`
      UPDATE users SET
        email = COALESCE(?, email),
        display_name = COALESCE(?, display_name),
        photo_url = COALESCE(?, photo_url),
        target_role = COALESCE(?, target_role),
        last_active = ?,
        today_hours = COALESCE(?, today_hours),
        total_hours = COALESCE(?, total_hours),
        streak = COALESCE(?, streak)
      WHERE uid = ?
    `);
    stmt.run(
      userData.email || existing.email,
      userData.displayName || existing.display_name,
      userData.photoURL || existing.photo_url,
      userData.targetRole || existing.target_role,
      now,
      userData.todayHours ?? existing.today_hours,
      userData.totalHours ?? existing.total_hours,
      userData.streak ?? existing.streak,
      userData.uid
    );
    return db.prepare('SELECT * FROM users WHERE uid = ?').get(userData.uid);
  } else {
    // First user or specific emails can be auto-admin
    const isAdmin = userData.email?.includes('admin') || userData.role === 'admin' ? 'admin' : 'user';
    const stmt = db.prepare(`
      INSERT INTO users (uid, email, display_name, photo_url, target_role, role, last_active, created_at, today_hours, total_hours, streak)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      userData.uid,
      userData.email || 'user@omniprep.io',
      userData.displayName || 'Prep Scholar',
      userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.uid}`,
      userData.targetRole || 'Data Scientist',
      isAdmin,
      now,
      now,
      userData.todayHours || 0,
      userData.totalHours || 0,
      userData.streak || 0
    );
    return db.prepare('SELECT * FROM users WHERE uid = ?').get(userData.uid);
  }
}

export function getUserById(uid) {
  return db.prepare('SELECT * FROM users WHERE uid = ?').get(uid);
}

export function getAllUsers() {
  return db.prepare('SELECT * FROM users ORDER BY last_active DESC').all();
}

export function setUserRole(uid, role) {
  db.prepare('UPDATE users SET role = ? WHERE uid = ?').run(role, uid);
  return db.prepare('SELECT * FROM users WHERE uid = ?').get(uid);
}

// ----------------------------------------------------
// MULTI-TENANT USER STATE (ISOLATED SYNC)
// ----------------------------------------------------

export function getUserState(userId, defaultData) {
  if (!userId) return getAppState(defaultData);

  const row = db.prepare('SELECT data FROM user_state WHERE user_id = ?').get(userId);
  if (row && row.data) {
    try {
      return JSON.parse(row.data);
    } catch (e) {
      console.error(`[Database] Failed to parse state for user ${userId}:`, e);
    }
  }

  // If new user, seed with default clean zero data
  if (defaultData) {
    saveUserState(userId, defaultData);
  }
  return defaultData;
}

export function saveUserState(userId, state) {
  if (!userId || !state || typeof state !== 'object') return;
  const jsonStr = JSON.stringify(state);

  const stmt = db.prepare(`
    INSERT INTO user_state (user_id, data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, jsonStr);

  // Update user telemetric metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const logs = state.activityLogs || [];
  const todayLog = logs.find(l => l.date === todayStr) || { total: 0 };
  const totalHours = logs.reduce((sum, l) => sum + (l.total || 0), 0);
  const streak = state.profile?.currentStreak || 0;
  const targetRole = state.profile?.targetRole || 'Data Scientist';
  const displayName = state.profile?.name || 'Prep Scholar';

  db.prepare(`
    UPDATE users SET
      display_name = COALESCE(?, display_name),
      target_role = COALESCE(?, target_role),
      today_hours = ?,
      total_hours = ?,
      streak = ?,
      last_active = CURRENT_TIMESTAMP
    WHERE uid = ?
  `).run(displayName, targetRole, todayLog.total || 0, totalHours, streak, userId);
}

// Legacy fallback methods
export function getAppState(defaultData) {
  const row = db.prepare('SELECT data FROM app_state WHERE id = ?').get('current_state');
  if (row && row.data) {
    try {
      return JSON.parse(row.data);
    } catch (e) {}
  }
  return defaultData;
}

export function saveAppState(state) {
  if (!state || typeof state !== 'object') return;
  const jsonStr = JSON.stringify(state);
  db.prepare(`
    INSERT INTO app_state (id, data, updated_at)
    VALUES ('current_state', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
  `).run(jsonStr);
}

export function resetDatabase(zeroData) {
  db.exec('DELETE FROM app_state');
  saveAppState(zeroData);
}

// ----------------------------------------------------
// REAL-TIME PRESENCE & "WHO IS STUDYING LIVE"
// ----------------------------------------------------

export function updateUserPresence(uid, presence) {
  if (!uid) return;
  const { isStudying = false, category = 'gate', task = 'Focus Session', remainingSec = 0 } = presence || {};
  
  db.prepare(`
    UPDATE users SET
      is_studying = ?,
      current_category = ?,
      current_task = ?,
      timer_remaining_sec = ?,
      last_active = CURRENT_TIMESTAMP
    WHERE uid = ?
  `).run(isStudying ? 1 : 0, category, task, remainingSec, uid);
}

export function getLiveStudyingUsers() {
  // Live users active within the last 5 minutes and is_studying = 1
  return db.prepare(`
    SELECT uid, display_name, photo_url, target_role, current_category, current_task, timer_remaining_sec, today_hours, streak, last_active
    FROM users
    WHERE is_studying = 1 AND last_active >= datetime('now', '-10 minute')
    ORDER BY last_active DESC
  `).all();
}

// ----------------------------------------------------
// GLOBAL LEADERBOARD & COMMUNITY RANKINGS
// ----------------------------------------------------

export function getLeaderboard() {
  const todayRankings = db.prepare(`
    SELECT uid, display_name, photo_url, target_role, today_hours as score, streak, is_studying, current_category
    FROM users
    ORDER BY today_hours DESC, total_hours DESC
    LIMIT 20
  `).all();

  const totalRankings = db.prepare(`
    SELECT uid, display_name, photo_url, target_role, total_hours as score, streak, is_studying, current_category
    FROM users
    ORDER BY total_hours DESC
    LIMIT 20
  `).all();

  const streakRankings = db.prepare(`
    SELECT uid, display_name, photo_url, target_role, streak as score, total_hours, is_studying
    FROM users
    ORDER BY streak DESC, total_hours DESC
    LIMIT 20
  `).all();

  return {
    today: todayRankings,
    allTime: totalRankings,
    streaks: streakRankings
  };
}

// ----------------------------------------------------
// ADMIN TELEMETRY & METRICS
// ----------------------------------------------------

export function getAdminMetrics() {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const liveUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_studying = 1 AND last_active >= datetime('now', '-10 minute')").get().count;
  const totalHours = db.prepare('SELECT SUM(total_hours) as total FROM users').get().total || 0;
  const totalTodayHours = db.prepare('SELECT SUM(today_hours) as total FROM users').get().total || 0;
  
  const recentUsers = db.prepare(`
    SELECT uid, email, display_name, photo_url, target_role, role, created_at, last_active, is_studying, today_hours, total_hours, streak
    FROM users
    ORDER BY last_active DESC
    LIMIT 50
  `).all();

  return {
    totalUsers,
    liveUsers,
    totalHours: parseFloat(Number(totalHours).toFixed(1)),
    totalTodayHours: parseFloat(Number(totalTodayHours).toFixed(1)),
    recentUsers
  };
}

// ----------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------

export function getActiveAnnouncements() {
  return db.prepare('SELECT * FROM announcements WHERE active = 1 ORDER BY created_at DESC LIMIT 5').all();
}

export function createAnnouncement(message, type = 'info', createdBy = 'Admin') {
  const id = `ann-${Date.now()}`;
  db.prepare(`
    INSERT INTO announcements (id, message, type, created_by, active)
    VALUES (?, ?, ?, ?, 1)
  `).run(id, message, type, createdBy);
  return getActiveAnnouncements();
}

export function toggleAnnouncement(id, active) {
  db.prepare('UPDATE announcements SET active = ? WHERE id = ?').run(active ? 1 : 0, id);
  return getActiveAnnouncements();
}

export default db;
