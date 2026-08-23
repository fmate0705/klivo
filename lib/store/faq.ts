import { revalidateTag, unstable_cache } from 'next/cache';
import { createCollection, createId } from './json-store';
import { FAQ_PAGES, type FaqPageKey } from '@/lib/content/faq-pages';

export { FAQ_PAGES };
export type { FaqPageKey };

/**
 * Gyakori kérdések.
 *
 * Ugyanúgy az adminból szerkeszthető, mint a blogbejegyzések és a csapat: egy
 * kérdés akkor kerül ki, amikor tényleg megkérdezik, nem akkor, amikor legközelebb
 * deployolunk.
 *
 * **Oldalakhoz rendelve.** Egy kérdés több oldalon is megjelenhet, de nem
 * mindegyiken kell mindegyik: az árazásról szóló kérdés a weboldal-készítés
 * oldalon a helyén van, a blogon nincs. A `pages` a megjelenési helyek
 * kulcsait tartalmazza (lásd `FAQ_PAGES`); üres lista = mindenhol.
 */
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  /** Mely oldalakon jelenjen meg. Üres lista: mindenhol. */
  pages: string[];
  /** Kézi sorrend. Kisebb szám előrébb. */
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type FaqInput = Omit<FaqItem, 'id' | 'createdAt' | 'updatedAt'>;

const faq = createCollection<FaqItem>('faq.json');

/** A kérdéseket megjelenítő oldalak gyorsítótár-címkéje. */
export const FAQ_TAG = 'faq';

const readFaq = unstable_cache(async () => faq.read(), ['klivo-faq', faq.fingerprint()], {
  tags: [FAQ_TAG],
});

/** Kézi sorrend szerint, azonos sorszámnál a felvétel sorrendjében. */
function byOrder(a: FaqItem, b: FaqItem): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.createdAt.localeCompare(b.createdAt);
}

export async function listFaq(): Promise<FaqItem[]> {
  return [...(await readFaq())].sort(byOrder);
}

/**
 * Egy oldalhoz tartozó kérdések.
 *
 * Üres `pages` lista azt jelenti: mindenhol. Ez a szerkesztő dolgát könnyíti —
 * a legtöbb kérdés általános, és nem kell hozzá hat jelölőnégyzetet bepipálni.
 */
export async function listFaqForPage(page: FaqPageKey): Promise<FaqItem[]> {
  const all = await listFaq();
  return all.filter((item) => item.pages.length === 0 || item.pages.includes(page));
}

export async function getFaqItem(id: string): Promise<FaqItem | undefined> {
  return (await readFaq()).find((item) => item.id === id);
}

export async function createFaqItem(input: FaqInput): Promise<FaqItem> {
  const now = new Date().toISOString();
  const created = await faq.mutate((items) => {
    const item: FaqItem = { ...input, id: createId(), createdAt: now, updatedAt: now };
    return { items: [...items, item], result: item };
  });

  revalidateTag(FAQ_TAG);
  return created;
}

export async function updateFaqItem(id: string, input: FaqInput): Promise<FaqItem | undefined> {
  const now = new Date().toISOString();
  const updated = await faq.mutate((items) => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return { items, result: undefined };

    const next: FaqItem = { ...(items[index] as FaqItem), ...input, updatedAt: now };
    const copy = [...items];
    copy[index] = next;
    return { items: copy, result: next };
  });

  revalidateTag(FAQ_TAG);
  return updated;
}

export async function deleteFaqItem(id: string): Promise<boolean> {
  const removed = await faq.mutate((items) => {
    const next = items.filter((item) => item.id !== id);
    return { items: next, result: next.length !== items.length };
  });

  revalidateTag(FAQ_TAG);
  return removed;
}
