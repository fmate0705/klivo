import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { deleteSocialLink, updateSocialLink } from '@/lib/store/social';
import { validateSocialLink } from '@/lib/validation';

/** Egy közösségi hivatkozás módosítása és törlése. */
export const runtime = 'nodejs';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
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

  const { id } = await params;
  const link = await updateSocialLink(id, result.value);
  if (!link) {
    return Response.json({ ok: false, error: 'Nincs ilyen hivatkozás.' }, { status: 404 });
  }

  return Response.json({ ok: true, link });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ ok: false, error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const session = await requireApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const removed = await deleteSocialLink(id);
  if (!removed) {
    return Response.json({ ok: false, error: 'Nincs ilyen hivatkozás.' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
