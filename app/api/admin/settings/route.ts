import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { updateSiteSettings } from '@/lib/store/site-settings';
import { cleanSettings } from '@/lib/validation';

/**
 * A megjelenési kapcsolók mentése.
 *
 * `PUT`, nem `PATCH`: a kliens mindig a **teljes** beállításobjektumot küldi,
 * és a `cleanSettings` mindig teljes objektumot ad vissza. Részleges
 * frissítésnél egy elveszett mező némán visszaállna alapértelmezettre, és a
 * szerkesztő nem értené, miért kapcsolódott vissza a sáv.
 */
export const runtime = 'nodejs';

export async function PUT(request: Request): Promise<Response> {
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

  const settings = await updateSiteSettings(cleanSettings(payload));
  return Response.json({ ok: true, settings });
}
