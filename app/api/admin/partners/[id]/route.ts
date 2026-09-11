import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { deletePartner, updatePartner } from '@/lib/store/partners';
import { validatePartner } from '@/lib/validation';

/** Egy partner módosítása és törlése. */
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

  const result = validatePartner(payload);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors, error: 'Néhány mezőt javítani kell.' },
      { status: 422 },
    );
  }

  const { id } = await params;
  const partner = await updatePartner(id, result.value);
  if (!partner) {
    return Response.json({ ok: false, error: 'Nincs ilyen partner.' }, { status: 404 });
  }

  return Response.json({ ok: true, partner });
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
  const removed = await deletePartner(id);
  if (!removed) {
    return Response.json({ ok: false, error: 'Nincs ilyen partner.' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
