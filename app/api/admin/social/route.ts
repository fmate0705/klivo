import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { createSocialLink } from '@/lib/store/social';
import { validateSocialLink } from '@/lib/validation';

/** Közösségi hivatkozás felvétele. */
export const runtime = 'nodejs';

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

  const result = validateSocialLink(payload);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors, error: 'Néhány mezőt javítani kell.' },
      { status: 422 },
    );
  }

  const link = await createSocialLink(result.value);
  return Response.json({ ok: true, link });
}
