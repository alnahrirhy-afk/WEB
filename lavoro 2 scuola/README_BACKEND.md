Hidden Admin Login - Example Backend
=====================================

This directory contains a minimal Node/Express example backend that implements a secure hidden admin login endpoint and a demo protected dashboard.

NOTES
- This is a **development example**. For production, use a real database, persistent store (Redis) for rate limiting/locks, HTTPS, and secure session storage.
- Do NOT commit real secrets to source control. Use environment variables.

Quick start (Windows PowerShell)
-------------------------------
1. Copy .env.example to .env and edit secrets:

   copy .env.example .env
   # then open .env and set SESSION_SECRET and ADMIN_PASSWORD

2. Install dependencies:

```powershell
npm install
```

3. Start the server:

```powershell
npm start
```

By default the server listens on port 3000.

Test the endpoint with curl (replace password):

```powershell
curl -X POST http://localhost:3000/api/admin/login-hidden -H "Content-Type: application/json" -d '{"password":"AhmedSara1603"}' -v
```

Expected responses (JSON):
- Success: { success: true, redirect: '/admin/dashboard', message: 'تم المصادقة' }
- Failure: { success: false, message: 'بيانات غير صحيحة.', remainingAttempts: N }
- Locked: { success: false, message: 'تم قفل الدخول مؤقتًا.', lockedUntil: 'ISO timestamp' }

Logs
----
Audit logs are appended to `logs/admin_login_attempts.log` as JSON lines.

Production notes
----------------
- Use HTTPS and set cookie.secure = true.
- Replace in-memory failed attempts store with Redis and use a robust rate limiter.
- Store admin credentials hashed (bcrypt/argon2) and managed by an admin user system.
- Add CSRF protection and stricter CSP headers.

If you want, I can:
- Add a simple API test script (Node or curl script).
- Wire the frontend popup to this endpoint for local testing.
- Add Redis-backed lockout with docker-compose.
