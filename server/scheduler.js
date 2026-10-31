// =========================================================================
// Server-Side 24/7 Automated Notification Scheduler & Keep-Alive Service
// Runs independently on the Node.js backend even if browser tab is closed!
// =========================================================================

import { getAllUsers, getUserState } from './db.js';

const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9046473887:AAFPiAqur4eB32KQIH0TZfTu0fwzZc-80qE';
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7418291817';

export let activeTelegramConfig = {
  botToken: DEFAULT_BOT_TOKEN,
  chatId: DEFAULT_CHAT_ID,
  enabled: true,
  morningReminder: true,
  morningTime: '09:00',
  inactivityAlert: true,
  inactivityTime: '15:00',
  eveningRecap: true,
  eveningTime: '21:30',
  pomodoroDoneAlert: true,
  timezone: 'Asia/Kolkata' // IST - UTC+5:30
};

// Tracks alerts already dispatched today: key = `${userId}_${alertType}_${dateKey}`
const sentHistory = new Set();

function formatDuration(decimalHours) {
  const num = Number(decimalHours) || 0;
  if (num <= 0) return '0m';
  const totalMins = Math.round(num * 60);
  if (totalMins < 60) return `${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function renderProgressBar(current, goal) {
  const pct = Math.min(100, Math.max(0, Math.round(((current || 0) / (goal || 1)) * 100)));
  const totalBlocks = 10;
  const filledBlocks = Math.round((pct / 100) * totalBlocks);
  const bar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);
  return `[<code>${bar}</code>] ${pct}%`;
}

// Low-level message sender with error handling
async function sendTelegramMessage(botToken, chatId, text) {
  const token = (botToken || activeTelegramConfig.botToken || DEFAULT_BOT_TOKEN).trim();
  const cid = (chatId || activeTelegramConfig.chatId || DEFAULT_CHAT_ID).trim();
  if (!token || !cid) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cid,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('[Server Scheduler] Telegram Send Error:', err.message);
  }
}

// Get candidate data
async function getTargetUserData() {
  try {
    const users = await getAllUsers();
    if (users && users.length > 0) {
      const targetUser = users.find(u => !u.uid?.startsWith('demo-')) || users[0];
      const state = await getUserState(targetUser.uid, null);
      return { user: targetUser, state };
    }
  } catch (e) {
    console.warn('[Server Scheduler] DB Fetch Warning:', e.message);
  }
  return { user: null, state: null };
}

// Convert UTC server time into Candidate's configured timezone (e.g. Asia/Kolkata)
function getCandidateCurrentTime(timeZone = 'Asia/Kolkata') {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const getPart = (t) => parts.find(p => p.type === t)?.value || '00';
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    return {
      dateKey: `${year}-${month}-${day}`,
      currentTimeStr: `${hour}:${minute}`,
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10)
    };
  } catch (e) {
    // Fallback if timezone string is invalid
    const now = new Date();
    return {
      dateKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      currentTimeStr: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  }
}

// ── Automated Triggers ────────────────────────────────────────────────────

// 1. Morning Daily Mission
async function triggerMorningMission(config, { user, state }, dateKey) {
  const profile = state?.profile || {};
  const routines = state?.dailyRoutines || [];
  const pending = routines.filter(r => !r.completed);
  const dailyGoal = profile.dailyHourGoal || 7.5;
  const userName = user?.display_name || profile.name || 'Scholar';

  const msg = `☀️ <b>Good Morning, ${userName}!</b>
━━━━━━━━━━━━━━━━━━━━
Your daily mission for today is set:
🎯 <b>Target Study Goal:</b> ${formatDuration(dailyGoal)}
🔥 <b>Active Streak:</b> ${profile.currentStreak || user?.streak || 0} Days (Keep it alive!)

📋 <b>Top Priority Tasks:</b>
${pending.slice(0, 5).map(r => `• <b>[ ]</b> ${r.title}`).join('\n') || '• Review your OmniPrep goals & start session'}

⏰ Jump in, start your first Pomodoro round, and conquer today's target!
🚀 <a href="https://omniprep.onrender.com">Open OmniPrep Suite</a>`;

  console.log(`[Server Scheduler] ☀️ Dispatching Morning Mission to ${config.chatId}...`);
  await sendTelegramMessage(config.botToken, config.chatId, msg);
}

// 2. Inactivity Nudge
async function triggerInactivityWarning(config, { user, state }, dateKey) {
  const profile = state?.profile || {};
  const logs = state?.activityLogs || [];
  const todayLog = logs.find(l => l.date === dateKey) || { total: user?.today_hours || 0 };
  const dailyGoal = profile.dailyHourGoal || 7.5;
  const userName = user?.display_name || profile.name || 'Scholar';

  // Only trigger if logged hours are near zero (< 0.1h)
  if ((todayLog.total || 0) >= 0.1) {
    console.log(`[Server Scheduler] Inactivity alert skipped: candidate already studied ${todayLog.total}h today.`);
    return;
  }

  const msg = `⚠️ <b>Study Alert: Zero Hours Logged So Far!</b>
━━━━━━━━━━━━━━━━━━━━
Hey ${userName}, the afternoon is slipping away and you haven't started your study routine yet today.

🔥 <b>Streak at Risk:</b> Your <b>${profile.currentStreak || user?.streak || 0}-day streak</b> is on the line!
⏱️ <b>Remaining Goal:</b> ${formatDuration(dailyGoal)} needed today.

👉 Just start with ONE 25-minute Pomodoro round to build momentum!
🚀 <a href="https://omniprep.onrender.com">Start 25m Focus Round Now</a>`;

  console.log(`[Server Scheduler] ⚠️ Dispatching Inactivity Alert to ${config.chatId}...`);
  await sendTelegramMessage(config.botToken, config.chatId, msg);
}

// 3. Evening Scorecard
async function triggerEveningScorecard(config, { user, state }, dateKey) {
  const profile = state?.profile || {};
  const logs = state?.activityLogs || [];
  const todayLog = logs.find(l => l.date === dateKey) || { total: user?.today_hours || 0 };
  const dailyGoal = profile.dailyHourGoal || 7.5;
  const userName = user?.display_name || profile.name || 'Scholar';
  const isGoalMet = (todayLog.total || 0) >= dailyGoal;

  const msg = `🌙 <b>Evening Scorecard: Daily Wrap-Up</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Candidate:</b> ${userName}
${isGoalMet ? '🏆 <b>DAILY TARGET CRUSHED! Excellent work!</b>' : '📊 <b>Today\'s Final Summary:</b>'}

⏱️ <b>Total Hours Tracked:</b> ${formatDuration(todayLog.total || 0)} / ${formatDuration(dailyGoal)}
${renderProgressBar(todayLog.total || 0, dailyGoal)}
🔥 <b>Streak Status:</b> ${profile.currentStreak || user?.streak || 0} Days

${isGoalMet ? '🌟 You hit your target! Rest up and recharge for tomorrow.' : '💪 Every minute invested counts. Tomorrow is a brand new day to win early.'}
💤 Good night!`;

  console.log(`[Server Scheduler] 🌙 Dispatching Evening Scorecard to ${config.chatId}...`);
  await sendTelegramMessage(config.botToken, config.chatId, msg);
}

// ── Check Schedules Routine (Runs every 30 seconds) ───────────────────────

export async function checkAutomatedSchedules() {
  if (!activeTelegramConfig.enabled) return;

  const config = activeTelegramConfig;
  const { dateKey, currentTimeStr, hour, minute } = getCandidateCurrentTime(config.timezone);

  const { user, state } = await getTargetUserData();
  const userId = user?.uid || 'default_user';

  // Helper: check if within ±3 minutes of target time
  const isTimeMatch = (targetTimeStr) => {
    if (!targetTimeStr) return false;
    const [tH, tM] = targetTimeStr.split(':').map(Number);
    const diff = (hour * 60 + minute) - (tH * 60 + tM);
    return diff >= 0 && diff <= 5; // within 0 to 5 mins of schedule
  };

  // 1. Morning Daily Mission
  if (config.morningReminder && isTimeMatch(config.morningTime || '09:00')) {
    const sentKey = `${userId}_morning_${dateKey}`;
    if (!sentHistory.has(sentKey)) {
      sentHistory.add(sentKey);
      await triggerMorningMission(config, { user, state }, dateKey);
    }
  }

  // 2. Afternoon Inactivity Alert
  if (config.inactivityAlert && isTimeMatch(config.inactivityTime || '15:00')) {
    const sentKey = `${userId}_inactivity_${dateKey}`;
    if (!sentHistory.has(sentKey)) {
      sentHistory.add(sentKey);
      await triggerInactivityWarning(config, { user, state }, dateKey);
    }
  }

  // 3. Evening Wrap-Up Scorecard
  if (config.eveningRecap && isTimeMatch(config.eveningTime || '21:30')) {
    const sentKey = `${userId}_evening_${dateKey}`;
    if (!sentHistory.has(sentKey)) {
      sentHistory.add(sentKey);
      await triggerEveningScorecard(config, { user, state }, dateKey);
    }
  }
}

// ── 24/7 Self-Ping Keep-Alive Worker ──────────────────────────────────────

let keepAliveInterval = null;

export function startKeepAliveWorker() {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || 'https://omniprep.onrender.com';
  console.log(`[KeepAlive] 🟢 Starting 24/7 Keep-Alive self-pinger for: ${targetUrl}`);

  const ping = async () => {
    try {
      const pingUrl = `${targetUrl.replace(/\/$/, '')}/api/health`;
      const res = await fetch(pingUrl);
      console.log(`[KeepAlive] 💓 Self-ping ${pingUrl} - Status: ${res.status} [${new Date().toLocaleTimeString()}]`);
    } catch (err) {
      console.warn(`[KeepAlive] Ping notice:`, err.message);
    }
  };

  // Run initial ping after 20 seconds, then every 9 minutes (Render free tier sleeps at 15 mins)
  setTimeout(ping, 20000);
  keepAliveInterval = setInterval(ping, 9 * 60 * 1000);
}

// ── Configuration Getters & Setters ───────────────────────────────────────

export function getSchedulerConfig() {
  return activeTelegramConfig;
}

export function updateSchedulerConfig(updates) {
  activeTelegramConfig = {
    ...activeTelegramConfig,
    ...updates
  };
  console.log('[Server Scheduler] ⚙️ Updated notification configuration:', {
    enabled: activeTelegramConfig.enabled,
    morning: `${activeTelegramConfig.morningReminder ? 'ON' : 'OFF'} (${activeTelegramConfig.morningTime})`,
    inactivity: `${activeTelegramConfig.inactivityAlert ? 'ON' : 'OFF'} (${activeTelegramConfig.inactivityTime})`,
    evening: `${activeTelegramConfig.eveningRecap ? 'ON' : 'OFF'} (${activeTelegramConfig.eveningTime})`,
    timezone: activeTelegramConfig.timezone
  });
  return activeTelegramConfig;
}

// ── Scheduler Main Runner ─────────────────────────────────────────────────

export function startNotificationScheduler() {
  console.log('[Server Scheduler] ⏰ Background 24/7 scheduler activated (polling every 30s)');
  setInterval(checkAutomatedSchedules, 30000);
  startKeepAliveWorker();
}
