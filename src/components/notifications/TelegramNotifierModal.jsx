import React, { useState, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Smartphone,
  Flame,
  Check,
  Info,
  Copy,
  Zap,
  Globe,
  Radio,
  Power
} from 'lucide-react';
import {
  DEFAULT_TELEGRAM_CONFIG,
  sendTelegramMessage,
  syncTelegramConfigToServer,
  buildInstantProgressMessage,
  buildMorningBriefingMessage,
  buildInactivityAlertMessage,
  buildEveningRecapMessage
} from '../../utils/telegramNotifier.js';

export const TelegramNotifierModal = ({ isOpen, onClose }) => {
  const { data } = useTracker();
  const { currentUser } = useAuth();

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('omniprep_telegram_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chatId === '9046473887') {
          parsed.chatId = '7418291817';
        }
        return { ...DEFAULT_TELEGRAM_CONFIG, ...parsed };
      }
    } catch (_) {}
    return DEFAULT_TELEGRAM_CONFIG;
  });

  const [status, setStatus] = useState(null); // 'sending' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Load server-side config on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/telegram/config')
        .then(r => r.json())
        .then(res => {
          if (res.success && res.config) {
            setConfig(prev => ({ ...prev, ...res.config }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    localStorage.setItem('omniprep_telegram_config', JSON.stringify(config));
    setStatus('sending');
    setStatusMsg('Syncing settings with 24/7 server scheduler...');

    try {
      await syncTelegramConfigToServer(config);
      setStatus('success');
      setStatusMsg('Preferences saved & synced to 24/7 background scheduler!');
      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 1200);
    } catch (err) {
      setStatus('success');
      setStatusMsg('Saved locally! (Server will sync on next active session)');
      setTimeout(() => onClose(), 1200);
    }
  };

  const handleSendTestNotification = async (type = 'progress') => {
    setStatus('sending');
    setStatusMsg('');

    try {
      const userName = currentUser?.displayName || data?.profile?.name || 'Scholar';
      let messageText = '';

      if (type === 'morning') {
        messageText = buildMorningBriefingMessage(data, userName);
      } else if (type === 'inactivity') {
        messageText = buildInactivityAlertMessage(data, userName);
      } else if (type === 'evening') {
        messageText = buildEveningRecapMessage(data, userName);
      } else {
        messageText = buildInstantProgressMessage(data, userName);
      }

      try {
        await sendTelegramMessage(config.botToken, config.chatId, messageText);
      } catch (browserErr) {
        const res = await fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botToken: config.botToken,
            chatId: config.chatId,
            text: messageText,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Backend dispatch failed.');
      }

      setStatus('success');
      setStatusMsg('Test alert sent! Check your Telegram app 📲');
      setTimeout(() => setStatus(null), 3500);
    } catch (err) {
      console.error('Telegram notification error:', err);
      setStatus('error');
      setStatusMsg(err.message || 'Failed to send alert. Check bot token and chat ID.');
    }
  };

  const keepAliveUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/health`
    : 'https://omniprep-wg7a.onrender.com/api/health';

  const handleCopyKeepalive = () => {
    navigator.clipboard.writeText(keepAliveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c101c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Telegram Alerts & 24/7 Schedules</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected to <span className="text-sky-300 font-mono">@{config.botUsername}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Master Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-transparent border border-sky-500/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition ${config.enabled ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-800 text-slate-400'}`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Telegram Phone Alerts Master Switch</div>
                <div className="text-xs text-slate-400">
                  {config.enabled ? '🟢 Active: Bot will send your enabled automatic schedules' : '⚪ Disabled: All phone notifications are paused'}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Quick Send Action Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Instant Test Dispatch (Click to send sample alert):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSendTestNotification('progress')}
                disabled={status === 'sending'}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-sky-500/40 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center justify-between">
                  <span>📊 Progress</span>
                  <Send className="w-3 h-3 text-sky-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Live focus scorecard</p>
              </button>

              <button
                onClick={() => handleSendTestNotification('morning')}
                disabled={status === 'sending'}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500/40 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
                  <span>☀️ Morning</span>
                  <Send className="w-3 h-3 text-amber-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Daily mission & tasks</p>
              </button>

              <button
                onClick={() => handleSendTestNotification('inactivity')}
                disabled={status === 'sending'}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-rose-300 flex items-center justify-between">
                  <span>⚠️ Inactivity</span>
                  <Send className="w-3 h-3 text-rose-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Zero-hours alert</p>
              </button>

              <button
                onClick={() => handleSendTestNotification('evening')}
                disabled={status === 'sending'}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
                  <span>🌙 Evening</span>
                  <Send className="w-3 h-3 text-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Final daily recap</p>
              </button>
            </div>
          </div>

          {/* Status Feedback Banner */}
          {status === 'sending' && (
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center gap-2 animate-fade-in">
              <span className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
              <span>{statusMsg || 'Communicating with Telegram Bot...'}</span>
            </div>
          )}
          {status === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Automatic Schedules Toggles & Time Config */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white block">
                  Automatic Notification Schedules
                </label>
                <p className="text-[11px] text-slate-400">
                  Each schedule can be individually toggled ON/OFF with custom dispatch times.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-white/5">
                <Globe className="w-3 h-3 text-sky-400" />
                <span>IST (UTC+5:30)</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* 1. Morning Trigger */}
              <div className={`p-3 rounded-xl border transition ${config.morningReminder ? 'bg-amber-500/5 border-amber-500/25' : 'bg-slate-900/40 border-white/5 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">☀️</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Daily Morning Mission</span>
                        {config.morningReminder && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Enabled
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sends today's goal, active streak, and top 5 priorities to start your day.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="time"
                      value={config.morningTime || '09:00'}
                      onChange={(e) => setConfig({ ...config, morningTime: e.target.value })}
                      disabled={!config.morningReminder}
                      className="bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                    <input
                      type="checkbox"
                      checked={config.morningReminder}
                      onChange={(e) => setConfig({ ...config, morningReminder: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Inactivity Alert */}
              <div className={`p-3 rounded-xl border transition ${config.inactivityAlert ? 'bg-rose-500/5 border-rose-500/25' : 'bg-slate-900/40 border-white/5 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">⏰</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Afternoon Inactivity Nudge</span>
                        {config.inactivityAlert && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Enabled
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Triggers if you have logged 0 study hours so far to protect your streak.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="time"
                      value={config.inactivityTime || '15:00'}
                      onChange={(e) => setConfig({ ...config, inactivityTime: e.target.value })}
                      disabled={!config.inactivityAlert}
                      className="bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                    <input
                      type="checkbox"
                      checked={config.inactivityAlert}
                      onChange={(e) => setConfig({ ...config, inactivityAlert: e.target.checked })}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Evening Recap */}
              <div className={`p-3 rounded-xl border transition ${config.eveningRecap ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-slate-900/40 border-white/5 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">🌙</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Evening Scorecard & Wrap-Up</span>
                        {config.eveningRecap && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Enabled
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sends final daily progress report, goal completion status, and streak recap.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="time"
                      value={config.eveningTime || '21:30'}
                      onChange={(e) => setConfig({ ...config, eveningTime: e.target.value })}
                      disabled={!config.eveningRecap}
                      className="bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                    <input
                      type="checkbox"
                      checked={config.eveningRecap}
                      onChange={(e) => setConfig({ ...config, eveningRecap: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Pomodoro Done Push */}
              <div className={`p-3 rounded-xl border transition ${config.pomodoroDoneAlert ? 'bg-indigo-500/5 border-indigo-500/25' : 'bg-slate-900/40 border-white/5 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">⏱️</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Focus Round Completion Ping</span>
                        {config.pomodoroDoneAlert && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Enabled
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sends instant message whenever a Pomodoro session is finished & saved.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.pomodoroDoneAlert}
                    onChange={(e) => setConfig({ ...config, pomodoroDoneAlert: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 24/7 Always-On (Prevent Render Sleep) Section */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-sky-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">24/7 Always-On Keep-Alive (Prevent Render Sleep)</h4>
                  <p className="text-[10px] text-slate-400">
                    Keep your website & Telegram bot alive 24/7 with zero cold-starts
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Self-Ping Active 💓
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              <b>Why Render sleeps:</b> Free Render instances spin down after 15 minutes of inactivity. When a user visits, it takes 40+ seconds to boot up again. To keep it awake 24/7 with <b>zero delay</b>, use a 100% free external pinger like <b>UptimeRobot</b>:
            </p>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="truncate mr-2 font-mono text-xs text-sky-300 select-all">
                {keepAliveUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyKeepalive}
                className="flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Keep-Alive URL</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-white/5 space-y-1">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Quick 1-Minute 24/7 Setup (Free Forever):
              </div>
              <div>1. Open <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">UptimeRobot.com</a> or <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">cron-job.org</a> (create free account).</div>
              <div>2. Click <b>"Add New Monitor"</b> → Monitor Type: <b>HTTP(s)</b>.</div>
              <div>3. Paste the URL above & set interval to <b>5 minutes</b>.</div>
              <div className="text-emerald-400 font-medium">✨ Done! Render will never sleep, loads instantly, and your morning/evening notifications will run 24/7!</div>
            </div>
          </div>

          {/* Telegram Credentials (Collapsible) */}
          <details className="text-xs text-slate-400 group">
            <summary className="cursor-pointer font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1">
              <span>Edit Bot Credentials & Chat ID</span>
            </summary>
            <div className="mt-2 space-y-2 p-3 rounded-2xl bg-slate-950 border border-white/10 font-mono text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Bot Token:</label>
                <input
                  type="text"
                  value={config.botToken}
                  onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Telegram Chat ID (Your personal ID):</label>
                <input
                  type="text"
                  value={config.chatId}
                  onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/80">
          <button
            onClick={() => handleSendTestNotification('progress')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Send Test Alert</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save & Sync 24/7 Schedules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
