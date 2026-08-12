import { cookies } from 'next/headers';
import {
  createSessionToken,
  isSecureRequest,
  sessionCookieName,
  sessionCookieOptions,
  SECURE_SESSION_COOKIE,
  SESSION_COOKIE,
} from '@/lib/auth/jwt';
import { verifyPassword, verifyUsername } from '@/lib/auth/password';
import { clientKey, rateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { isSameOrigin } from '@/lib/auth/session';

/**
 * Admin munkamenet: belépés (POST) és kilépés (DELETE).
 *
 * A jelszó-ellenőrzés Web Crypto PBKDF2-t használ, ezért kell a Node futásidő —
 * és ezért nincs natív modul, amit fordítani kellene.
 */
export const runtime = 'nodejs';

/** Öt próbálkozás tizenöt percenként, IP-nként. */
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const key = clientKey(request, 'belepes');
  const limit = rateLimit(key, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return Response.json(
      {
        error: `Túl sok sikertelen próbálkozás. Próbáld újra ${Math.ceil(limit.retryAfterSeconds / 60)} perc múlva.`,
      },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Hibás kérés.' }, { status: 400 });
  }

  const { username, password } = (payload ?? {}) as Record<string, unknown>;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return Response.json({ error: 'Hiányzó adatok.' }, { status: 400 });
  }

  // A két ellenőrzés eredményét szándékosan együtt értékeljük ki, és mindkettő
  // lefut: így nem derül ki a válaszidőből, hogy a felhasználónév volt-e rossz
  // vagy a jelszó.
  const usernameOk = verifyUsername(username);
  const passwordOk = await verifyPassword(password);

  if (!usernameOk || !passwordOk) {
    return Response.json({ error: 'Hibás felhasználónév vagy jelszó.' }, { status: 401 });
  }

  const secure = isSecureRequest(request);
  const token = await createSessionToken(username);
  const store = await cookies();
  store.set(sessionCookieName(secure), token, sessionCookieOptions(secure));

  // A sikeres belépés törli a számlálót, hogy egy jogos felhasználót ne zárjunk
  // ki a korábbi elgépelései miatt.
  resetRateLimit(key);

  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}

export async function DELETE(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const store = await cookies();
  // Mindkét nevet töröljük: a munkamenet keletkezhetett HTTP-n és HTTPS-en is.
  store.delete(SECURE_SESSION_COOKIE);
  store.delete(SESSION_COOKIE);

  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}
