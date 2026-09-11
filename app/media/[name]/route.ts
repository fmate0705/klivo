import { readUpload } from '@/lib/store/uploads';

/**
 * A feltöltött képek kiszolgálása.
 *
 * A képek a `DATA_DIR`-ben élnek (lásd `lib/store/uploads.ts`), ami a
 * webszerver számára nem statikus könyvtár — ezért kell ez az útvonalkezelő.
 *
 * A fájlnév szervergenerált UUID, tehát egy URL tartalma soha nem változik:
 * korlátlanul cache-elhető. Ismeretlen vagy gyanús nevű kérésre 404 megy
 * vissza, nem hibaüzenet — a tároló szerkezetéről semmit nem árulunk el.
 */
export const runtime = 'nodejs';

/**
 * A feltöltött fájlokra szánt, szigorított irányelv.
 *
 * Az SVG dokumentum, nem kép: ha valaki közvetlenül nyitja meg a `/media/…`
 * címet, a böngésző oldalként rendereli. A `default-src 'none'` és a `sandbox`
 * miatt ott semmi nem futhat le, és semmi nem tölthető be kívülről — akkor sem,
 * ha a fertőtlenítő (`lib/svg-sanitize.ts`) egyszer hibázna.
 *
 * A `next.config.mjs` ugyanerre az útvonalra is küld egy irányelvet. Két
 * `Content-Security-Policy` fejlécnél a böngésző a **metszetüket** érvényesíti,
 * tehát a kettő nem gyengíti, hanem erősíti egymást.
 */
const MEDIA_CSP = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
): Promise<Response> {
  const { name } = await params;
  const file = await readUpload(name);

  if (!file) {
    return new Response('Nincs ilyen kép.', { status: 404 });
  }

  return new Response(new Uint8Array(file.body), {
    headers: {
      'content-type': file.contentType,
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      'content-security-policy': MEDIA_CSP,
      // Megnyitni igen, futtatókörnyezetnek látszani nem: a böngésző így
      // dokumentumként sem kapja meg a lap jogosultságait.
      'content-disposition': 'inline',
    },
  });
}
