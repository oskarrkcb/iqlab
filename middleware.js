// Password gate for the private phase (Vercel Routing Middleware, runs before every request).
// Everyone needs the shared access password (env SITE_PASSWORD) before the app — and its
// JavaScript — is served. After that, people sign in to their own account as usual.
// Without SITE_PASSWORD the site stays closed for everyone.

const COOKIE = 'iqlab_access';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const LOGIN_PATH = '/__access';

// Same as next() from @vercel/functions: let the request through unchanged
const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

// Cookie value = HMAC of a fixed text, keyed with the password.
// Changing SITE_PASSWORD logs everyone out.
async function accessToken(password) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('iqlab-site-access-v1'));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const match = header.split(/;\s*/).find(c => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

// Only allow redirects back into this site
function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith(LOGIN_PATH)
    ? value : '/';
}

const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function gatePage({ next, error, notConfigured }) {
  const message = notConfigured
    ? 'Der Zugang ist noch nicht eingerichtet.'
    : error ? 'Falsches Passwort.' : '';
  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>IQLab · Privat</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #060606; color: #fff; font-family: Inter, system-ui, -apple-system, sans-serif; padding: 16px; }
  .card { width: 100%; max-width: 360px; background: #0e0e0e; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 28px 24px; }
  .logo { font-weight: 800; letter-spacing: -0.02em; font-size: 22px; margin: 0 0 6px; }
  p { color: #888; font-size: 14px; line-height: 1.5; margin: 0 0 20px; }
  label { display: block; font-size: 12px; color: #888; margin-bottom: 6px; }
  input { width: 100%; padding: 12px; font-size: 16px; border-radius: 8px; border: 1px solid #2a2a2a;
    background: #141414; color: #fff; outline: none; }
  input:focus { border-color: #3b82f6; }
  button { width: 100%; margin-top: 14px; padding: 12px; font-size: 15px; font-weight: 600; border: 0;
    border-radius: 8px; background: #3b82f6; color: #fff; cursor: pointer; }
  button:hover { background: #2563eb; }
  .err { color: #ef4444; font-size: 13px; margin: 12px 0 0; }
</style>
</head>
<body>
  <form class="card" method="post" action="${LOGIN_PATH}">
    <h1 class="logo">IQLab</h1>
    <p>Die Seite ist gerade privat. Gib das Zugangspasswort ein, das du bekommen hast.</p>
    <input type="hidden" name="next" value="${escapeHtml(next)}">
    <label for="pw">Zugangspasswort</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <button type="submit">Weiter</button>
    ${message ? `<p class="err">${message}</p>` : ''}
  </form>
</body>
</html>`;
  return new Response(html, {
    status: notConfigured ? 503 : 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const password = process.env.SITE_PASSWORD;
  if (!password) return gatePage({ next: '/', notConfigured: true });

  const token = await accessToken(password);

  if (url.pathname === LOGIN_PATH && request.method === 'POST') {
    const form = await request.formData();
    const next = safeNext(form.get('next'));
    if (safeEqual(await accessToken(String(form.get('password') || '')), token)) {
      return new Response(null, {
        status: 303,
        headers: {
          location: next,
          'set-cookie': `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    await new Promise(r => setTimeout(r, 800)); // slows down password guessing
    return gatePage({ next, error: true });
  }

  if (safeEqual(readCookie(request, COOKIE), token)) return pass();

  return gatePage({ next: url.pathname + url.search });
}
