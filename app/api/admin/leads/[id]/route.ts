import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { deleteLead, updateLeadStatus } from '@/lib/store/leads';
import { isLeadStatus } from '@/lib/store/lead-status';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

/** Egy megkeresés állapotának módosítása. */
export async function PATCH(request: Request, { params }: Params): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Hibás kérés.' }, { status: 400 });
  }

  const status = (payload as Record<string, unknown>)?.status;
  if (typeof status !== 'string' || !isLeadStatus(status)) {
    return Response.json({ error: 'Ismeretlen állapot.' }, { status: 422 });
  }

  const lead = await updateLeadStatus(id, status);
  if (!lead) return Response.json({ error: 'A megkeresés nem található.' }, { status: 404 });

  return Response.json({ ok: true, lead });
}

export async function DELETE(request: Request, { params }: Params): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const removed = await deleteLead(id);
  if (!removed) return Response.json({ error: 'A megkeresés nem található.' }, { status: 404 });

  return Response.json({ ok: true });
}
