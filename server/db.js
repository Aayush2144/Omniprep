import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'omniprep.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and fast writes
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  // Main app state snapshot table
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Relational Tables for detailed queryable storage
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      date TEXT PRIMARY KEY,
      gate_hours REAL DEFAULT 0,
      academic_hours REAL DEFAULT 0,
      job_hours REAL DEFAULT 0,
      english_hours REAL DEFAULT 0,
      total_hours REAL DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      streak_active INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS mock_tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      score REAL NOT NULL,
      total REAL NOT NULL,
      accuracy REAL NOT NULL,
      percentile REAL,
      mistakes TEXT
    );

    CREATE TABLE IF NOT EXISTS dsa_problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      platform TEXT,
      difficulty TEXT NOT NULL,
      topic TEXT,
      time_min INTEGER,
      solved_date TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS ds_revision_topics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      confidence INTEGER DEFAULT 0,
      status TEXT NOT NULL,
      last_revised TEXT,
      next_due TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      package TEXT,
      applied_date TEXT,
      next_step TEXT
    );

    CREATE TABLE IF NOT EXISTS english_sessions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      topic_title TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      fluency_score REAL NOT NULL,
      notes TEXT
    );
  `);

  console.log(`[Database] SQLite Database initialized at ${DB_PATH}`);
}

// Retrieve App State from SQLite
export function getAppState(defaultData) {
  const row = db.prepare('SELECT data FROM app_state WHERE id = ?').get('current_state');
  if (row && row.data) {
    try {
      return JSON.parse(row.data);
    } catch (e) {
      console.error('[Database] Failed to parse stored state:', e);
    }
  }
  // If not present, seed initial default zero state
  saveAppState(defaultData);
  return defaultData;
}

// Save App State to SQLite
export function saveAppState(state) {
  if (!state || typeof state !== 'object') return;
  const jsonStr = JSON.stringify(state);
  const stmt = db.prepare(`
    INSERT INTO app_state (id, data, updated_at)
    VALUES ('current_state', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(jsonStr);

  // Sync to individual relational tables if logs present
  if (state.activityLogs && Array.isArray(state.activityLogs) && state.activityLogs.length > 0) {
    const insertLog = db.prepare(`
      INSERT OR REPLACE INTO activity_logs (date, gate_hours, academic_hours, job_hours, english_hours, total_hours, tasks_completed, streak_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((logs) => {
      for (const log of logs) {
        insertLog.run(
          log.date,
          log.gate || 0,
          log.academic || 0,
          log.job || 0,
          log.english || 0,
          log.total || 0,
          log.tasksCompleted || 0,
          log.streakActive ? 1 : 0
        );
      }
    });

    insertMany(state.activityLogs);
  }
}

// Reset Database state
export function resetDatabase(zeroData) {
  db.exec('DELETE FROM app_state');
  db.exec('DELETE FROM activity_logs');
  db.exec('DELETE FROM mock_tests');
  db.exec('DELETE FROM dsa_problems');
  db.exec('DELETE FROM ds_revision_topics');
  db.exec('DELETE FROM job_applications');
  db.exec('DELETE FROM english_sessions');
  saveAppState(zeroData);
}

export default db;
