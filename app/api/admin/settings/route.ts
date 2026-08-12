import { revalidatePath } from 'next/cache';
import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { PRICE_KEYS, updatePrices, type PriceKey } from '@/lib/store/settings';
import { validatePriceValue } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * Az árak mentése.
 *
 * Csak az ismert kulcsokat fogadjuk el, és mindet külön validáljuk. Egy
 * ismeretlen kulcs nem hiba, hanem figyelmen kívül hagyandó adat — így egy régi,
 * gyorsítótárazott admin oldal nem tud szemetet írni a beállításokba.
 */
export async function PUT(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Hibás kérés.' }, { status: 400 });
  }

  const input = (payload ?? {}) as Record<string, unknown>;
  const prices: Partial<Record<PriceKey, string>> = {};
  const errors: Record<string, string> = {};

  for (const key of PRICE_KEYS) {
    if (!(key in input)) continue;
    const result = validatePriceValue(input[key]);
    if (!result.ok) {
      errors[key] = result.errors.price ?? 'Érvénytelen érték.';
      continue;
    }
    prices[key] = result.value;
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 422 });
  }

  const settings = await updatePrices(prices);

  // Az árak több oldalon is megjelennek; mindet frissítjük, hogy a változás
  // azonnal látszódjon, ne csak az ISR ablak leteltével.
  revalidatePath('/');
  revalidatePath('/szolgaltatasok');
  revalidatePath('/szolgaltatasok/weboldal-keszites');
  revalidatePath('/szolgaltatasok/egyedi-fejlesztes');
  revalidatePath('/szolgaltatasok/tarhely');
  revalidatePath('/llms.txt');

  return Response.json({ ok: true, settings });
}
