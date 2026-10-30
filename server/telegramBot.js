// =========================================================================
// Telegram Bot Polling Listener & Interactive Command Handler
// Answers button clicks ('📊 Today\'s Progress', '📋 Pending Tasks', etc.)
// =========================================================================

import { getAllUsers, getUserState } from './db.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9046473887:AAFPiAqur4eB32KQIH0TZfTu0fwzZc-80qE';

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

// Interactive reply keyboard shown at bottom of user's Telegram chat
export const TELEGRAM_KEYBOARD = {
  keyboard: [
    [{ text: "📊 Today's Progress" }, { text: '📋 Pending Tasks' }],
    [{ text: '🔥 Streak & Stats' }, { text: '🎯 Daily Target' }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

export async function sendTelegramResponse(chatId, text, inlineButtons = null) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: inlineButtons || TELEGRAM_KEYBOARD
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error('[Telegram Response Error]:', err.message);
  }
}

// Find the most recent active user's state from the database
async function getLatestCandidateState() {
  try {
    const users = await getAllUsers();
    if (users && users.length > 0) {
      // Find non-demo user or first user with highest activity
      const targetUser = users.find(u => !u.uid?.startsWith('demo-')) || users[0];
      const state = await getUserState(targetUser.uid, null);
      return { user: targetUser, state };
    }
  } catch (e) {
    console.warn('[Telegram Bot] DB Fetch Error:', e.message);
  }
  return { user: null, state: null };
}

// Build progress message
async function handleProgressQuery(chatId, senderName) {
  const { user, state } = await getLatestCandidateState();
  const profile = state?.profile || {};
  const logs = state?.activityLogs || [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayLog = logs.find(l => l.date === todayStr) || { gate: 0, academic: 0, job: 0, english: 0, total: user?.today_hours || 0 };

  const dailyGoal = profile.dailyHourGoal || 7.5;
  const streak = profile.currentStreak || user?.streak || 0;

  const msg = `📊 <b>Today's Study Progress Report</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Candidate:</b> ${senderName || profile.name || 'Aayush'}
🎯 <b>Target Role:</b> ${profile.targetRole || 'Data Scientist'}
🔥 <b>Active Streak:</b> ${streak} Days in a row!

⏱️ <b>Today's Tracked Hours:</b>
${renderProgressBar(todayLog.total || 0, dailyGoal)}
• <b>Total:</b> ${formatDuration(todayLog.total || 0)} / ${formatDuration(dailyGoal)}
• <b>GATE DS & AI:</b> ${formatDuration(todayLog.gate || 0)}
• <b>Academic Prep:</b> ${formatDuration(todayLog.academic || 0)}
• <b>Job & DS Rev:</b> ${formatDuration(todayLog.job || 0)}
• <b>English Speaking:</b> ${formatDuration(todayLog.english || 0)}

${(todayLog.total || 0) >= dailyGoal ? '🏆 <b>Daily Target Achieved! Great job!</b>' : `⏳ <b>${formatDuration(Math.max(0, dailyGoal - (todayLog.total || 0)))}</b> remaining to reach daily goal.`}

🚀 <a href="https://omniprep.onrender.com">Open OmniPrep Suite</a>`;

  await sendTelegramResponse(chatId, msg);
}

// Build pending tasks list
async function handleTasksQuery(chatId, senderName) {
  const { state } = await getLatestCandidateState();
  const routines = state?.dailyRoutines || [];
  const pending = routines.filter(r => !r.completed);
  const done = routines.filter(r => r.completed);

  let taskList = '';
  if (routines.length === 0) {
    taskList = '• No checklist tasks found. Open OmniPrep to add your daily tasks!';
  } else {
    taskList = routines.map(r => `${r.completed ? '✅' : '⬜'} <b>${r.title}</b> (${r.period || 'Routine'})`).join('\n');
  }

  const msg = `📋 <b>Your Daily Checklist & Routines</b>
━━━━━━━━━━━━━━━━━━━━
Completed: <b>${done.length}/${routines.length} Tasks</b>

${taskList}

💡 <i>Tap "Today's Progress" to check total focus hours logged!</i>`;

  await sendTelegramResponse(chatId, msg);
}

// Build streak & stats summary
async function handleStreakQuery(chatId, senderName) {
  const { user, state } = await getLatestCandidateState();
  const profile = state?.profile || {};
  const logs = state?.activityLogs || [];
  const totalAllTime = logs.reduce((s, l) => s + (l.total || 0), 0) || user?.total_hours || 0;

  const msg = `🔥 <b>Consistency & Master Stats</b>
━━━━━━━━━━━━━━━━━━━━
🔥 <b>Current Streak:</b> ${profile.currentStreak || user?.streak || 0} Days
🏆 <b>Longest Streak:</b> ${profile.longestStreak || 42} Days
⏱️ <b>All-Time Focus Tracked:</b> ${formatDuration(totalAllTime)}
📚 <b>Total Logged Days:</b> ${logs.length || 1} Days
🎯 <b>Daily Goal:</b> ${profile.dailyHourGoal || 7.5}h / day

⚡ <i>"Consistency is the DNA of mastery."</i>`;

  await sendTelegramResponse(chatId, msg);
}

// Build daily target overview
async function handleTargetQuery(chatId, senderName) {
  const { state } = await getLatestCandidateState();
  const profile = state?.profile || {};
  const logs = state?.activityLogs || [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayLog = logs.find(l => l.date === todayStr) || { total: 0 };
  const dailyGoal = profile.dailyHourGoal || 7.5;
  const pct = Math.round(((todayLog.total || 0) / dailyGoal) * 100);

  const msg = `🎯 <b>Daily Target Breakdown</b>
━━━━━━━━━━━━━━━━━━━━
🎯 <b>Target Hours:</b> ${formatDuration(dailyGoal)}
⏱️ <b>Done Today:</b> ${formatDuration(todayLog.total || 0)} (${pct}%)
⏳ <b>Remaining:</b> ${formatDuration(Math.max(0, dailyGoal - (todayLog.total || 0)))}

${renderProgressBar(todayLog.total || 0, dailyGoal)}

👉 <i>Ready for a focus sprint? Start a 25m Pomodoro round on OmniPrep!</i>`;

  await sendTelegramResponse(chatId, msg);
}

// Main Telegram Update Processor
let lastUpdateId = 0;
let isPolling = false;

export async function processTelegramUpdates() {
  if (isPolling) return;
  isPolling = true;

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);

        const msg = update.message;
        if (!msg || !msg.text) continue;

        const chatId = msg.chat?.id;
        const text = msg.text.trim();
        const sender = msg.from?.first_name || 'Scholar';

        // Route commands & button taps with flexible keyword matching
        const lower = text.toLowerCase();
        if (lower.includes('progress') || lower === '/progress' || lower.includes("today's")) {
          await handleProgressQuery(chatId, sender);
        } else if (lower.includes('task') || lower === '/tasks') {
          await handleTasksQuery(chatId, sender);
        } else if (lower.includes('streak') || lower.includes('stats') || lower === '/streak') {
          await handleStreakQuery(chatId, sender);
        } else if (lower.includes('target') || lower.includes('goal') || lower === '/target') {
          await handleTargetQuery(chatId, sender);
        } else if (lower === '/start' || lower === '/menu' || lower === '/help' || lower.includes('hello') || lower.includes('hi')) {
          const welcomeMsg = `👋 <b>Hello ${sender}!</b> Welcome back to your OmniPrep Study Companion Bot.
          
Tap any of the quick-action buttons below to check your progress, pending tasks, or daily study target anytime!`;
          await sendTelegramResponse(chatId, welcomeMsg);
        } else {
          // Default response for unrecognized text
          await sendTelegramResponse(
            chatId,
            `👋 Got it, ${sender}! Tap one of the buttons below to fetch your real-time study stats.`
          );
        }
      }
    }
  } catch (err) {
    // Network errors during polling are normal (e.g. timeout)
  } finally {
    isPolling = false;
  }
}

// Start continuous polling background loop
export function startTelegramBotListener() {
  console.log('[Telegram Bot] 🤖 Interactive button listener service started for @Omni_tracker_progress_bot');
  // Poll every 3 seconds for button clicks
  setInterval(processTelegramUpdates, 3000);
}
