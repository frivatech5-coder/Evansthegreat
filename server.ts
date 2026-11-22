import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FirebaseClientConfig {
  projectId: string;
}

function loadFirebaseProjectId(): string {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw) as FirebaseClientConfig;
  return parsed.projectId;
}

const FIREBASE_PROJECT_ID = loadFirebaseProjectId();
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

// Cached Google x509 public certs for Firebase ID token verification
let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch Firebase auth certificates (${resp.status})`);
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedCerts = (await resp.json()) as Record<string, string>;
  certsExpiresAt = now + maxAgeSec * 1000;
  return cachedCerts;
}

function decodeBase64Url(segment: string): Buffer {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padLen), 'base64');
}

interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
}

async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed bearer token');
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(decodeBase64Url(headerB64).toString('utf8')) as {
    alg?: string;
    kid?: string;
  };
  const payload = JSON.parse(decodeBase64Url(payloadB64).toString('utf8')) as {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
    email?: string;
    email_verified?: boolean;
  };

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Invalid token algorithm or key ID');
  }
  const certs = await getFirebasePublicCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error('Unknown signing key ID');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();
  const signature = decodeBase64Url(signatureB64);
  if (!verifier.verify(cert, signature)) {
    throw new Error('Invalid token signature');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new Error('Token audience mismatch');
  }
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
    throw new Error('Token issuer mismatch');
  }
  if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 128) {
    throw new Error('Invalid token subject');
  }
  if (!payload.exp || payload.exp <= nowSec) {
    throw new Error('Token expired');
  }
  if (!payload.iat || payload.iat > nowSec + 300) {
    throw new Error('Token issued in the future');
  }
  if (payload.email_verified !== true) {
    throw new Error('Verified email required');
  }

  return {
    uid: payload.sub,
    email: payload.email,
    emailVerified: true,
  };
}

interface AuthedRequest extends Request {
  authUser?: VerifiedFirebaseUser;
}

async function requireFirebaseAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please sign in first.' });
      return;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: 'Missing authentication token.' });
      return;
    }
    req.authUser = await verifyFirebaseIdToken(token);
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid session token';
    res.status(401).json({ error: `Unauthorized: ${message}` });
  }
}

const VALID_MODES = [
  'CLEAR MY MIND',
  'DAILY CHECK-IN',
  'ACCOUNTABILITY',
  'FAITH AND WISDOM',
  'BUSINESS AND WEALTH',
  'DECISION ROOM',
  'EMOTIONAL SUPPORT',
  'CODING GUIDE',
] as const;

type MentorMode = (typeof VALID_MODES)[number];

const MODE_INSTRUCTIONS: Record<MentorMode, string> = {
  'CLEAR MY MIND':
    'Mode: CLEAR MY MIND. The user may feel overwhelmed or scattered. First reflect back what you hear, ask 1-2 clarifying questions to separate facts from noise, and help organize their thoughts into 2-3 clear priorities.',
  'DAILY CHECK-IN':
    'Mode: DAILY CHECK-IN. Review the user\'s day calmly across discipline, learning, character, and rest. Celebrate honest effort, examine any missed commitments without shame, and establish one concrete focus for tomorrow.',
  'ACCOUNTABILITY':
    'Mode: ACCOUNTABILITY. Help the user confront excuses respectfully and directly. Do not flatter or enable avoidance. Ask what commitment they made, what got in the way, and what single verifiable step they will take in the next 24 hours.',
  'FAITH AND WISDOM':
    'Mode: FAITH AND WISDOM. Discuss biblical wisdom and Christian character (Jesus Christ, Scripture, humility, self-control, integrity). Be clear that you are an AI study tool, NOT Jesus, God, a pastor, or a replacement for Scripture, prayer, or local church fellowship.',
  'BUSINESS AND WEALTH':
    'Mode: BUSINESS AND WEALTH. Think strategically about skill acquisition, solving real problems for people, budgeting, saving, and ethical enterprise. Never promise guaranteed wealth or get-rich-quick shortcuts.',
  'DECISION ROOM':
    'Mode: DECISION ROOM. Help analyze a difficult choice rigorously: clarify values, spot peer-pressure influence, weigh second-order consequences over 1 week / 1 year / 5 years, and identify reversible vs irreversible factors.',
  'EMOTIONAL SUPPORT':
    'Mode: EMOTIONAL SUPPORT. Listen patiently and validate real struggle without feeding self-pity or creating dependency on the AI. Help steady their breathing and perspective, and encourage speaking with a trusted family member, mentor, or counselor.',
  'CODING GUIDE':
    'Mode: CODING GUIDE. Explain programming, web engineering, Python, or software architecture concepts clearly using mental models and Socratic follow-up questions. Guide the learner to write and debug their own solution rather than doing all the work for them.',
};

const CORE_MENTOR_INSTRUCTION = `You are THE MENTOR inside PROJECT REBIRTH ("Jishinde Ushinde — Conquer Yourself to Conquer"), a personal development operating system for a young person pursuing discipline, Christian faith, software engineering mastery, financial intelligence, and independence from peer pressure.

