import React, { useState, useEffect } from 'react';
import {
  Sparkles, Key, CheckCircle2, AlertCircle, Eye, EyeOff,
  ExternalLink, X, Cpu, ChevronDown
} from 'lucide-react';
import {
  // Gemini
  getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel,
  // OpenAI
  getOpenAIKey, setOpenAIKey, getOpenAIModel, setOpenAIModel,
  // Claude
  getClaudeKey, setClaudeKey, getClaudeModel, setClaudeModel,
  // Provider
  getStoredProvider, setStoredProvider,
} from '../../utils/geminiClient.js';

// ─── Provider metadata ────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: 'gemini',
    label: 'Google Gemini',
    color: 'indigo',
    badge: '🔵',
    keyPlaceholder: 'AIzaSy...',
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyLinkLabel: 'Get Free Key at Google AI Studio',
    models: [
      { value: 'auto', label: '✨ Auto-Detect Best Free Model (Recommended)' },
      { value: 'gemini-2.0-flash', label: '⚡ Gemini 2.0 Flash (15 RPM Free)' },
      { value: 'gemini-1.5-flash', label: '⚡ Gemini 1.5 Flash (15 RPM Free)' },
      { value: 'gemini-1.5-flash-latest', label: '⚡ Gemini 1.5 Flash Latest' },
      { value: 'gemini-1.5-pro', label: '🧠 Gemini 1.5 Pro (Paid Quota)' },
    ],
    defaultModel: 'auto',
    note: 'Flash models are completely free (15 req/min). Pro models require a billing account.',
    getKey: getStoredApiKey,
    setKey: setStoredApiKey,
    getModel: getStoredModel,
    setModel: setStoredModel,
  },
  {
    id: 'openai',
    label: 'ChatGPT (OpenAI)',
    color: 'emerald',
    badge: '🟢',
    keyPlaceholder: 'sk-...',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkLabel: 'Get Key at OpenAI Platform',
    models: [
      { value: 'gpt-4o-mini', label: '⚡ GPT-4o Mini (Fastest & Cheapest)' },
      { value: 'gpt-4o', label: '🧠 GPT-4o (Most Capable)' },
      { value: 'gpt-4-turbo', label: '🚀 GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: '💨 GPT-3.5 Turbo (Budget)' },
    ],
    defaultModel: 'gpt-4o-mini',
    note: 'Requires an OpenAI account with billing enabled. GPT-4o-mini is the most cost-effective.',
    getKey: getOpenAIKey,
    setKey: setOpenAIKey,
    getModel: getOpenAIModel,
    setModel: setOpenAIModel,
  },
  {
    id: 'claude',
    label: 'Claude (Anthropic)',
    color: 'amber',
    badge: '🟠',
    keyPlaceholder: 'sk-ant-...',
    keyLink: 'https://console.anthropic.ic/settings/keys',
    keyLinkLabel: 'Get Key at Anthropic Console',
    models: [
      { value: 'claude-3-5-haiku-20241022', label: '⚡ Claude 3.5 Haiku (Fastest)' },
      { value: 'claude-3-5-sonnet-20241022', label: '🧠 Claude 3.5 Sonnet (Smartest)' },
      { value: 'claude-3-opus-20240229', label: '🏆 Claude 3 Opus (Most Powerful)' },
    ],
    defaultModel: 'claude-3-5-haiku-20241022',
    note: 'Requires Anthropic billing. Claude 3.5 Haiku is fastest and most affordable.',
    getKey: getClaudeKey,
    setKey: setClaudeKey,
    getModel: getClaudeModel,
    setModel: setClaudeModel,
  },
];

const COLOR = {
  indigo: {
    border: 'border-indigo-500/30', bg: 'bg-indigo-500/20', text: 'text-indigo-400',
    ring: 'focus:border-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-500',
    activeBg: 'bg-indigo-600/20', activeBorder: 'border-indigo-500',
  },
  emerald: {
    border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', text: 'text-emerald-400',
    ring: 'focus:border-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-500',
    activeBg: 'bg-emerald-600/20', activeBorder: 'border-emerald-500',
  },
  amber: {
    border: 'border-amber-500/30', bg: 'bg-amber-500/20', text: 'text-amber-400',
    ring: 'focus:border-amber-500', btn: 'bg-amber-600 hover:bg-amber-500',
    activeBg: 'bg-amber-600/20', activeBorder: 'border-amber-500',
  },
};

