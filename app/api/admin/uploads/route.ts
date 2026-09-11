import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { saveUpload } from '@/lib/store/uploads';

/**
 * Kép feltöltése.
 *
 * A fájlrendszerre írunk, ezért Node futásidő kell (az Edge nem lát
 * fájlrendszert).
 *
 * Két réteg védi: a middleware már kiszűri az azonosítatlan kérést, ez pedig
 * még egyszer ellenőrzi a munkamenetet. Ha az útvonal valaha kiesne a
 * middleware matcheréből, az teljesítményt rontana, nem biztonságot.
 *
 * A `kind=logo` mező annyit tesz, hogy **SVG is jöhet** — fertőtlenítve, lásd
 * `lib/svg-sanitize.ts`. Egy blogborítónak sosem kell SVG, ezért ott nem is
 * nyitjuk meg ezt a felületet: a szűkebb alapértelmezés a biztonságosabb.
 */
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ ok: false, error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const session = await requireApiSession();
  if (!session.ok) return session.response;

  let file: unknown;
  let kind: 'image' | 'logo' = 'image';
  try {
    const form = await request.formData();
    file = form.get('file');
    // Csak a kimondott `logo` érték számít: bármi más az alapértelmezett,
    // szűkebb szabályt kapja.
    if (form.get('kind') === 'logo') kind = 'logo';
  } catch {
    return Response.json({ ok: false, error: 'Hibás kérés.' }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ ok: false, error: 'Nem érkezett fájl.' }, { status: 400 });
  }

  const result = await saveUpload(file, kind);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 422 });
  }

  return Response.json({ ok: true, url: result.url });
}
