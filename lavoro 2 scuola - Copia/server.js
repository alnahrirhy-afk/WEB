/*
 Minimal Node/Express backend example for hidden admin login
 - POST /api/admin/login-hidden
 - session-based auth for /admin/dashboard
 - simple in-memory lockout per IP (for demo). For production use Redis and a proper DB.
 - Audit logs appended to logs/admin_login_attempts.log (JSON lines)

 Usage:
 1. copy .env.example to .env and set ADMIN_PASSWORD and SESSION_SECRET
 2. npm install
 3. npm start
*/

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret';
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_MINUTES || '15', 10);
const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS || '3', 10);

// ensure logs dir
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const AUDIT_LOG = path.join(LOG_DIR, 'admin_login_attempts.log');

// Basic middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session (MemoryStore for demo only)
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true behind HTTPS in production
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 // 1 hour session
  }
}));

// Global rate limiter (gentle)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// In-memory failed attempts store (per IP) - demo only
const failedAttempts = new Map();

function logAttempt({ ip, userAgent, success, originPath, info }) {
  const entry = { ip, userAgent, success, originPath, info, timestamp: new Date().toISOString() };
  try {
    fs.appendFileSync(AUDIT_LOG, JSON.stringify(entry) + '\n');
  } catch (e) {
    console.error('Failed to write audit log', e);
  }
}

function hashString(str) {
  return crypto.createHash('sha256').update(String(str)).digest();
}

function safeCompare(a, b) {
  // compare buffers in constant time
  try {
    const bufA = Buffer.isBuffer(a) ? a : Buffer.from(a);
    const bufB = Buffer.isBuffer(b) ? b : Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // make lengths equal to avoid timing leaks
      const fixedA = Buffer.concat([bufA, Buffer.alloc(Math.abs(bufB.length - bufA.length))]);
      const fixedB = Buffer.concat([bufB, Buffer.alloc(Math.abs(bufB.length - bufA.length))]);
      return crypto.timingSafeEqual(fixedA, fixedB) && false; // different length -> false
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

// Helper to check lockout per IP
function checkLockout(ip) {
  const rec = failedAttempts.get(ip);
  if (!rec) return { locked: false };
  if (rec.lockedUntil && new Date() < rec.lockedUntil) return { locked: true, lockedUntil: rec.lockedUntil };
  return { locked: false };
}

function recordFailure(ip) {
  const now = new Date();
  const rec = failedAttempts.get(ip) || { count: 0 };
  rec.count = (rec.count || 0) + 1;
  rec.lastAttempt = now;
  if (rec.count >= MAX_FAILED_ATTEMPTS) {
    rec.lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
  }
  failedAttempts.set(ip, rec);
  return rec;
}

function recordSuccess(ip) {
  failedAttempts.delete(ip);
}

// POST /api/admin/login-hidden
app.post('/api/admin/login-hidden', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const ua = req.get('User-Agent') || '';
  const originPath = req.path;

  // Check lockout first
  const lock = checkLockout(ip);
  if (lock.locked) {
    logAttempt({ ip, userAgent: ua, success: false, originPath, info: 'locked' });
    return res.json({ success: false, message: 'تم قفل الدخول مؤقتًا.', lockedUntil: lock.lockedUntil });
  }

  const { password } = req.body || {};
  if (!password) {
    logAttempt({ ip, userAgent: ua, success: false, originPath, info: 'no_password' });
    return res.json({ success: false, message: 'بيانات غير صحيحة.' });
  }

  // Compare using hash + timingSafeEqual
  const suppliedHash = hashString(password);
  const envPass = ADMIN_PASSWORD;
  let envHash = hashString(envPass);

  const ok = safeCompare(suppliedHash, envHash);

  if (!ok) {
    const rec = recordFailure(ip);
    logAttempt({ ip, userAgent: ua, success: false, originPath, info: `failed_attempt_${rec.count}` });
    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - rec.count);
    if (rec.lockedUntil) {
      return res.json({ success: false, message: 'تم قفل الدخول مؤقتًا.', lockedUntil: rec.lockedUntil });
    }
    return res.json({ success: false, message: 'بيانات غير صحيحة.', remainingAttempts: remaining });
  }

  // success
  recordSuccess(ip);
  logAttempt({ ip, userAgent: ua, success: true, originPath, info: 'success' });

  // create session
  req.session.isAdmin = true;
  // optional: regenerate session id
  req.session.save(err => {
    if (err) {
      console.error('Session save error', err);
    }
    return res.json({ success: true, redirect: '/admin/dashboard', message: 'تم المصادقة' });
  });
});

// Protected admin dashboard (demo placeholder)
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).send('Unauthorized');
}

app.get('/admin/dashboard', requireAdmin, (req, res) => {
  res.send(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>لوحة المالك</title></head><body><h1>لوحة المالك (مثال)</h1><p>مرحبًا — أنت مصادق.</p></body></html>`);
});

// Endpoint to fetch recent audit logs (protected)
app.get('/admin/logs', requireAdmin, (req, res) => {
  try {
    const raw = fs.readFileSync(AUDIT_LOG, 'utf8').trim().split('\n').filter(Boolean);
    const items = raw.slice(-200).map(line => JSON.parse(line));
    res.json({ success: true, logs: items });
  } catch (e) {
    res.json({ success: true, logs: [] });
  }
});

// Simple health
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Auth demo server listening on http://localhost:${PORT}`));
