import { beforeAll, describe, expect, it } from 'vitest';
import { createSessionToken, verifySessionToken } from '@/lib/auth/jwt';
import { hashPassword, verifyPassword, verifyUsername } from '@/lib/auth/password';
import { rateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

beforeAll(() => {
  process.env.ADMIN_JWT_SECRET = 'teszt-kulcs-legalabb-harminckét-karakter-hosszu';
  process.env.ADMIN_USERNAME = 'admin';
});

describe('munkamenet token', () => {
  it('kiadja és visszaolvassa a jogosultságokat', async () => {
    const token = await createSessionToken('admin');
    const claims = await verifySessionToken(token);
    expect(claims?.sub).toBe('admin');
    expect(claims?.role).toBe('admin');
  });

  it('elutasítja a manipulált tokent', async () => {
    const token = await createSessionToken('admin');
    expect(await verifySessionToken(`${token}x`)).toBeNull();
  });

  it('elutasítja a hiányzó tokent', async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
  });

  it('elutasítja az idegen kulccsal aláírt tokent', async () => {
    const token = await createSessionToken('admin');
    process.env.ADMIN_JWT_SECRET = 'masik-kulcs-szinten-harminckét-karakternel-hosszabb';
    expect(await verifySessionToken(token)).toBeNull();
    process.env.ADMIN_JWT_SECRET = 'teszt-kulcs-legalabb-harminckét-karakter-hosszu';
  });
});

describe('jelszó', () => {
  it('a helyes jelszót elfogadja, a rosszat nem', async () => {
    process.env.ADMIN_PASSWORD_HASH = await hashPassword('nagyon-jo-jelszo-2026');
    expect(await verifyPassword('nagyon-jo-jelszo-2026')).toBe(true);
    expect(await verifyPassword('nagyon-jo-jelszo-2025')).toBe(false);
  });

  it('hiányzó hash esetén nem enged be senkit', async () => {
    delete process.env.ADMIN_PASSWORD_HASH;
    expect(await verifyPassword('barmi')).toBe(false);
  });

  it('a felhasználónevet pontosan hasonlítja', () => {
    expect(verifyUsername('admin')).toBe(true);
    expect(verifyUsername('Admin')).toBe(false);
  });
});

describe('sebességkorlát', () => {
  it('a limit fölött blokkol, és visszaállítás után újra enged', () => {
    const key = `teszt:${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    }
    expect(rateLimit(key, 3, 60_000).allowed).toBe(false);

    resetRateLimit(key);
    expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
  });
});
