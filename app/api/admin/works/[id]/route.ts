import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { deleteWork, updateWork } from '@/lib/store/works';
import { validateWork } from '@/lib/validation';

/** Egy referencia módosítása és törlése. */
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

  const result = validateWork(payload);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors, error: 'Néhány mezőt javítani kell.' },
      { status: 422 },
    );
  }

  const { id } = await params;
  const work = await updateWork(id, result.value);
  if (!work) {
    return Response.json({ ok: false, error: 'Nincs ilyen referencia.' }, { status: 404 });
  }

  return Response.json({ ok: true, work });
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
  const removed = await deleteWork(id);
  if (!removed) {
    return Response.json({ ok: false, error: 'Nincs ilyen referencia.' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
