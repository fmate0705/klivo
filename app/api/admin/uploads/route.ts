import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { saveUpload } from '@/lib/store/uploads';

/**
 * Borítókép feltöltése.
 *
 * A fájlrendszerre írunk, ezért Node futásidő kell (az Edge nem lát
 * fájlrendszert).
 *
 * Két réteg védi: a middleware már kiszűri az azonosítatlan kérést, ez pedig
 * még egyszer ellenőrzi a munkamenetet. Ha az útvonal valaha kiesne a
 * middleware matcheréből, az teljesítményt rontana, nem biztonságot.
 */
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ ok: false, error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const session = await requireApiSession();
  if (!session.ok) return session.response;

  let file: unknown;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return Response.json({ ok: false, error: 'Hibás kérés.' }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ ok: false, error: 'Nem érkezett fájl.' }, { status: 400 });
  }

  const result = await saveUpload(file);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 422 });
  }

  return Response.json({ ok: true, url: result.url });
}
