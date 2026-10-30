// =========================================================================
// Telegram Push Notifier & Background Smart Reminders for OmniPrep
// =========================================================================

export const DEFAULT_TELEGRAM_CONFIG = {
  botToken: '9046473887:AAFPiAqur4eB32KQIH0TZfTu0fwzZc-80qE',
  chatId: '9046473887',
  botUsername: 'Omni_tracker_progress_bot',
  enabled: true,
  morningReminder: true,      // 9:00 AM IST daily briefing
  morningTime: '09:00',
  inactivityAlert: true,      // 3:00 PM IST reminder if 0 hours studied today
  inactivityTime: '15:00',
  eveningRecap: true,         // 9:30 PM IST final scorecard
  eveningTime: '21:30',
  pomodoroDoneAlert: true,    // Send message whenever user finishes a focus round
};

// Low-level sender
export async function sendTelegramMessage(botToken, chatId, text, parseMode = 'HTML') {
  const token = (botToken || DEFAULT_TELEGRAM_CONFIG.botToken).trim();
  const cid = (chatId || DEFAULT_TELEGRAM_CONFIG.chatId).trim();

  if (!token || !cid) {
    throw new Error('Telegram bot token or chat ID is missing.');
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: cid,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });

  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.description || `Telegram API error (${json.error_code || 'unknown'})`);
  }
  return json.result;
}

