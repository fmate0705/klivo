import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

/**
 * Feltöltött borítóképek tárolása.
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
 * A listát a *szerver* dönti el, nem a feltöltött fájl neve. SVG szándékosan
 * nincs benne: az SVG futtathat szkriptet, tehát egy azonos originről
 * kiszolgált SVG feltöltés tárolt XSS lenne.
 */
const ALLOWED: Record<string, string> = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/avif': '.avif',
};

/** 4 MB. Egy borítóképnek bőven elég, és korlátozza a lemezterhelést. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function saveUpload(file: File): Promise<UploadResult> {
  const extension = ALLOWED[file.type];
  if (!extension) {
    return { ok: false, error: 'Csak WebP, JPEG, PNG vagy AVIF kép tölthető fel.' };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'A kép nagyobb 4 MB-nál. Tömörítsd, mielőtt feltöltöd.' };
  }

  // A név teljes egészében szervergenerált: a feltöltött fájlnévből semmit nem
  // veszünk át, tehát nincs mit útvonallal manipulálni.
  const name = `${randomUUID()}${extension}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));

  return { ok: true, url: `/media/${name}` };
}

/** Csak szervergenerált nevű fájl olvasható ki — UUID + ismert kiterjesztés. */
const NAME_PATTERN = /^[0-9a-f-]{36}\.(webp|jpg|png|avif)$/;

export type StoredUpload = { body: Buffer; contentType: string };

export async function readUpload(name: string): Promise<StoredUpload | undefined> {
  if (!NAME_PATTERN.test(name)) return undefined;

  const contentType = Object.entries(ALLOWED).find(
    ([, extension]) => extension === extname(name),
  )?.[0];
  if (!contentType) return undefined;

  try {
    return { body: await readFile(join(UPLOAD_DIR, name)), contentType };
  } catch {
    return undefined;
  }
}
