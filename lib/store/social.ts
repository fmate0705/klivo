import { revalidateTag, unstable_cache } from 'next/cache';
import type { SocialPlatform } from '@/lib/content/social';
import { createCollection, createId } from './json-store';

/**
 * Közösségi média hivatkozások.
 *
 * Az adminból szerkeszthető, mert ezek a címek változnak: egy új csatorna
 * elindítása nem lehet forráskód-módosítás. Ugyanezekből a címekből lesz a
 * keresőnek küldött `sameAs` is (`lib/seo/jsonld.ts`) — ez az a mező, amiből a
 * Google összeköti az oldalt a közösségi profilokkal.
 *
 * **Felületenként egy hivatkozás.** Két Facebook-oldal a láblécben nem választás,
 * hanem hiba; a tároló ezért a platformot egyedinek tekinti.
 */
export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  /** A profil teljes címe. Csak `https`. */
  url: string;
  /** Kézi sorrend. Kisebb szám előrébb. */
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type SocialLinkInput = Omit<SocialLink, 'id' | 'createdAt' | 'updatedAt'>;

const social = createCollection<SocialLink>('social.json');

export const SOCIAL_TAG = 'social';

const readSocial = unstable_cache(
  async () => social.read(),
  ['klivo-social', social.fingerprint()],
  { tags: [SOCIAL_TAG] },
);

function byOrder(a: SocialLink, b: SocialLink): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.platform.localeCompare(b.platform);
}

export async function listSocialLinks(): Promise<SocialLink[]> {
  return [...(await readSocial())].sort(byOrder);
}

export async function createSocialLink(input: SocialLinkInput): Promise<SocialLink> {
  const now = new Date().toISOString();
  const created = await social.mutate((items) => {
    const link: SocialLink = { ...input, id: createId(), createdAt: now, updatedAt: now };
    // Felületenként egy hivatkozás: az azonos platformú korábbi kiesik.
    const kept = items.filter((item) => item.platform !== input.platform);
    return { items: [...kept, link], result: link };
  });

  revalidateTag(SOCIAL_TAG);
  return created;
}

export async function updateSocialLink(
  id: string,
  input: SocialLinkInput,
): Promise<SocialLink | undefined> {
  const now = new Date().toISOString();
  const updated = await social.mutate((items) => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return { items, result: undefined };

    const next: SocialLink = { ...(items[index] as SocialLink), ...input, updatedAt: now };
    const copy = items.map((item, position) => (position === index ? next : item));
    // Ha a szerkesztő átállította a felületet egy már használtra, a másik esik ki.
    return {
      items: copy.filter((item) => item.id === id || item.platform !== input.platform),
      result: next,
    };
  });

  revalidateTag(SOCIAL_TAG);
  return updated;
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  const removed = await social.mutate((items) => {
    const next = items.filter((item) => item.id !== id);
    return { items: next, result: next.length !== items.length };
  });

  revalidateTag(SOCIAL_TAG);
  return removed;
}