// Format duration helper (e.g. 2h 15m or 45m)
function formatDuration(decimalHours) {
  const num = Number(decimalHours) || 0;
  if (num <= 0) return '0m';
  const totalMins = Math.round(num * 60);
  if (totalMins < 60) return `${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Generate visual progress bar for Telegram (e.g. [████░░░░░░] 40%)
function renderProgressBar(current, goal) {
  const pct = Math.min(100, Math.max(0, Math.round(((current || 0) / (goal || 1)) * 100)));
  const totalBlocks = 10;
  const filledBlocks = Math.round((pct / 100) * totalBlocks);
  const bar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);
  return `[<code>${bar}</code>] ${pct}%`;
}

// ── Message Builders ─────────────────────────────────────────────────────

// 1. Live Instant Progress Report (Triggered by user button)
export function buildInstantProgressMessage(data, userName) {
  const profile = data?.profile || {};
  const logs = data?.activityLogs || [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayLog = logs.find(l => l.date === todayStr) || { gate: 0, academic: 0, job: 0, english: 0, total: 0 };

  const dailyGoalHours = profile.dailyHourGoal || 7.5;
  const streak = profile.currentStreak || 0;
  const targetRole = profile.targetRole || 'Data Scientist';

  const routines = data?.dailyRoutines || [];
  const doneRoutines = routines.filter(r => r.completed).length;

  return `🎯 <b>OmniPrep Live Status Briefing</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Candidate:</b> ${userName || profile.name || 'OmniPrep Scholar'}
🎯 <b>Target Role:</b> ${targetRole}
🔥 <b>Active Streak:</b> ${streak} Days in a row!

⏱️ <b>Today's Study Progress:</b>
${renderProgressBar(todayLog.total || 0, dailyGoalHours)}
• <b>Completed:</b> ${formatDuration(todayLog.total || 0)} / ${formatDuration(dailyGoalHours)}
• <b>GATE DS & AI:</b> ${formatDuration(todayLog.gate || 0)}
• <b>Academic Prep:</b> ${formatDuration(todayLog.academic || 0)}
• <b>Job & DS Rev:</b> ${formatDuration(todayLog.job || 0)}
• <b>English Speaking:</b> ${formatDuration(todayLog.english || 0)}

📋 <b>Daily Checklist:</b> ${doneRoutines}/${routines.length} Tasks Done
${routines.slice(0, 5).map(r => `${r.completed ? '✅' : '⬜'} ${r.title}`).join('\n') || '• No active routines added'}

💡 <i>"Small daily disciplines compound into mastery."</i>
🚀 <b>OmniPrep Mastery Suite</b>`;
}

// 2. Morning Daily Briefing (Sent automatically at 9:00 AM)
export function buildMorningBriefingMessage(data, userName) {
  const profile = data?.profile || {};
  const routines = data?.dailyRoutines || [];
  const pending = routines.filter(r => !r.completed);
  const dailyGoalHours = profile.dailyHourGoal || 7.5;

  return `☀️ <b>Good Morning, ${userName || profile.name || 'Scholar'}!</b>
━━━━━━━━━━━━━━━━━━━━
Your daily mission for today is set:
🎯 <b>Target Study Goal:</b> ${formatDuration(dailyGoalHours)}
🔥 <b>Current Streak:</b> ${profile.currentStreak || 0} Days (Don't break it today!)

📋 <b>High-Priority Tasks for Today:</b>
${pending.slice(0, 5).map(r => `• <b>[ ]</b> ${r.title}`).join('\n') || '• Open OmniPrep to set your top 3 tasks'}

⏰ Jump in, start your first Pomodoro focus round, and let's crush the daily target!
🔗 <a href="https://omniprep.onrender.com">Open OmniPrep Suite</a>`;
}

// 3. Inactivity Alert (Sent at 3:00 PM if user has logged 0 study hours)
export function buildInactivityAlertMessage(data, userName) {
  const profile = data?.profile || {};
  return `⚠️ <b>Study Alert: Zero Hours Logged So Far!</b>
━━━━━━━━━━━━━━━━━━━━
Hey ${userName || profile.name || 'Scholar'}, the afternoon is slipping away and you haven't started your study routine yet today.

🔥 <b>Streak at Risk:</b> Your <b>${profile.currentStreak || 0}-day streak</b> is on the line!
⏱️ <b>Remaining Goal:</b> ${formatDuration(profile.dailyHourGoal || 7.5)} needed today.

👉 Just start with ONE 25-minute Pomodoro round to build momentum!
🔗 <a href="https://omniprep.onrender.com">Start 25m Focus Round Now</a>`;
}

// 4. Evening Recap & Scorecard (Sent at 9:30 PM)
export function buildEveningRecapMessage(data, userName) {
  const profile = data?.profile || {};
  const logs = data?.activityLogs || [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayLog = logs.find(l => l.date === todayStr) || { total: 0 };
  const dailyGoal = profile.dailyHourGoal || 7.5;
  const isGoalMet = (todayLog.total || 0) >= dailyGoal;

  return `🌙 <b>Evening Scorecard: Daily Wrap-Up</b>
━━━━━━━━━━━━━━━━━━━━
${isGoalMet ? '🏆 <b>GOAL CRUSHED! Excellent work today!</b>' : '📊 <b>Today\'s Final Summary:</b>'}

⏱️ <b>Total Hours Tracked:</b> ${formatDuration(todayLog.total || 0)} / ${formatDuration(dailyGoal)}
${renderProgressBar(todayLog.total || 0, dailyGoal)}
🔥 <b>Streak Status:</b> ${profile.currentStreak || 0} Days

${isGoalMet ? '🌟 You hit your target! Rest up and get ready to repeat tomorrow.' : '💪 Every minute counts. Tomorrow is a brand new day to win early.'}
💤 Good night!`;
}

// 5. Pomodoro Focus Session Logged Alert
export function buildPomodoroCompletedMessage(category, durationMinutes, totalTodayHours, userName) {
  const catNames = {
    gate: 'GATE DS & AI',
    academic: 'Academic Coursework',
    job: 'Job & DS Revision',
    english: 'English Fluency',
  };
  const catLabel = catNames[category] || (category || 'Study').toUpperCase();

  return `⏱️ <b>Pomodoro Session Saved!</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>+${durationMinutes} mins</b> logged to <b>${catLabel}</b>!
📊 <b>Today's Total:</b> ${formatDuration(totalTodayHours)}
👤 <i>Keep the momentum going, ${userName || 'Scholar'}!</i>`;
}
