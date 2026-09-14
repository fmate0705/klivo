import { revalidateTag, unstable_cache } from 'next/cache';
import { createCollection, createId } from './json-store';

/**
 * A csapat tagjai.
 *
 * Ugyanúgy az adminból szerkeszthető, mint a blogbejegyzések: a csapat
 * változik, és egy új kolléga felvétele nem lehet forráskód-módosítás.
 *
 * A `photo` a `/media/…` útvonalra mutat (lásd `lib/store/uploads.ts`), és
 * lehet üres: kép nélkül a névből képzett monogram jelenik meg. Az e-mail és a
 * telefon szintén elhagyható — nem minden szerepnél van értelme közvetlen
 * elérhetőséget kiírni, és egy üres mező helyén a sor egyszerűen nem jelenik meg. A feltöltött
 * képek átlátszó hátterűek lesznek, ezért a megjelenítés ad alájuk egy
 * világoskék felületet — így egy kivágott portré és egy teli fotó is ugyanúgy
 * néz ki a rácsban.
 */
export type TeamMember = {
  id: string;
  name: string;
  /** Szerep vagy pozíció. */
  role: string;
  /** Egy-két mondat. Nem kötelező. */
  bio: string;
  /**
   * Közvetlen e-mail cím. Nem kötelező.
   *
   * Aki egy konkrét kollégához fordulna, ne az általános címre írjon — de ez
   * döntés kérdése, nem minden szerepnél van értelme. Üresen a sor kimarad.
   */
  email: string;
  /** Közvetlen telefonszám. Nem kötelező, ugyanazon okból. */
  phone: string;
  /** `/media/…` útvonal, vagy üres. */
  photo: string;
  /** Kézi sorrend. Kisebb szám előrébb. */
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type TeamMemberInput = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>;

const team = createCollection<TeamMember>('team.json');

/**
 * A csapatot megjelenítő oldalak gyorsítótár-címkéje. Egyetlen címke
 * érvényteleníti mindet — útvonalanként felsorolva egy új megjelenési hely
 * némán kimaradna.
 */
export const TEAM_TAG = 'team';

const readTeam = unstable_cache(async () => team.read(), ['klivo-team', team.fingerprint()], {
  tags: [TEAM_TAG],
});

/** Kézi sorrend szerint, azonos sorszámnál név szerint. */
function byOrder(a: TeamMember, b: TeamMember): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.name.localeCompare(b.name, 'hu');
}

export async function listTeam(): Promise<TeamMember[]> {
  return [...(await readTeam())].sort(byOrder);
}

export async function getTeamMember(id: string): Promise<TeamMember | undefined> {
  return (await readTeam()).find((member) => member.id === id);
}

export async function createTeamMember(input: TeamMemberInput): Promise<TeamMember> {
  const now = new Date().toISOString();
  const created = await team.mutate((items) => {
    const member: TeamMember = { ...input, id: createId(), createdAt: now, updatedAt: now };
    return { items: [...items, member], result: member };
  });

  revalidateTag(TEAM_TAG);
  return created;
}

export async function updateTeamMember(
  id: string,
  input: TeamMemberInput,
): Promise<TeamMember | undefined> {
  const now = new Date().toISOString();
  const updated = await team.mutate((items) => {
    const index = items.findIndex((member) => member.id === id);
    if (index === -1) return { items, result: undefined };

    const next: TeamMember = { ...(items[index] as TeamMember), ...input, updatedAt: now };
    const copy = [...items];
    copy[index] = next;
    return { items: copy, result: next };
  });

  revalidateTag(TEAM_TAG);
  return updated;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const removed = await team.mutate((items) => {
    const next = items.filter((member) => member.id !== id);
    return { items: next, result: next.length !== items.length };
  });

  revalidateTag(TEAM_TAG);
  return removed;
}
