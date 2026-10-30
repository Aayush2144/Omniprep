import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import {
  DEFAULT_TELEGRAM_CONFIG,
  sendTelegramMessage,
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
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_TELEGRAM_CONFIG;
  });

  const [status, setStatus] = useState(null); // 'sending' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedPreview, setSelectedPreview] = useState('progress'); // 'progress' | 'morning' | 'inactivity' | 'evening'

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('omniprep_telegram_config', JSON.stringify(config));
    setStatus('success');
    setStatusMsg('Telegram notification settings saved successfully!');
    setTimeout(() => onClose(), 1200);
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

      // Send directly via Telegram API or backend proxy
      try {
        await sendTelegramMessage(config.botToken, config.chatId, messageText);
      } catch (browserErr) {
        // Fallback to backend proxy
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
      setStatusMsg('Alert sent! Check your Telegram app now 📲');
    } catch (err) {
      console.error('Telegram notification error:', err);
      setStatus('error');
      setStatusMsg(err.message || 'Failed to dispatch alert. Verify your Bot Token and Chat ID.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c1222] border border-sky-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Phone Progress Notifier</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-slate-400">Receive morning briefings, inactivity alerts & evening scorecards on your phone</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Bot Connection Status Pill */}
        <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-slate-300 font-medium">Connected Bot: </span>
              <a
                href={`https://t.me/${config.botUsername || 'Omni_tracker_progress_bot'}`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 font-mono font-bold hover:underline"
              >
                @{config.botUsername || 'Omni_tracker_progress_bot'}
              </a>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Chat ID: {config.chatId}</span>
        </div>

        {/* Quick Send Action Grid */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Instant Phone Alerts (Click to test send):
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSendTestNotification('progress')}
              disabled={status === 'sending'}
              className="p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-sky-500/40 text-left transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center justify-between">
                <span>📊 Live Status Now</span>
                <Send className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Hours logged, checklist & streak</p>
            </button>

            <button
              onClick={() => handleSendTestNotification('morning')}
              disabled={status === 'sending'}
              className="p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-amber-500/40 text-left transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
                <span>☀️ Morning Mission</span>
                <Send className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Today's target & top priorities</p>
            </button>

            <button
              onClick={() => handleSendTestNotification('inactivity')}
              disabled={status === 'sending'}
              className="p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-left transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-rose-300 flex items-center justify-between">
                <span>⚠️ Inactivity Warning</span>
                <Send className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Triggers if 0 hours studied</p>
            </button>

            <button
              onClick={() => handleSendTestNotification('evening')}
              disabled={status === 'sending'}
              className="p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-left transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
                <span>🌙 Evening Scorecard</span>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Final daily recap & wrap-up</p>
            </button>
          </div>
        </div>

        {/* Status / Feedback Banner */}
        {status === 'sending' && (
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center gap-2 animate-fade-in">
            <span className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <span>Sending notification to your phone via Telegram Bot...</span>
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

        {/* Automated Schedules & Triggers Settings */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <label className="text-xs font-semibold text-slate-300 block">
            Automatic Phone Schedules:
          </label>

          <div className="space-y-2">
            {/* Morning Trigger */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">☀️</span>
                <div>
                  <div className="font-semibold text-white">Daily Morning Mission</div>
                  <div className="text-[11px] text-slate-400">Sends today's goal and top pending tasks at 9:00 AM</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.morningReminder}
                onChange={(e) => setConfig({ ...config, morningReminder: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {/* Inactivity Alert */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">⏰</span>
                <div>
                  <div className="font-semibold text-white">Afternoon Inactivity Nudge</div>
                  <div className="text-[11px] text-slate-400">Warns you at 3:00 PM if zero study hours have been logged</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.inactivityAlert}
                onChange={(e) => setConfig({ ...config, inactivityAlert: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {/* Evening Recap */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">🌙</span>
                <div>
                  <div className="font-semibold text-white">Evening Wrap-Up Scorecard</div>
                  <div className="text-[11px] text-slate-400">Sends your final daily report and target progress at 9:30 PM</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.eveningRecap}
                onChange={(e) => setConfig({ ...config, eveningRecap: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {/* Pomodoro Done Push */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">⏱️</span>
                <div>
                  <div className="font-semibold text-white">Focus Round Completion Ping</div>
                  <div className="text-[11px] text-slate-400">Sends a quick ping on your phone whenever you save a study round</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.pomodoroDoneAlert}
                onChange={(e) => setConfig({ ...config, pomodoroDoneAlert: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Telegram Bot Details (Editable) */}
        <details className="text-xs text-slate-400 group">
          <summary className="cursor-pointer font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1">
            <span>Edit Bot Token or Chat ID</span>
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
              <label className="text-slate-400 block mb-1">Telegram Chat ID:</label>
              <input
                type="text"
                value={config.chatId}
                onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-white"
              />
            </div>
          </div>
        </details>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <button
            onClick={() => handleSendTestNotification('progress')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Send Alert to Phone</span>
          </button>

          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-600/30 transition"
            >
              Save Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
