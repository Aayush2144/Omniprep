import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  initDatabase,
  getAppState,
  saveAppState,
  resetDatabase,
  getUserState,
  saveUserState,
  registerOrUpdateUser,
  getAllUsers,
  setUserRole,
  updateUserPresence,
  getLiveStudyingUsers,
  getLeaderboard,
  getAdminMetrics,
  getActiveAnnouncements,
  createAnnouncement,
  toggleAnnouncement
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Multi-User SQLite / PostgreSQL database
initDatabase().catch(err => console.error('[Database Init Error]:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: process.env.DATABASE_URL ? 'PostgreSQL (Cloud Persistent 🐘)' : 'SQLite (Local 💾)',
    aiSupported: true,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// =========================================================
// MULTI-USER AUTH & STATE ENDPOINTS
// =========================================================

// 1. Register or Update User Profile
app.post('/api/user/profile', async (req, res) => {
  try {
    const user = await registerOrUpdateUser(req.body);
    res.json({ success: true, user });
  } catch (error) {
    console.error('[API /api/user/profile Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Fetch Isolated User State
app.get('/api/user/data', async (req, res) => {
  try {
    const { userId } = req.query;
    const data = await getUserState(userId, null);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API /api/user/data Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Sync User State
app.post('/api/user/sync', async (req, res) => {
  try {
    const { userId, state } = req.body;
    if (!state || typeof state !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid state payload' });
    }
    await saveUserState(userId, state);
    res.json({ success: true, message: 'User state saved successfully', savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[API /api/user/sync Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Live Presence Heartbeat ("Who is Studying Live")
app.post('/api/user/presence', async (req, res) => {
  try {
    const { uid, presence } = req.body;
    await updateUserPresence(uid, presence);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy single-user compatibility endpoints
app.get('/api/data', async (req, res) => {
  try {
    const data = await getAppState(null);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sync', async (req, res) => {
  try {
    const state = req.body;
    await saveAppState(state);
    res.json({ success: true, message: 'Saved to database' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    await resetDatabase(req.body);
    res.json({ success: true, message: 'Database reset' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================
// COMMUNITY & LEADERBOARD ENDPOINTS
// =========================================================

// 1. Live Studiers Now
app.get('/api/community/live-users', async (req, res) => {
  try {
    const liveUsers = await getLiveStudyingUsers();
    res.json({ success: true, liveUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Multi-Category Leaderboard
app.get('/api/community/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Announcements
app.get('/api/community/announcements', async (req, res) => {
  try {
    const announcements = await getActiveAnnouncements();
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================
// ADMIN CONTROL & TELEMETRY ENDPOINTS
// =========================================================

// 1. Admin Telemetry Metrics
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const metrics = await getAdminMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. All Users Management Table
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Change User Role (Admin <-> User)
app.post('/api/admin/set-role', async (req, res) => {
  try {
    const { uid, role } = req.body;
    const user = await setUserRole(uid, role);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3b. Claim Admin with Master Security Key
app.post('/api/admin/claim-admin', async (req, res) => {
  try {
    const { uid, masterPin } = req.body;
    const MASTER_SECRET = process.env.ADMIN_MASTER_PIN || 'OmniAdmin2026';
    
    if (masterPin !== MASTER_SECRET) {
      return res.status(403).json({ success: false, error: 'Incorrect Master Admin PIN' });
    }

    const user = await setUserRole(uid, 'admin');
    res.json({ success: true, message: 'Admin permissions granted successfully!', user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Create Broadcast Announcement
app.post('/api/admin/announcements', async (req, res) => {
  try {
    const { message, type, createdBy } = req.body;
    const announcements = await createAnnouncement(message, type, createdBy);
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Toggle Announcement Status
app.post('/api/admin/toggle-announcement', async (req, res) => {
  try {
    const { id, active } = req.body;
    const announcements = await toggleAnnouncement(id, active);
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================
// DYNAMIC GOOGLE GEMINI REST ENGINE WITH LISTMODELS DISCOVERY
// =========================================================

const DEFAULT_MODELS = [
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash',
  'gemini-2.5-flash'
];

const keyModelCache = new Map();

async function getLiveModelsForApiKey(apiKey) {
  if (!apiKey) return DEFAULT_MODELS;
  
  const cached = keyModelCache.get(apiKey);
  if (cached && Date.now() - cached.time < 15 * 60 * 1000) {
    return cached.models;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.models)) {
        const supported = data.models
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));

        if (supported.length > 0) {
          const sorted = supported.sort((a, b) => {
            const aFlash = a.includes('flash');
            const bFlash = b.includes('flash');
            if (aFlash && !bFlash) return -1;
            if (!aFlash && bFlash) return 1;
            return 0;
          });

          keyModelCache.set(apiKey, { models: sorted, time: Date.now() });
          return sorted;
        }
      }
    }
  } catch (e) {}

  return DEFAULT_MODELS;
}

async function callGoogleGeminiRest(apiKey, modelName, systemInstruction, promptText, expectJson = true) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ]
  };

  if (systemInstruction) {
    payload.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (expectJson) {
    payload.generationConfig = {
      temperature: 0.7,
      response_mime_type: 'application/json'
    };
  } else {
    payload.generationConfig = {
      temperature: 0.7
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let parsedErr = errorBody;
    try {
      const j = JSON.parse(errorBody);
      parsedErr = j.error?.message || errorBody;
    } catch (e) {}
    throw new Error(`[${modelName} HTTP ${res.status}] ${parsedErr}`);
  }

  const json = await res.json();
  const candidate = json.candidates?.[0];
  const responseText = candidate?.content?.parts?.[0]?.text;
  
  if (!responseText) {
    throw new Error('Gemini returned an empty candidate text.');
  }

  return responseText;
}

async function executeGeminiWithFallback(apiKey, systemInstruction, promptText, preferredModel = null, expectJson = true) {
  const cleanKey = apiKey ? apiKey.trim() : '';

  if (!cleanKey) {
    throw new Error('No Gemini API key provided. Please configure your key in Settings.');
  }

  const liveModels = await getLiveModelsForApiKey(cleanKey);
  const modelsToTry = preferredModel && preferredModel !== 'auto'
    ? [preferredModel.replace(/^models\//, ''), ...liveModels.filter(m => m !== preferredModel)]
    : liveModels;

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const responseText = await callGoogleGeminiRest(cleanKey, model, systemInstruction, promptText, expectJson);
      return { text: responseText, usedModel: model };
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to communicate with Gemini API across all models.');
}

// 1. Generic Gemini Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, systemInstruction, apiKey, model } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;
    const { text, usedModel } = await executeGeminiWithFallback(
      key,
      systemInstruction || 'You are an elite AI preparation coach for Data Science, GATE, and English Fluency.',
      prompt,
      model,
      false
    );
    res.json({ success: true, text, usedModel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. AI Technical & Data Science Interviewer
app.post('/api/ai/interview', async (req, res) => {
  try {
    const { track, currentQuestion, userResponse, history, apiKey, model } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    const systemInstruction = `You are a Senior Technical Interviewer for top AI/Tech companies. Track: "${track || 'Data Science & Machine Learning'}". Respond in strict JSON.`;
    const promptText = `Track: ${track}\nQuestion: ${currentQuestion}\nCandidate: "${userResponse}"\nContext: ${JSON.stringify(history || [])}`;

    const { text, usedModel } = await executeGeminiWithFallback(
      key,
      systemInstruction,
      promptText,
      model,
      true
    );

    let parsed;
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = {
        feedback: text,
        scores: { technicalAccuracy: 8, depthAndClarity: 7, confidence: 8 },
        suggestedImprovement: 'Explain mathematical formulation and production trade-offs.',
        nextQuestion: 'Can you describe how you validate models to prevent data leakage?'
      };
    }

    res.json({ success: true, data: parsed, usedModel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Claude Proxy (Anthropic API — CORS-restricted in browser) ─────────────
app.post('/api/ai/claude-proxy', async (req, res) => {
  try {
    const { apiKey, model, systemInstruction, promptText } = req.body;
    const key = (apiKey || process.env.CLAUDE_API_KEY || '').trim();
    if (!key) {
      return res.status(400).json({ success: false, error: 'No Claude API key provided.' });
    }

    const cleanModel = (model || 'claude-3-5-haiku-20241022').trim();

    const messages = [{ role: 'user', content: promptText }];

    const payload = {
      model: cleanModel,
      max_tokens: 2048,
      messages,
    };
    if (systemInstruction) payload.system = systemInstruction;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (!claudeRes.ok) {
      const errBody = await claudeRes.text();
      let msg = errBody;
      try { msg = JSON.parse(errBody).error?.message || errBody; } catch (_) {}
      return res.status(claudeRes.status).json({ success: false, error: `[Claude ${claudeRes.status}] ${msg}` });
    }

    const json = await claudeRes.json();
    const text = json.content?.[0]?.text;
    if (!text) return res.status(502).json({ success: false, error: 'Empty response from Claude.' });

    res.json({ success: true, text, usedModel: cleanModel });
  } catch (error) {
    console.error('[Claude Proxy Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AI English Speaking & Pronunciation Coach
app.post('/api/ai/english-coach', async (req, res) => {
  try {
    const { mode, topic, spokenTranscript, history, apiKey, model } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    const systemInstruction = `You are an elite native English Speaking Coach. Mode: "${mode}". Topic: "${topic}". Respond in strict JSON.`;
    const promptText = `Topic: ${topic}\nUser Spoken: "${spokenTranscript}"\nContext: ${JSON.stringify(history || [])}`;

    const { text, usedModel } = await executeGeminiWithFallback(
      key,
      systemInstruction,
      promptText,
      model,
      true
    );

    let parsed;
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = {
        conversationalReply: text,
        grammarCorrections: [],
        vocabularyUpgrades: [],
        fluencyRating: 4.5,
        feedbackTip: 'Keep expressing yourself with confidence!'
      };
    }

    res.json({ success: true, data: parsed, usedModel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Telegram Notification API Endpoint ──────────────────────────────────
app.post('/api/notify/telegram', async (req, res) => {
  try {
    const { botToken, chatId, text, parseMode } = req.body;
    const token = (botToken || process.env.TELEGRAM_BOT_TOKEN || '9046473887:AAFPiAqur4eB32KQIH0TZfTu0fwzZc-80qE').trim();
    // Default to Aayush's verified chat ID: 7418291817
    let cid = (chatId || process.env.TELEGRAM_CHAT_ID || '7418291817').trim();
    if (cid === '9046473887') {
      cid = '7418291817'; // Auto-correct if bot's own ID was mistakenly passed
    }

    if (!token || !cid) {
      return res.status(400).json({ success: false, error: 'Telegram Bot Token or Chat ID missing.' });
    }

    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgRes = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cid,
        text: text || 'OmniPrep Notification',
        parse_mode: parseMode || 'HTML',
        disable_web_page_preview: true
      }),
    });

    const json = await tgRes.json();
    if (!json.ok) {
      return res.status(tgRes.status || 400).json({ success: false, error: json.description || 'Telegram API rejected message.' });
    }

    res.json({ success: true, messageId: json.result?.message_id });
  } catch (err) {
    console.error('[Telegram API Proxy Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================
// PRODUCTION STATIC FILE SERVING (Single-Port Web App)
// =========================================================

if (fs.existsSync(distPath)) {
  console.log(`[Production] Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // Express 5 SPA Fallback Middleware
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else if (req.path.startsWith('/api')) {
      res.status(404).json({ success: false, error: 'API route not found' });
    } else {
      next();
    }
  });
}

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Server] OmniPrep Multi-User Production Server running on port ${PORT}`);
});
