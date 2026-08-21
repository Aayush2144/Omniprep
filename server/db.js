import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
const isPostgres = Boolean(DATABASE_URL);

let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  console.log('[Database] 🐘 Cloud PostgreSQL mode detected via DATABASE_URL');
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
} else {
  const DB_PATH = path.join(__dirname, 'omniprep.db');
  console.log(`[Database] 💾 Local SQLite mode initialized at ${DB_PATH}`);
  sqliteDb = new Database(DB_PATH);
  sqliteDb.pragma('journal_mode = WAL');
}

// ----------------------------------------------------
// DATABASE INITIALIZATION & SCHEMA
// ----------------------------------------------------

export async function initDatabase() {
  if (isPostgres) {
    // PostgreSQL Schema
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255),
        display_name VARCHAR(255),
        photo_url TEXT,
        target_role VARCHAR(255) DEFAULT 'Data Scientist',
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_studying INTEGER DEFAULT 0,
        current_task TEXT,
        current_category VARCHAR(100),
        timer_remaining_sec INTEGER DEFAULT 0,
        today_hours NUMERIC DEFAULT 0,
        total_hours NUMERIC DEFAULT 0,
        streak INTEGER DEFAULT 0,
        gate_progress NUMERIC DEFAULT 0,
        dsa_solved INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_state (
        user_id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_state (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(100) PRIMARY KEY,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1
      );
    `);

    // Seed initial community data if empty
    const checkUsers = await pgPool.query('SELECT COUNT(*) as cnt FROM users');
    if (parseInt(checkUsers.rows[0].cnt, 10) === 0) {
      await pgPool.query(`
        INSERT INTO users (uid, email, display_name, photo_url, target_role, role, last_active, is_studying, current_task, current_category, timer_remaining_sec, today_hours, total_hours, streak)
        VALUES
          ('demo-admin-1', 'admin@omniprep.io', 'OmniAdmin 👑', 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin', 'Lead AI Scientist', 'admin', NOW(), 1, 'Reviewing Transformer Attention Math', 'gate', 850, 4.5, 92.5, 18),
          ('demo-user-1', 'rohit.gate@gmail.com', 'Rohit Sharma ⚡', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit', 'GATE DA AIR < 50', 'user', NOW(), 1, 'Solving Linear Algebra Eigenvalues', 'gate', 1140, 5.2, 88.0, 14),
          ('demo-user-2', 'priya.ds@ai.org', 'Priya Patel 🚀', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 'ML Engineer @ Google', 'user', NOW(), 1, 'Deep Learning Backprop Mock Interview', 'job', 920, 3.8, 64.5, 9),
          ('demo-user-3', 'ananya.english@gmail.com', 'Ananya Roy 🎙️', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', 'Applied Scientist', 'user', NOW(), 1, 'Pronunciation & Pitch Practice with AI', 'english', 600, 2.5, 41.0, 6),
          ('demo-user-4', 'vikram.tech@outlook.com', 'Vikram Sen 💻', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', 'Data Engineer', 'user', NOW(), 0, 'Completed LeetCode Hard DP', 'job', 0, 1.8, 35.0, 5)
        ON CONFLICT (uid) DO NOTHING;
      `);

      await pgPool.query(`
        INSERT INTO announcements (id, message, type, created_by, active)
        VALUES ('ann-1', '🚀 Welcome to OmniPrep! Join live study sessions, climb the leaderboard, and prepare together!', 'info', 'Admin', 1)
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    console.log('[Database] 🐘 Cloud PostgreSQL tables verified & ready!');
  } else {
    // SQLite Schema
    sqliteDb.exec(`
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

      CREATE TABLE IF NOT EXISTS user_state (
        user_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_state (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1
      );
    `);

    // Seed default SQLite community members
    const count = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM users').get();
    if (count.cnt === 0) {
      const seedStmt = sqliteDb.prepare(`
        INSERT OR IGNORE INTO users (uid, email, display_name, photo_url, target_role, role, last_active, is_studying, current_task, current_category, timer_remaining_sec, today_hours, total_hours, streak)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?)
      `);

      seedStmt.run('demo-admin-1', 'admin@omniprep.io', 'OmniAdmin 👑', 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin', 'Lead AI Scientist', 'admin', 1, 'Reviewing Transformer Attention Math', 'gate', 850, 4.5, 92.5, 18);
      seedStmt.run('demo-user-1', 'rohit.gate@gmail.com', 'Rohit Sharma ⚡', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit', 'GATE DA AIR < 50', 'user', 1, 'Solving Linear Algebra Eigenvalues', 'gate', 1140, 5.2, 88.0, 14);
      seedStmt.run('demo-user-2', 'priya.ds@ai.org', 'Priya Patel 🚀', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 'ML Engineer @ Google', 'user', 1, 'Deep Learning Backprop Mock Interview', 'job', 920, 3.8, 64.5, 9);
      seedStmt.run('demo-user-3', 'ananya.english@gmail.com', 'Ananya Roy 🎙️', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', 'Applied Scientist', 'user', 1, 'Pronunciation & Pitch Practice with AI', 'english', 600, 2.5, 41.0, 6);
      seedStmt.run('demo-user-4', 'vikram.tech@outlook.com', 'Vikram Sen 💻', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', 'Data Engineer', 'user', 0, 'Completed LeetCode Hard DP', 'job', 0, 1.8, 35.0, 5);

      sqliteDb.prepare(`
        INSERT OR IGNORE INTO announcements (id, message, type, created_by, active)
        VALUES ('ann-1', '🚀 Welcome to OmniPrep! Join live study sessions, climb the leaderboard, and prepare together!', 'info', 'Admin', 1)
      `).run();
    }
  }
}

// ----------------------------------------------------
// USER & PROFILE MANAGEMENT
// ----------------------------------------------------

export async function registerOrUpdateUser(userData) {
  if (!userData || !userData.uid) return null;

  const isAdmin = userData.email?.includes('admin') || userData.role === 'admin' ? 'admin' : 'user';

  if (isPostgres) {
    const res = await pgPool.query(`
      INSERT INTO users (uid, email, display_name, photo_url, target_role, role, last_active, today_hours, total_hours, streak)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)
      ON CONFLICT (uid) DO UPDATE SET
        email = COALESCE($2, users.email),
        display_name = COALESCE($3, users.display_name),
        photo_url = COALESCE($4, users.photo_url),
        target_role = COALESCE($5, users.target_role),
        last_active = NOW()
      RETURNING *;
    `, [
      userData.uid,
      userData.email || 'user@omniprep.io',
      userData.displayName || 'Prep Scholar',
      userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.uid}`,
      userData.targetRole || 'Data Scientist',
      isAdmin,
      userData.todayHours || 0,
      userData.totalHours || 0,
      userData.streak || 0
    ]);
    return res.rows[0];
  } else {
    const existing = sqliteDb.prepare('SELECT * FROM users WHERE uid = ?').get(userData.uid);
    const now = new Date().toISOString();

    if (existing) {
      sqliteDb.prepare(`
        UPDATE users SET
          email = COALESCE(?, email),
          display_name = COALESCE(?, display_name),
          photo_url = COALESCE(?, photo_url),
          target_role = COALESCE(?, target_role),
          last_active = ?
        WHERE uid = ?
      `).run(
        userData.email || existing.email,
        userData.displayName || existing.display_name,
        userData.photoURL || existing.photo_url,
        userData.targetRole || existing.target_role,
        now,
        userData.uid
      );
      return sqliteDb.prepare('SELECT * FROM users WHERE uid = ?').get(userData.uid);
    } else {
      sqliteDb.prepare(`
        INSERT INTO users (uid, email, display_name, photo_url, target_role, role, last_active, created_at, today_hours, total_hours, streak)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
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
      return sqliteDb.prepare('SELECT * FROM users WHERE uid = ?').get(userData.uid);
    }
  }
}

export async function getAllUsers() {
  if (isPostgres) {
    const res = await pgPool.query('SELECT * FROM users ORDER BY last_active DESC');
    return res.rows;
  } else {
    return sqliteDb.prepare('SELECT * FROM users ORDER BY last_active DESC').all();
  }
}

export async function setUserRole(uid, role) {
  if (isPostgres) {
    const res = await pgPool.query('UPDATE users SET role = $1 WHERE uid = $2 RETURNING *', [role, uid]);
    return res.rows[0];
  } else {
    sqliteDb.prepare('UPDATE users SET role = ? WHERE uid = ?').run(role, uid);
    return sqliteDb.prepare('SELECT * FROM users WHERE uid = ?').get(uid);
  }
}

// ----------------------------------------------------
// MULTI-TENANT USER STATE (ISOLATED SYNC)
// ----------------------------------------------------

export async function getUserState(userId, defaultData) {
  if (!userId) return getAppState(defaultData);

  if (isPostgres) {
    const res = await pgPool.query('SELECT data FROM user_state WHERE user_id = $1', [userId]);
    if (res.rows.length > 0 && res.rows[0].data) {
      return typeof res.rows[0].data === 'string' ? JSON.parse(res.rows[0].data) : res.rows[0].data;
    }
    if (defaultData) {
      await saveUserState(userId, defaultData);
    }
    return defaultData;
  } else {
    const row = sqliteDb.prepare('SELECT data FROM user_state WHERE user_id = ?').get(userId);
    if (row && row.data) {
      try {
        return JSON.parse(row.data);
      } catch (e) {}
    }
    if (defaultData) {
      saveUserState(userId, defaultData);
    }
    return defaultData;
  }
}

export async function saveUserState(userId, state) {
  if (!userId || !state || typeof state !== 'object') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const logs = state.activityLogs || [];
  const todayLog = logs.find(l => l.date === todayStr) || { total: 0 };
  const totalHours = logs.reduce((sum, l) => sum + (l.total || 0), 0);
  const streak = state.profile?.currentStreak || 0;
  const targetRole = state.profile?.targetRole || 'Data Scientist';
  const displayName = state.profile?.name || 'Prep Scholar';

  if (isPostgres) {
    await pgPool.query(`
      INSERT INTO user_state (user_id, data, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW();
    `, [userId, state]);

    await pgPool.query(`
      UPDATE users SET
        display_name = COALESCE($1, display_name),
        target_role = COALESCE($2, target_role),
        today_hours = $3,
        total_hours = $4,
        streak = $5,
        last_active = NOW()
      WHERE uid = $6;
    `, [displayName, targetRole, todayLog.total || 0, totalHours, streak, userId]);
  } else {
    const jsonStr = JSON.stringify(state);
    sqliteDb.prepare(`
      INSERT INTO user_state (user_id, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
    `).run(userId, jsonStr);

    sqliteDb.prepare(`
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
}

// ----------------------------------------------------
// REAL-TIME PRESENCE & "WHO IS STUDYING LIVE"
// ----------------------------------------------------

export async function updateUserPresence(uid, presence) {
  if (!uid) return;
  const { isStudying = false, category = 'gate', task = 'Focus Session', remainingSec = 0 } = presence || {};

  if (isPostgres) {
    await pgPool.query(`
      UPDATE users SET
        is_studying = $1,
        current_category = $2,
        current_task = $3,
        timer_remaining_sec = $4,
        last_active = NOW()
      WHERE uid = $5;
    `, [isStudying ? 1 : 0, category, task, remainingSec, uid]);
  } else {
    sqliteDb.prepare(`
      UPDATE users SET
        is_studying = ?,
        current_category = ?,
        current_task = ?,
        timer_remaining_sec = ?,
        last_active = CURRENT_TIMESTAMP
      WHERE uid = ?
    `).run(isStudying ? 1 : 0, category, task, remainingSec, uid);
  }
}

export async function getLiveStudyingUsers() {
  if (isPostgres) {
    const res = await pgPool.query(`
      SELECT uid, display_name, photo_url, target_role, current_category, current_task, timer_remaining_sec, today_hours, streak, last_active
      FROM users
      WHERE is_studying = 1 AND last_active >= NOW() - INTERVAL '10 minutes'
      ORDER BY last_active DESC;
    `);
    return res.rows;
  } else {
    return sqliteDb.prepare(`
      SELECT uid, display_name, photo_url, target_role, current_category, current_task, timer_remaining_sec, today_hours, streak, last_active
      FROM users
      WHERE is_studying = 1 AND last_active >= datetime('now', '-10 minute')
      ORDER BY last_active DESC
    `).all();
  }
}

// ----------------------------------------------------
// GLOBAL LEADERBOARD & COMMUNITY RANKINGS
// ----------------------------------------------------

export async function getLeaderboard() {
  if (isPostgres) {
    const [todayRes, totalRes, streakRes] = await Promise.all([
      pgPool.query('SELECT uid, display_name, photo_url, target_role, today_hours as score, streak, is_studying, current_category FROM users ORDER BY today_hours DESC, total_hours DESC LIMIT 20'),
      pgPool.query('SELECT uid, display_name, photo_url, target_role, total_hours as score, streak, is_studying, current_category FROM users ORDER BY total_hours DESC LIMIT 20'),
      pgPool.query('SELECT uid, display_name, photo_url, target_role, streak as score, total_hours, is_studying FROM users ORDER BY streak DESC, total_hours DESC LIMIT 20')
    ]);

    return {
      today: todayRes.rows,
      allTime: totalRes.rows,
      streaks: streakRes.rows
    };
  } else {
    const todayRankings = sqliteDb.prepare(`
      SELECT uid, display_name, photo_url, target_role, today_hours as score, streak, is_studying, current_category
      FROM users
      ORDER BY today_hours DESC, total_hours DESC
      LIMIT 20
    `).all();

    const totalRankings = sqliteDb.prepare(`
      SELECT uid, display_name, photo_url, target_role, total_hours as score, streak, is_studying, current_category
      FROM users
      ORDER BY total_hours DESC
      LIMIT 20
    `).all();

    const streakRankings = sqliteDb.prepare(`
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
}

// ----------------------------------------------------
// ADMIN TELEMETRY & METRICS
// ----------------------------------------------------

export async function getAdminMetrics() {
  if (isPostgres) {
    const [uCount, lCount, hSum, tSum, recUsers] = await Promise.all([
      pgPool.query('SELECT COUNT(*) as count FROM users'),
      pgPool.query("SELECT COUNT(*) as count FROM users WHERE is_studying = 1 AND last_active >= NOW() - INTERVAL '10 minutes'"),
      pgPool.query('SELECT COALESCE(SUM(total_hours), 0) as total FROM users'),
      pgPool.query('SELECT COALESCE(SUM(today_hours), 0) as total FROM users'),
      pgPool.query('SELECT uid, email, display_name, photo_url, target_role, role, created_at, last_active, is_studying, today_hours, total_hours, streak FROM users ORDER BY last_active DESC LIMIT 50')
    ]);

    return {
      totalUsers: parseInt(uCount.rows[0].count, 10),
      liveUsers: parseInt(lCount.rows[0].count, 10),
      totalHours: parseFloat(Number(hSum.rows[0].total).toFixed(1)),
      totalTodayHours: parseFloat(Number(tSum.rows[0].total).toFixed(1)),
      recentUsers: recUsers.rows
    };
  } else {
    const totalUsers = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const liveUsers = sqliteDb.prepare("SELECT COUNT(*) as count FROM users WHERE is_studying = 1 AND last_active >= datetime('now', '-10 minute')").get().count;
    const totalHours = sqliteDb.prepare('SELECT SUM(total_hours) as total FROM users').get().total || 0;
    const totalTodayHours = sqliteDb.prepare('SELECT SUM(today_hours) as total FROM users').get().total || 0;
    
    const recentUsers = sqliteDb.prepare(`
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
}

// ----------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------

export async function getActiveAnnouncements() {
  if (isPostgres) {
    const res = await pgPool.query('SELECT * FROM announcements WHERE active = 1 ORDER BY created_at DESC LIMIT 5');
    return res.rows;
  } else {
    return sqliteDb.prepare('SELECT * FROM announcements WHERE active = 1 ORDER BY created_at DESC LIMIT 5').all();
  }
}

export async function createAnnouncement(message, type = 'info', createdBy = 'Admin') {
  const id = `ann-${Date.now()}`;
  if (isPostgres) {
    await pgPool.query(`
      INSERT INTO announcements (id, message, type, created_by, active)
      VALUES ($1, $2, $3, $4, 1);
    `, [id, message, type, createdBy]);
  } else {
    sqliteDb.prepare(`
      INSERT INTO announcements (id, message, type, created_by, active)
      VALUES (?, ?, ?, ?, 1)
    `).run(id, message, type, createdBy);
  }
  return getActiveAnnouncements();
}

export async function toggleAnnouncement(id, active) {
  if (isPostgres) {
    await pgPool.query('UPDATE announcements SET active = $1 WHERE id = $2', [active ? 1 : 0, id]);
  } else {
    sqliteDb.prepare('UPDATE announcements SET active = ? WHERE id = ?').run(active ? 1 : 0, id);
  }
  return getActiveAnnouncements();
}

// Legacy helpers
export async function getAppState(defaultData) {
  if (isPostgres) {
    const res = await pgPool.query("SELECT data FROM app_state WHERE id = 'current_state'");
    if (res.rows.length > 0 && res.rows[0].data) {
      return typeof res.rows[0].data === 'string' ? JSON.parse(res.rows[0].data) : res.rows[0].data;
    }
    return defaultData;
  } else {
    const row = sqliteDb.prepare('SELECT data FROM app_state WHERE id = ?').get('current_state');
    if (row && row.data) {
      try {
        return JSON.parse(row.data);
      } catch (e) {}
    }
    return defaultData;
  }
}

export async function saveAppState(state) {
  if (!state || typeof state !== 'object') return;
  if (isPostgres) {
    await pgPool.query(`
      INSERT INTO app_state (id, data, updated_at)
      VALUES ('current_state', $1, NOW())
      ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW();
    `, [state]);
  } else {
    const jsonStr = JSON.stringify(state);
    sqliteDb.prepare(`
      INSERT INTO app_state (id, data, updated_at)
      VALUES ('current_state', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
    `).run(jsonStr);
  }
}

export async function resetDatabase(zeroData) {
  if (isPostgres) {
    await pgPool.query('DELETE FROM app_state; DELETE FROM user_state;');
  } else {
    sqliteDb.exec('DELETE FROM app_state; DELETE FROM user_state;');
  }
  await saveAppState(zeroData);
}

export default { isPostgres };
