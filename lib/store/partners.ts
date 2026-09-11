import { revalidateTag, unstable_cache } from 'next/cache';
import { createCollection, createId } from './json-store';

/**
 * Partner emblémák a nyitóképernyő alatti sávhoz.
 *
 * Külön gyűjtemény, nem a beállítások része: a logók jönnek-mennek, és egy
 * embléma felvétele nem lehet forráskód-módosítás. A sáv **láthatósága**
 * viszont beállítás (`lib/store/site-settings.ts`) — a kettő szándékosan válik
 * szét, hogy a sávot ki lehessen kapcsolni anélkül, hogy a logókat törölni
 * kéne.
 *
 * A `logo` a `/media/…` útvonalra mutat, és **kötelező**: egy embléma nélküli
 * partner egy üres kártya lenne a sávban. SVG is feltölthető, de csak
 * fertőtlenítve — lásd `lib/svg-sanitize.ts`.
 */
export type Partner = {
  id: string;
  /** A cég neve. Ez a kép alternatív szövege, tehát nem hagyható el. */
  name: string;
  /** `/media/…` útvonal. */
  logo: string;
  /** Az ügyfél oldala. Nem kötelező; megadva a logó hivatkozás lesz. */
  url: string;
  /** Kézi sorrend. Kisebb szám előrébb. */
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PartnerInput = Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>;

const partners = createCollection<Partner>('partners.json');

export const PARTNERS_TAG = 'partners';

const readPartners = unstable_cache(
  async () => partners.read(),
  ['klivo-partners', partners.fingerprint()],
  { tags: [PARTNERS_TAG] },
);

function byOrder(a: Partner, b: Partner): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.name.localeCompare(b.name, 'hu');
}

export async function listPartners(): Promise<Partner[]> {
  return [...(await readPartners())].sort(byOrder);
}

export async function getPartner(id: string): Promise<Partner | undefined> {
  return (await readPartners()).find((partner) => partner.id === id);
}

export async function createPartner(input: PartnerInput): Promise<Partner> {
  const now = new Date().toISOString();
  const created = await partners.mutate((items) => {
    const partner: Partner = { ...input, id: createId(), createdAt: now, updatedAt: now };
    return { items: [...items, partner], result: partner };
  });

  revalidateTag(PARTNERS_TAG);
  return created;
}

export async function updatePartner(id: string, input: PartnerInput): Promise<Partner | undefined> {
  const now = new Date().toISOString();
  const updated = await partners.mutate((items) => {
    const index = items.findIndex((partner) => partner.id === id);
    if (index === -1) return { items, result: undefined };

    const next: Partner = { ...(items[index] as Partner), ...input, updatedAt: now };
    const copy = [...items];
    copy[index] = next;
    return { items: copy, result: next };
  });

  revalidateTag(PARTNERS_TAG);
  return updated;
}

export async function deletePartner(id: string): Promise<boolean> {
  const removed = await partners.mutate((items) => {
    const next = items.filter((partner) => partner.id !== id);
    return { items: next, result: next.length !== items.length };
  });

  revalidateTag(PARTNERS_TAG);
  return removed;
}
