import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle2, AlertCircle, Eye, EyeOff, ExternalLink, X, Cpu } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel } from '../../utils/geminiClient.js';

export const ApiKeyModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('auto');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'valid' | 'invalid'
  const [activeModelName, setActiveModelName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setModel(getStoredModel());
      setTestStatus(null);
      setErrorMessage('');
      setActiveModelName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStoredModel(model);
    onClose();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('invalid');
      setErrorMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');
    setActiveModelName('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: model,
          prompt: 'Say "Gemini API Connection Verified!" in 5 words.'
        })
      });

      const json = await res.json();
      if (json.success) {
        setTestStatus('valid');
        setActiveModelName(json.usedModel || 'gemini-2.0-flash');
        setStoredApiKey(apiKey.trim());
        setStoredModel(model);
      } else {
        setTestStatus('invalid');
        setErrorMessage(json.error || 'Invalid API Key or Model unavailable.');
      }
    } catch (err) {
      setTestStatus('invalid');
      setErrorMessage(err.message || 'Connection failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Google Gemini API Configuration</h3>
              <p className="text-xs text-slate-400">Power AI Technical Interviews & English Speaking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Gemini API Key</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Get Free Key at Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestStatus(null);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-white/15 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
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
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini AI Model Engine:</span>
          </label>
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setTestStatus(null);
            }}
            className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="auto">✨ Auto-Detect Best Free Model (Recommended)</option>
            <option value="gemini-2.0-flash">⚡ Gemini 2.0 Flash (15 RPM Free Tier)</option>
            <option value="gemini-1.5-flash">⚡ Gemini 1.5 Flash (15 RPM Free Tier)</option>
            <option value="gemini-1.5-flash-latest">⚡ Gemini 1.5 Flash Latest</option>
            <option value="gemini-1.5-pro">🧠 Gemini 1.5 Pro (Low/Zero Free Quota)</option>
          </select>
          <p className="text-[10px] text-slate-500">
            Note: <strong>Flash models</strong> are completely free (15 requests/min). <strong>Pro models</strong> may require a billing account.
          </p>
        </div>

        {/* Test Result Message */}
        {testStatus === 'valid' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong>Gemini API Connected!</strong>
              <div className="text-[11px] text-emerald-400/90 mt-0.5">
                Active engine verified: <span className="font-mono font-semibold text-white">{activeModelName}</span>
              </div>
            </div>
          </div>
        )}

        {testStatus === 'invalid' && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage || 'Failed to authenticate with Gemini API.'}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
          >
            {testStatus === 'testing' ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
