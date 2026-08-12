import { clientKey, rateLimit } from '@/lib/auth/rate-limit';
import { createLead } from '@/lib/store/leads';
import { validateContact } from '@/lib/validation';

/**
 * A kapcsolati űrlap végpontja.
 *
 * Az adatfájlba írunk, ezért a Node futásidő kell (az Edge nem lát fájlrendszert).
 */
export const runtime = 'nodejs';

/** Tíz beküldés óránként, IP-nként. Bőven elég egy valódi érdeklődőnek. */
const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(clientKey(request, 'kapcsolat'), LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return Response.json(
      { ok: false, error: 'Túl sok beküldés. Próbáld újra később, vagy írj e-mailt.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Hibás kérés.' }, { status: 400 });
  }

  const data = (payload ?? {}) as Record<string, unknown>;

  // Csapdamező: ha ki van töltve, bot töltötte ki. Sikert jelzünk, de nem
  // mentünk semmit — így a bot nem tudja meg, mi buktatta le.
  if (typeof data.webcim === 'string' && data.webcim.trim().length > 0) {
    return Response.json({ ok: true });
  }

  const result = validateContact(payload);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors, error: 'Néhány mezőt javítani kell.' },
      { status: 422 },
    );
  }

  try {
    await createLead({
      ...result.value,
      budget: '',
      // Csak a nyers azonosító eleje: bot-hullámok felismerésére elég, követésre
      // szándékosan alkalmatlan.
      userAgent: (request.headers.get('user-agent') ?? '').slice(0, 200),
    });
  } catch (error) {
    console.error('[kapcsolat] a megkeresést nem sikerült elmenteni', error);
    return Response.json(
      { ok: false, error: 'Váratlan hiba történt. Írj e-mailt, és azonnal válaszolunk.' },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
