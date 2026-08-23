import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { createTeamMember } from '@/lib/store/team';
import { validateTeamMember } from '@/lib/validation';

/** Csapattag létrehozása. A fájlrendszerre írunk, ezért Node futásidő kell. */
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

  const result = validateTeamMember(payload);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors, error: 'Néhány mezőt javítani kell.' },
      { status: 422 },
    );
  }

  const member = await createTeamMember(result.value);
  return Response.json({ ok: true, member });
}
