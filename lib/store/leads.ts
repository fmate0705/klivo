import { createCollection, createId } from './json-store';
import type { LeadStatus } from './lead-status';

// Re-exported so server-side callers have one import for the whole domain.
// Client components must import these from './lead-status' directly — see the
// note in that file about why.
export { leadStatuses, leadStatusLabels, isLeadStatus, type LeadStatus } from './lead-status';

/** A submission from the public contact form. */
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  topic: string;
  budget: string;
  message: string;
  status: LeadStatus;
  /** Truncated UA string — helps spot bot floods. Never used for tracking. */
  userAgent: string;
  createdAt: string;
};

export type LeadInput = Omit<Lead, 'id' | 'createdAt' | 'status'>;

const leads = createCollection<Lead>('leads.json');

export async function listLeads(): Promise<Lead[]> {
  return (await leads.read()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function countNewLeads(): Promise<number> {
  return (await leads.read()).filter((lead) => lead.status === 'new').length;
}

export async function createLead(input: LeadInput): Promise<Lead> {
  return leads.mutate((items) => {
    const lead: Lead = {
      ...input,
      id: createId(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    return { items: [lead, ...items], result: lead };
  });
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
  return leads.mutate((items) => {
    const index = items.findIndex((lead) => lead.id === id);
    if (index === -1) return { items, result: undefined };

    const next: Lead = { ...(items[index] as Lead), status };
    const copy = [...items];
    copy[index] = next;
    return { items: copy, result: next };
  });
}

export async function deleteLead(id: string): Promise<boolean> {
  return leads.mutate((items) => {
    const next = items.filter((lead) => lead.id !== id);
    return { items: next, result: next.length !== items.length };
  });
}
