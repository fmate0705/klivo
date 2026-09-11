import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { MAX_SVG_BYTES, sanitizeSvg } from '@/lib/svg-sanitize';

/**
 * Feltöltött képek tárolása.
 *
 * A fájlok a `DATA_DIR/uploads` könyvtárba kerülnek, nem a `public/`-ba. Ez
 * szándékos: a `public/` a build kimenetének része, egy konténeres deploynál
 * pedig az image tartalma cserélődik — a feltöltött képek az első
 * újratelepítéskor eltűnnének. A `DATA_DIR` viszont csatolt kötet, ugyanaz,
 * ahol a bejegyzések élnek, tehát a kép és a hozzá tartozó bejegyzés együtt
 * marad meg vagy vész el, nem külön.
 *
 * A kiszolgálás emiatt egy útvonalkezelőn keresztül történik (`/media/[nev]`),
 * nem statikus fájlként.
 */

const UPLOAD_DIR = join(process.env.DATA_DIR ?? join(process.cwd(), 'data'), 'uploads');

/**
 * Engedélyezett képformátumok, MIME típusról kiterjesztésre.
 *
 * A listát a *szerver* dönti el, nem a feltöltött fájl neve.
 */
const ALLOWED: Record<string, string> = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/avif': '.avif',
};

/**
 * Emblémánál az SVG is mehet — de **csak fertőtlenítve**.
 *
 * Az SVG nem kép, hanem dokumentum: futtathat szkriptet és tölthet külső
 * erőforrást, tehát azonos originről kiszolgálva tárolt XSS lenne. Egy logónak
 * viszont pont az SVG a formátuma, ezért nem tiltani kell, hanem **átírni**: a
 * `lib/svg-sanitize.ts` engedélyezőlista alapján újraépíti a fájlt, és csak az
 * marad benne, amit ismerünk. A kiszolgálás ezen felül szigorú CSP-t küld rá
 * (lásd `app/media/[name]/route.ts`), tehát két egymástól független réteg véd.
 */
const ALLOWED_LOGO: Record<string, string> = { ...ALLOWED, 'image/svg+xml': '.svg' };

/** 4 MB. Egy borítóképnek bőven elég, és korlátozza a lemezterhelést. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Mire használjuk a fájlt.
 *
 * Nem kozmetika: ez dönti el, hogy az SVG szóba jöhet-e egyáltalán. Egy
 * blogborítónak sosem kell SVG, tehát ott nincs is értelme megnyitni ezt a
 * felületet.
 */
export type UploadKind = 'image' | 'logo';

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function saveUpload(file: File, kind: UploadKind = 'image'): Promise<UploadResult> {
  const table = kind === 'logo' ? ALLOWED_LOGO : ALLOWED;
  const extension = table[file.type];
  if (!extension) {
    return {
      ok: false,
      error:
        kind === 'logo'
          ? 'Csak SVG, WebP, PNG, JPEG vagy AVIF tölthető fel.'
          : 'Csak WebP, JPEG, PNG vagy AVIF kép tölthető fel.',
    };
  }

  const limit = extension === '.svg' ? MAX_SVG_BYTES : MAX_UPLOAD_BYTES;
  if (file.size > limit) {
    return {
      ok: false,
      error:
        extension === '.svg'
          ? 'Az SVG nagyobb 256 kB-nál. Egyszerűsítsd, mielőtt feltöltöd.'
          : 'A kép nagyobb 4 MB-nál. Tömörítsd, mielőtt feltöltöd.',
    };
  }

  // A név teljes egészében szervergenerált: a feltöltött fájlnévből semmit nem
  // veszünk át, tehát nincs mit útvonallal manipulálni.
  const name = `${randomUUID()}${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });

  if (extension === '.svg') {
    const sanitized = sanitizeSvg(await file.text());
    if (!sanitized.ok) return { ok: false, error: sanitized.error };
    // A fertőtlenített változatot írjuk ki, az eredetit soha: ami nincs a
    // lemezen, azt nem lehet véletlenül kiszolgálni.
    await writeFile(join(UPLOAD_DIR, name), sanitized.svg, 'utf8');
  } else {
    await writeFile(join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  }

  return { ok: true, url: `/media/${name}` };
}

/** Csak szervergenerált nevű fájl olvasható ki — UUID + ismert kiterjesztés. */
const NAME_PATTERN = /^[0-9a-f-]{36}\.(webp|jpg|png|avif|svg)$/;

export type StoredUpload = { body: Buffer; contentType: string };

export async function readUpload(name: string): Promise<StoredUpload | undefined> {
  if (!NAME_PATTERN.test(name)) return undefined;

  const contentType = Object.entries(ALLOWED_LOGO).find(
    ([, extension]) => extension === extname(name),
  )?.[0];
  if (!contentType) return undefined;

  try {
    return { body: await readFile(join(UPLOAD_DIR, name)), contentType };
  } catch {
    return undefined;
  }
}

/** Igaz, ha a hivatkozott fájl SVG. A megjelenítésnek és a kiszolgálásnak is kell. */
export function isSvgPath(url: string): boolean {
  return url.toLowerCase().endsWith('.svg');
}