CORE IDENTITY & BOUNDARIES (STRICT):
1. You are an AI mentor tool. NEVER claim or imply that you are Jesus, God, a pastor, a licensed therapist, or a human friend.
2. Listen carefully first. Ask 1-2 thoughtful follow-up questions before rushing to a long lecture when context is still unfolding.
3. Help organize confusing thoughts into structured, calm clarity.
4. Challenge irrational thinking, self-deception, or peer-driven thinking respectfully and honestly—never blindly agree just to please.
5. Offer practical, concrete next steps grounded in reality.
6. Encourage honesty, ownership, and real-world human accountability (trusted adults, parents, mentors, pastors, church community).
7. NEVER shame, mock, or demean the user for setbacks, failures, or temptations.
8. Avoid fostering emotional dependency on AI; remind the user their strength grows through real-world action, faith, and trusted human relationships.
9. SAFETY PROTOCOL: If the user mentions self-harm, suicide, physical danger, abuse, or an urgent emergency, immediately stop standard coaching, respond with care, and urge them to contact a trusted adult and local emergency services right away.
10. Keep responses concise, structured, warm yet disciplined—no clichés, no robotic bullet spam, no empty hype.`;

const CRISIS_REGEX = /\b(suicide|kill myself|end my life|self[- ]harm|cut myself|hurt myself|want to die|abuse|abused|assault|emergency|in danger right now)\b/i;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ExtractedGeminiError {
  statusCode: number;
  message: string;
  isTransient: boolean;
}

function unwrapErrorMessage(raw: string): { code?: number; status?: string; message: string } {
  let current = raw.trim();
  let code: number | undefined;
  let status: string | undefined;

  for (let depth = 0; depth < 3; depth++) {
    if (!current.startsWith('{')) break;
    try {
      const parsed = JSON.parse(current) as {
        error?: { code?: number; status?: string; message?: string } | string;
        code?: number;
        status?: string;
        message?: string;
      };
      if (parsed.error && typeof parsed.error === 'object') {
        code = parsed.error.code ?? parsed.code ?? code;
        status = parsed.error.status ?? parsed.status ?? status;
        if (typeof parsed.error.message === 'string') {
          current = parsed.error.message.trim();
          continue;
        }
      }
      code = parsed.code ?? code;
      status = parsed.status ?? status;
      if (typeof parsed.message === 'string') {
        current = parsed.message.trim();
        continue;
      }
      if (typeof parsed.error === 'string') {
        current = parsed.error.trim();
        continue;
      }
      break;
    } catch {
      break;
    }
  }

  return { code, status, message: current };
}

function extractGeminiErrorInfo(err: unknown): ExtractedGeminiError {
  const rawMessage = err instanceof Error ? err.message : String(err || 'Unknown error');
  const errObj = err && typeof err === 'object' ? (err as { status?: number; code?: number }) : {};
  const unwrapped = unwrapErrorMessage(rawMessage);
  const code = unwrapped.code ?? errObj.status ?? errObj.code;
  const statusText = (unwrapped.status || '').toUpperCase();
  const lower = unwrapped.message.toLowerCase();

  if (rawMessage.includes('GEMINI_API_KEY')) {
    return {
      statusCode: 503,
      message: 'Mentor AI key is not configured. Check Settings > Secrets.',
      isTransient: false,
    };
  }

  if (code === 401 || code === 403 || statusText === 'PERMISSION_DENIED' || lower.includes('api key')) {
    return {
      statusCode: 503,
      message: 'Mentor AI authentication failed. Check your API key in Settings > Secrets.',
      isTransient: false,
    };
  }

  const isRateLimit =
    code === 429 || statusText === 'RESOURCE_EXHAUSTED' || lower.includes('rate limit') || lower.includes('quota');
  const isOverloaded =
    code === 503 ||
    code === 502 ||
    code === 504 ||
    code === 500 ||
    statusText === 'UNAVAILABLE' ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('temporarily unavailable') ||
    lower.includes('service unavailable') ||
    lower.includes('timed out');

  if (isOverloaded) {
    return {
      statusCode: 503,
      message: 'The Mentor AI service is temporarily experiencing high demand. Please retry in a few seconds.',
      isTransient: true,
    };
  }

  if (isRateLimit) {
    return {
      statusCode: 429,
      message: 'The Mentor AI service is briefly busy. Please wait a moment and try again.',
      isTransient: true,
    };
  }

  return {
    statusCode: typeof code === 'number' && code >= 400 && code < 600 ? code : 500,
    message: unwrapped.message || 'Unable to reach The Mentor right now. Please try again.',
    isTransient: false,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

interface GeminiChunkLike {
  text?: string;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        thought?: boolean;
      }>;
    };
  }>;
}

function extractChunkText(chunk: GeminiChunkLike | undefined): string {
  if (!chunk) return '';
  if (typeof chunk.text === 'string' && chunk.text.length > 0) {
    return chunk.text;
  }
  const parts = chunk.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    let out = '';
    for (const part of parts) {
      if (typeof part?.text === 'string' && part.thought !== true) {
        out += part.text;
      }
    }
    return out;
  }
  return '';
}

function buildNormalizedContents(
  formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  rawMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const combined = [...formattedHistory];
  const lastTurn = combined[combined.length - 1];
  const lastText = lastTurn?.parts[0]?.text?.trim();
  if (!(lastTurn?.role === 'user' && lastText === rawMessage.trim())) {
    combined.push({ role: 'user', parts: [{ text: rawMessage }] });
  }

  const normalized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const turn of combined) {
    const text = turn.parts.map((p) => p.text).join('\n').trim();
    if (!text) continue;
    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === turn.role) {
      prev.parts[0].text = `${prev.parts[0].text}\n\n${text}`;
    } else {
      normalized.push({ role: turn.role, parts: [{ text }] });
    }
  }
  return normalized;
}

let hydrogenCooldownUntil = 0;
const HYDROGEN_COOLDOWN_MS = 60_000;

function getMentorAttempts(): Array<{
  model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
  delayBeforeMs: number;
  useStream: boolean;
}> {
  if (Date.now() < hydrogenCooldownUntil) {
    return [
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 0, useStream: true },
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 350, useStream: false },
      { model: 'gemini-4-hydrogen', delayBeforeMs: 500, useStream: true },
    ];
  }
  return [
    { model: 'gemini-4-hydrogen', delayBeforeMs: 0, useStream: true },
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 150, useStream: true },
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 450, useStream: false },
    { model: 'gemini-4-hydrogen', delayBeforeMs: 700, useStream: false },
  ];
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'project-rebirth' });
  });

  app.post('/api/mentor/chat', requireFirebaseAuth, async (req: AuthedRequest, res: Response) => {
    const body = req.body as {
      mode?: unknown;
      message?: unknown;
      history?: unknown;
      contextSummary?: unknown;
    };

    const mode: MentorMode =
      typeof body.mode === 'string' && (VALID_MODES as readonly string[]).includes(body.mode)
        ? (body.mode as MentorMode)
        : 'CLEAR MY MIND';

    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
    if (!rawMessage || rawMessage.length > 6000) {
      res.status(400).json({ error: 'Message must be between 1 and 6000 characters.' });
      return;
    }

    const rawHistory = Array.isArray(body.history) ? body.history.slice(-14) : [];
    const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const item of rawHistory) {
      if (
        item &&
        typeof item === 'object' &&
        ('role' in item) &&
        ('content' in item) &&
        typeof (item as { content: unknown }).content === 'string'
      ) {
        const roleVal = (item as { role: unknown }).role;
        const contentVal = (item as { content: string }).content.slice(0, 6000);
        if ((roleVal === 'user' || roleVal === 'assistant') && contentVal.trim()) {
          formattedHistory.push({
            role: roleVal === 'assistant' ? 'model' : 'user',
            parts: [{ text: contentVal }],
          });
        }
      }
    }

    const contextSummary =
      typeof body.contextSummary === 'string' ? body.contextSummary.slice(0, 800) : '';
    const safetyTriggered = CRISIS_REGEX.test(rawMessage);

    const systemInstruction = [
      CORE_MENTOR_INSTRUCTION,
      MODE_INSTRUCTIONS[mode],
      contextSummary ? `User's current non-sensitive context snapshot: ${contextSummary}` : '',
      safetyTriggered
        ? 'CRITICAL: The user message indicates possible self-harm, danger, abuse, or crisis. Immediately prioritize safety: express care, urge contacting a trusted adult and local emergency services immediately, and do not continue normal productivity coaching.'
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const ai = getGeminiClient();
      const contents = buildNormalizedContents(formattedHistory, rawMessage);

      let acquiredReply:
        | {
            kind: 'stream';
            iterator: AsyncIterator<GeminiChunkLike>;
            firstText: string;
          }
        | {
            kind: 'single';
            fullText: string;
          }
        | null = null;
      let lastError: unknown = null;

      for (const attempt of getMentorAttempts()) {
        if (attempt.delayBeforeMs > 0) {
          const jitter = Math.floor(Math.random() * 150);
          await sleep(attempt.delayBeforeMs + jitter);
        }
        try {
          if (attempt.useStream) {
            const stream = await withTimeout(
              ai.models.generateContentStream({
                model: attempt.model,
                contents,
                config: { systemInstruction },
              }),
              15_000,
              `Mentor stream (${attempt.model})`
            );
            const iterator = stream[Symbol.asyncIterator]() as AsyncIterator<GeminiChunkLike>;
            let firstText = '';
            while (true) {
              const nextChunk = await withTimeout(
                iterator.next(),
                15_000,
                `Mentor first chunk (${attempt.model})`
              );
              if (nextChunk.done) break;
              const chunkText = extractChunkText(nextChunk.value);
              if (chunkText.length > 0) {
                firstText = chunkText;
                break;
              }
            }
            if (!firstText) {
              lastError = new Error('The Mentor returned an empty response. Please try again.');
              continue;
            }
            if (attempt.model === 'gemini-4-hydrogen') {
              hydrogenCooldownUntil = 0;
            }
            acquiredReply = { kind: 'stream', iterator, firstText };
            break;
          } else {
            const singleResp = await withTimeout(
              ai.models.generateContent({
                model: attempt.model,
                contents,
                config: { systemInstruction },
              }),
              20_000,
              `Mentor generate (${attempt.model})`
            );
            const fullText = extractChunkText(singleResp as GeminiChunkLike);
            if (!fullText.trim()) {
              lastError = new Error('The Mentor returned an empty response. Please try again.');
              continue;
            }
            if (attempt.model === 'gemini-4-hydrogen') {
              hydrogenCooldownUntil = 0;
            }
            acquiredReply = { kind: 'single', fullText };
            break;
          }
        } catch (attemptErr) {
          lastError = attemptErr;
          const msgLower = (attemptErr instanceof Error ? attemptErr.message : '').toLowerCase();
          const info = extractGeminiErrorInfo(attemptErr);
          const isTimeout = msgLower.includes('timed out');
          if (!info.isTransient && !isTimeout) {
            throw attemptErr;
          }
          if (attempt.model === 'gemini-4-hydrogen') {
            hydrogenCooldownUntil = Date.now() + HYDROGEN_COOLDOWN_MS;
          }
        }
      }

      if (!acquiredReply) {
        throw lastError || new Error('Unable to reach The Mentor right now.');
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      if (safetyTriggered) {
        res.write(`event: safety\ndata: ${JSON.stringify({ safetyAlert: true })}\n\n`);
      }

      if (acquiredReply.kind === 'single') {
        res.write(`data: ${JSON.stringify({ text: acquiredReply.fullText })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ text: acquiredReply.firstText })}\n\n`);
        while (true) {
          const nextResult = await acquiredReply.iterator.next();
          if (nextResult.done) break;
          const textChunk = extractChunkText(nextResult.value);
          if (textChunk) {
            res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
          }
        }
      }

      res.write(`event: done\ndata: ${JSON.stringify({ done: true, safetyAlert: safetyTriggered })}\n\n`);
      res.end();
    } catch (err) {
      const info = extractGeminiErrorInfo(err);
      console.error('Mentor API error:', info.statusCode, info.message);
      if (!res.headersSent) {
        res.status(info.statusCode).json({ error: info.message });
      } else {
        res.write(`event: error\ndata: ${JSON.stringify({ error: info.message })}\n\n`);
        res.end();
      }
    }
  });

  if (!IS_PROD) {
    // Vite 8 injects /@vite/client in middlewareMode even when hmr/ws are false,
    // which opens a WebSocket to port 24678 and fails behind the proxy.
    // Serve a compatible no-WebSocket /@vite/client shim that preserves CSS injection.
    app.get('/@vite/client', (_req: Request, res: Response) => {
      res.type('application/javascript; charset=utf-8').send(`
const sheetsMap = new Map();

export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
  } else {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}

export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}

export function createHotContext() {
  const noop = () => {};
  return {
    data: {},
    accept: noop,
    acceptExports: noop,
    dispose: noop,
    prune: noop,
    decline: noop,
    invalidate: noop,
    on: noop,
    off: noop,
    send: noop,
  };
}

export function injectQuery(url, queryToInject) {
  if (!url || (url[0] !== '.' && url[0] !== '/')) return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return \`\${pathname}?\${queryToInject}\${search ? '&' + search.slice(1) : ''}\${hash || ''}\`;
}

export class ErrorOverlay {
  constructor() {}
}
`.trimStart());
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PROJECT REBIRTH server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
