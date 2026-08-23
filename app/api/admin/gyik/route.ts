import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { createFaqItem, FAQ_PAGES } from '@/lib/store/faq';
import { validateFaqItem } from '@/lib/validation';

/** Gyakori kérdés létrehozása. A fájlrendszerre írunk, ezért Node futásidő kell. */
export const runtime = 'nodejs';

const PAGE_KEYS = FAQ_PAGES.map((page) => page.key);

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ ok: false, error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const session = await requireApiSession();
  if (!session.ok) return session.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Hibás kérés.' }, { status: 400 });
  }

  const result = validateFaqItem(payload, PAGE_KEYS);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors, error: 'Néhány mezőt javítani kell.' },
      { status: 422 },
    );
  }

  const item = await createFaqItem(result.value);
  return Response.json({ ok: true, item });
}
