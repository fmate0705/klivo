import { revalidateTag, unstable_cache } from 'next/cache';
import type { WorkBlock } from '@/lib/content/work-blocks';
import { createCollection, createId } from './json-store';

/**
 * Referenciák — esettanulmányok.
 *
 * Ugyanaz a szerkezet, mint a blogbejegyzéseké: az admin szerkeszti, a
 * publikálás külön kapcsoló, és a nyilvános oldal soha nem lát nem publikált
 * rekordot. Ami más: a törzs nem egyetlen Markdown mező, hanem **blokkok
 * listája** (`lib/content/work-blocks.ts`) — így lehet az oldalt kód nélkül
 * összerakni anélkül, hogy szabad HTML-t engednénk be.
 *
 * A `logo` az ügyfél emblémája, a `cover` a borítókép. Mindkettő a `/media/…`
 * útvonalra mutat (lásd `lib/store/uploads.ts`), és mindkettő elhagyható: logó
 * nélkül a cégnév áll be, borító nélkül a kártya hullámhátteret kap.
 */
export type Work = {
  id: string;
  slug: string;
  /** Az ügyfél neve. Ez a kártya első sora. */
  client: string;
  /** Mit csináltunk. Ez a címsor. */
  title: string;
  /** Egy-két mondat a kártyára és a kereső leírásába. */
  excerpt: string;
  /** Ágazat vagy munkatípus — a listán szűrőcímke. */
  industry: string;
  /** Az elkészülés éve. Szabad szöveg, mert néha „2024–2025”. */
  year: string;
  /** Mit tartalmazott a munka. Rövid címkék. */
  services: string[];
  /** Az élő oldal címe. Külső link, ezért `rel="noopener"`. */
  siteUrl: string;
  /** `/media/…` útvonal, vagy üres. */
  logo: string;
  /** `/media/…` vagy `/images/…` útvonal, vagy üres. */
  cover: string;
  coverAlt: string;
  /** Az oldal törzse, sablonblokkokból. */
  blocks: WorkBlock[];
  /** Kézi sorrend. Kisebb szám előrébb. */
  order: number;
  published: boolean;
  /** ISO-8601. Az első publikáláskor kap értéket, később nem mozdul. */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkInput = Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>;

const works = createCollection<Work>('works.json');

/**
 * A referenciákat megjelenítő oldalak gyorsítótár-címkéje.
 *
 * A lista, az esettanulmány oldalak, a főoldali szekció és a sitemap mind
 * ugyanabból az olvasásból dolgozik. Egyetlen címke érvényteleníti mindet —
 * útvonalanként felsorolva egy új megjelenési hely némán kimaradna.
 */
export const WORKS_TAG = 'works';

const readWorks = unstable_cache(async () => works.read(), ['klivo-works', works.fingerprint()], {
  tags: [WORKS_TAG],
});

/** Kézi sorrend, azonos sorszámnál a frissebb elöl. */
function byOrder(a: Work, b: Work): number {
  if (a.order !== b.order) return a.order - b.order;
  const left = a.publishedAt ?? a.createdAt;
  const right = b.publishedAt ?? b.createdAt;
  return right.localeCompare(left);
}

export async function listWorks(): Promise<Work[]> {
  return [...(await readWorks())].sort(byOrder);
}

export async function listPublishedWorks(): Promise<Work[]> {
  return (await readWorks()).filter((work) => work.published).sort(byOrder);
}

/**
 * A főoldali szekció tartalma.
 *
 * A kiválasztás sorrendje **az adminé**, nem a rendezésé: ha a szerkesztő
 * megadta, mely referenciák szerepeljenek, azok abban a sorrendben jönnek,
 * ahogy kijelölte őket. Kiválasztás nélkül a kézi sorrend eleje áll be — így a
 * szekció akkor sem üres, ha még senki nem nyúlt a beállításhoz.
 */
export async function listWorksForHome(ids: string[], limit: number): Promise<Work[]> {
  const published = await listPublishedWorks();
  if (ids.length === 0) return published.slice(0, limit);

  const byId = new Map(published.map((work) => [work.id, work]));
  const picked = ids
    .map((id) => byId.get(id))
    .filter((work): work is Work => work !== undefined)
    .slice(0, limit);

  // Ha a kiválasztott referenciákat azóta törölték vagy elrejtették, a szekció
  // nem marad félig üresen: a többit a kézi sorrend eleje tölti fel.
  if (picked.length >= limit) return picked;
  const taken = new Set(picked.map((work) => work.id));
  return [...picked, ...published.filter((work) => !taken.has(work.id))].slice(0, limit);
}

export async function getWorkBySlug(slug: string): Promise<Work | undefined> {
  return (await readWorks()).find((work) => work.slug === slug);
}

export async function getPublishedWorkBySlug(slug: string): Promise<Work | undefined> {
  const work = await getWorkBySlug(slug);
  return work?.published ? work : undefined;
}

export async function getWorkById(id: string): Promise<Work | undefined> {
  return (await readWorks()).find((work) => work.id === id);
}

/** Az ágazatok a publikált referenciákból, ábécésorrendben. */
export async function listIndustries(): Promise<string[]> {
  const published = await listPublishedWorks();
  return [...new Set(published.map((work) => work.industry).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'hu'),
  );
}

export async function createWork(input: WorkInput): Promise<Work> {
  const now = new Date().toISOString();
  const created = await works.mutate((items) => {
    const work: Work = {
      ...input,
      id: createId(),
      slug: uniqueSlug(items, input.slug, null),
      publishedAt: input.published ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    return { items: [work, ...items], result: work };
  });

  revalidateTag(WORKS_TAG);
  return created;
}

export async function updateWork(id: string, input: WorkInput): Promise<Work | undefined> {
  const now = new Date().toISOString();
  const updated = await works.mutate((items) => {
    const index = items.findIndex((work) => work.id === id);
    if (index === -1) return { items, result: undefined };

    const previous = items[index] as Work;
    const next: Work = {
      ...previous,
      ...input,
      slug: uniqueSlug(items, input.slug, id),
      // Az első publikálás dátumot bélyegez; a későbbi szerkesztés nem mozdítja.
      publishedAt: input.published ? (previous.publishedAt ?? now) : null,
      updatedAt: now,
    };

    const copy = [...items];
    copy[index] = next;
    return { items: copy, result: next };
  });

  revalidateTag(WORKS_TAG);
  return updated;
}

export async function deleteWork(id: string): Promise<boolean> {
  const removed = await works.mutate((items) => {
    const next = items.filter((work) => work.id !== id);
    return { items: next, result: next.length !== items.length };
  });

  revalidateTag(WORKS_TAG);
  return removed;
}

/**
 * Egyedi slug `-2`, `-3`, … utótaggal. Az `ignoreId` engedi, hogy egy
 * referencia szerkesztés közben megtarthassa a saját slugját.
 */
function uniqueSlug(items: Work[], desired: string, ignoreId: string | null): string {
  const taken = new Set(items.filter((work) => work.id !== ignoreId).map((work) => work.slug));
  if (!taken.has(desired)) return desired;

  let suffix = 2;
  while (taken.has(`${desired}-${suffix}`)) suffix += 1;
  return `${desired}-${suffix}`;
}
