import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDatabase, getAppState, saveAppState, resetDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize SQLite database
initDatabase();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'SQLite (better-sqlite3)',
    aiSupported: true,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Database endpoints
app.get('/api/data', (req, res) => {
  try {
    const data = getAppState(null);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Error fetching data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sync', (req, res) => {
  try {
    const state = req.body;
    if (!state || typeof state !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid state payload' });
    }
    saveAppState(state);
    res.json({ success: true, message: 'Saved to SQLite database successfully', savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[API] Error syncing data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reset', (req, res) => {
  try {
    const zeroData = req.body;
    resetDatabase(zeroData);
    res.json({ success: true, message: 'Database reset to zero state' });
  } catch (error) {
    console.error('[API] Error resetting database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================
// DYNAMIC GOOGLE GEMINI REST ENGINE WITH LISTMODELS DISCOVERY
// =========================================================

const DEFAULT_MODELS = [
  'gemini-2.0-flash-001',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash-001',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b'
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
          // Sort Flash models first
          const sorted = supported.sort((a, b) => {
            const aFlash = a.includes('flash');
            const bFlash = b.includes('flash');
            if (aFlash && !bFlash) return -1;
            if (!aFlash && bFlash) return 1;
            return 0;
          });

          console.log('[Gemini Discovery] Live models discovered for key:', sorted);
          keyModelCache.set(apiKey, { models: sorted, time: Date.now() });
          return sorted;
        }
      }
    }
  } catch (e) {
    console.warn('[Gemini Discovery] ListModels query failed:', e.message);
  }

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
      console.log(`[Gemini REST] Invoking ${model}...`);
      const responseText = await callGoogleGeminiRest(cleanKey, model, systemInstruction, promptText, expectJson);
      console.log(`[Gemini REST] Success with ${model}`);
      return { text: responseText, usedModel: model };
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini REST] ${model} failed:`, err.message);
      // Try next model if 404, 429, or deprecated
      continue;
    }
  }

  throw lastError || new Error('Failed to communicate with Gemini API across all models.');
}

// 1. Generic Gemini Chat / Completion
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
    console.error('[API /api/ai/chat Error]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. AI Technical & Data Science Interviewer
app.post('/api/ai/interview', async (req, res) => {
  try {
    const { track, currentQuestion, userResponse, history, apiKey, model } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    const systemInstruction = `You are an expert Senior Technical Interviewer and Hiring Manager for top AI/Tech companies (Google, Amazon, DeepMind).
Track: "${track || 'Data Science & Machine Learning'}".
Evaluate the candidate's exact answer with high technical rigor.
Respond strictly in JSON with this exact schema:
{
  "feedback": "Deep critique of the candidate's exact answer, identifying what was right and specifically what was missing or incorrect",
  "scores": {
    "technicalAccuracy": 8,
    "depthAndClarity": 7,
    "confidence": 8
  },
  "suggestedImprovement": "A polished, top-tier candidate phrasing for this exact question with math/code intuition",
  "nextQuestion": "The next progressive technical interview question in this track"
}`;

    const promptText = `Track: ${track}
Previous Question Asked: ${currentQuestion}
Candidate's Spoken Answer: "${userResponse}"
Conversation Context History: ${JSON.stringify(history || [])}

Carefully evaluate what the candidate said: "${userResponse}". If they say they don't know, provide the concept explanation in suggestedImprovement, give fair scores, and ask the next question. Return valid JSON.`;

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
      console.warn('[JSON Parse Warning] Raw response was not JSON:', text);
      parsed = {
        feedback: text,
        scores: { technicalAccuracy: 7, depthAndClarity: 7, confidence: 7 },
        suggestedImprovement: 'Review core mathematical and algorithmic definitions.',
        nextQuestion: 'Can you describe how you validate models to prevent data leakage in production?'
      };
    }

    res.json({ success: true, data: parsed, usedModel });
  } catch (error) {
    console.error('[API /api/ai/interview Error]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AI English Speaking & Pronunciation Coach
app.post('/api/ai/english-coach', async (req, res) => {
  try {
    const { mode, topic, spokenTranscript, history, apiKey, model } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    const systemInstruction = `You are an elite native English Speaking Coach and Conversational Partner.
Mode: "${mode || 'Conversational Dialogue'}".
Topic: "${topic || 'General Discussion'}".
You MUST evaluate the user's EXACT spoken words and reply naturally to what they actually said. DO NOT repeat canned greetings.

Respond in strict JSON with this exact schema:
{
  "conversationalReply": "A natural, warm, conversational spoken English response that directly addresses what the user just said",
  "grammarCorrections": [
    { "original": "flawed phrase from user", "corrected": "natural phrase", "explanation": "why this correction helps" }
  ],
  "vocabularyUpgrades": [
    { "simpleWord": "simple word user used", "upgrade": "sophisticated alternative", "example": "example sentence" }
  ],
  "fluencyRating": 4.5,
  "feedbackTip": "One specific actionable tip regarding pronunciation, grammar, or word choice"
}`;

    const promptText = `Topic: ${topic}
User's Spoken Utterance: "${spokenTranscript}"
Previous Conversation History: ${JSON.stringify(history || [])}

Evaluate what the user actually said ("${spokenTranscript}"). Respond naturally to their statement, point out any grammar issues if present (or leave empty if correct), suggest richer vocabulary, and keep the dialogue flowing! Return valid JSON.`;

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
    console.error('[API /api/ai/english-coach Error]:', error.message);
    res.status(500).json({ success: false, error: error.message });
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
  console.log(`🚀 [Server] OmniPrep Production Server running on port ${PORT}`);
});
