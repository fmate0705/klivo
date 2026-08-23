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
    },
  });
}