export const ApiKeyModal = ({ isOpen, onClose }) => {
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [keys, setKeys] = useState({ gemini: '', openai: '', claude: '' });
  const [models, setModels] = useState({ gemini: 'auto', openai: 'gpt-4o-mini', claude: 'claude-3-5-haiku-20241022' });
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveProvider(getStoredProvider());
      setKeys({
        gemini: getStoredApiKey(),
        openai: getOpenAIKey(),
        claude: getClaudeKey(),
      });
      setModels({
        gemini: getStoredModel(),
        openai: getOpenAIModel(),
        claude: getClaudeModel(),
      });
      setTestStatus(null);
      setTestMessage('');
      setShowKey(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const provider = PROVIDERS.find((p) => p.id === activeProvider);
  const c = COLOR[provider.color];

  const handleSave = () => {
    // Save all keys + models
    setStoredApiKey(keys.gemini);
    setStoredModel(models.gemini);
    setOpenAIKey(keys.openai);
    setOpenAIModel(models.openai);
    setClaudeKey(keys.claude);
    setClaudeModel(models.claude);
    setStoredProvider(activeProvider);
    onClose();
  };

  const handleTestKey = async () => {
    const key = keys[activeProvider]?.trim();
    if (!key) {
      setTestStatus('invalid');
      setTestMessage('Please enter an API key first.');
      return;
    }
    setTestStatus('testing');
    setTestMessage('');

    try {
      if (activeProvider === 'gemini') {
        // Test via backend proxy
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: key,
            model: models.gemini,
            prompt: 'Say "Gemini API Connection Verified!" in 5 words.',
          }),
        });
        const json = await res.json();
        if (json.success) {
          setTestStatus('valid');
          setTestMessage(`Connected! Active engine: ${json.usedModel || models.gemini}`);
          setStoredApiKey(key);
          setStoredModel(models.gemini);
        } else {
          setTestStatus('invalid');
          setTestMessage(json.error || 'Invalid Gemini API key.');
        }

      } else if (activeProvider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: models.openai || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say "OpenAI Connection Verified!" in 5 words.' }],
            max_tokens: 20,
          }),
        });
        const json = await res.json();
        if (json.choices?.[0]?.message?.content) {
          setTestStatus('valid');
          setTestMessage(`Connected! Model: ${json.model || models.openai}`);
          setOpenAIKey(key);
          setOpenAIModel(models.openai);
        } else {
          setTestStatus('invalid');
          setTestMessage(json.error?.message || 'Invalid OpenAI API key.');
        }

      } else if (activeProvider === 'claude') {
        const res = await fetch('/api/ai/claude-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: key,
            model: models.claude || 'claude-3-5-haiku-20241022',
            systemInstruction: 'You are a helpful assistant.',
            promptText: 'Say "Claude Connection Verified!" in 5 words.',
          }),
        });
        const json = await res.json();
        if (json.success) {
          setTestStatus('valid');
          setTestMessage(`Connected! Model: ${models.claude}`);
          setClaudeKey(key);
          setClaudeModel(models.claude);
        } else {
          setTestStatus('invalid');
          setTestMessage(json.error || 'Invalid Claude API key.');
        }
      }
    } catch (err) {
      setTestStatus('invalid');
      setTestMessage(err.message || 'Connection failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${c.bg} ${c.text} border ${c.border}`}>
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">AI Provider Configuration</h3>
              <p className="text-xs text-slate-400">ChatGPT · Claude · Gemini — choose your coach</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {PROVIDERS.map((p) => {
            const pc = COLOR[p.color];
            const isActive = activeProvider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => { setActiveProvider(p.id); setTestStatus(null); setTestMessage(''); }}
                className={`p-3 rounded-2xl border text-center transition ${
                  isActive
                    ? `${pc.activeBg} ${pc.activeBorder} text-white shadow-lg`
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-lg mb-0.5">{p.badge}</div>
                <div className="text-[11px] font-bold text-white leading-tight">{p.label}</div>
              </button>
            );
          })}
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>{provider.label} API Key</span>
            <a
              href={provider.keyLink}
              target="_blank"
              rel="noreferrer"
              className={`text-[11px] ${c.text} hover:underline flex items-center gap-1`}
            >
              <span>{provider.keyLinkLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keys[activeProvider] || ''}
              onChange={(e) => {
                setKeys((prev) => ({ ...prev, [activeProvider]: e.target.value }));
                setTestStatus(null);
              }}
              placeholder={provider.keyPlaceholder}
              className={`w-full bg-slate-950 border border-white/15 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none ${c.ring} font-mono`}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold text-slate-300 flex items-center gap-1.5`}>
            <Cpu className={`w-3.5 h-3.5 ${c.text}`} />
            <span>{provider.label} Model:</span>
          </label>
          <select
            value={models[activeProvider] || provider.defaultModel}
            onChange={(e) => {
              setModels((prev) => ({ ...prev, [activeProvider]: e.target.value }));
              setTestStatus(null);
            }}
            className={`w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${c.ring}`}
          >
            {provider.models.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500">{provider.note}</p>
        </div>

        {/* Active Provider Badge */}
        <div className={`p-3 rounded-xl ${c.bg} border ${c.border} text-xs text-slate-300 flex items-center gap-2`}>
          <Sparkles className={`w-4 h-4 ${c.text} shrink-0`} />
          <span>
            Active coach for English Practice:{' '}
            <strong className="text-white">{PROVIDERS.find((p) => p.id === getStoredProvider())?.label || 'Gemini'}</strong>
            {' '}— save to switch to <strong className="text-white">{provider.label}</strong>.
          </span>
        </div>

        {/* Test Result */}
        {testStatus === 'valid' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong>Connection Successful!</strong>
              <div className="text-[11px] text-emerald-400/90 mt-0.5 font-mono">{testMessage}</div>
            </div>
          </div>
        )}
        {testStatus === 'invalid' && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{testMessage || 'Authentication failed. Check your API key.'}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {testStatus === 'testing' ? (
              <>
                <span className={`w-3 h-3 rounded-full border-2 ${c.text} border-t-transparent animate-spin`} />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-1.5 ${c.btn} text-white rounded-xl text-xs font-semibold shadow-lg transition`}
            >
              Save & Activate
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
