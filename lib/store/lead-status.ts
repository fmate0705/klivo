/**
 * Lead status vocabulary — shared between server and client.
 *
 * This lives apart from `lib/store/leads.ts` on purpose. That module imports
 * `node:fs`, so anything a client component pulls a *value* from it drags the
 * whole Node-only store into the browser bundle, and the build fails on the
 * unresolvable `node:` scheme.
 *
 * Types are erased at compile time and can be imported from anywhere; runtime
 * values cannot. Keeping the enum and its labels in a dependency-free module is
 * what lets the admin inbox render status pills without importing the store.
 */

export const leadStatuses = ['new', 'in-progress', 'done', 'archived'] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: 'Új',
  'in-progress': 'Folyamatban',
  done: 'Lezárva',
  archived: 'Archív',
};

export function isLeadStatus(value: string): value is LeadStatus {
  return (leadStatuses as readonly string[]).includes(value);
}
