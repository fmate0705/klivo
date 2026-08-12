'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { leadStatuses, leadStatusLabels, type LeadStatus } from '@/lib/store/lead-status';

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  topic: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

/**
 * A beérkezett megkeresések.
 *
 * Nyitható sorok: a listában csak annyi látszik, amiből eldönthető, kell-e vele
 * foglalkozni, a teljes üzenet pedig egy kattintásra van. Egy hosszú
 * üzenetekkel teli táblázat használhatatlan.
 *
 * A kapcsolati űrlap adatait szándékosan itt tároljuk és nem e-mailben küldjük:
 * SMTP hozzáférés nélkül egy elküldetlen e-mail néma adatvesztés volna.
 */
export function LeadTable({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function setStatus(id: string, status: LeadStatus) {
    setPendingId(id);
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setPendingId(null);
    router.refresh();
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Törlöd ${name} megkeresését? Ez nem vonható vissza.`)) return;
    setPendingId(id);
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    setPendingId(null);
    router.refresh();
  }

  if (leads.length === 0) {
    return <p className="text-muted">Még nem érkezett megkeresés.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {leads.map((lead) => {
        const open = openId === lead.id;

        return (
          <li key={lead.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : lead.id)}
                aria-expanded={open}
                className="min-w-0 flex-1 text-left"
              >
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="font-medium text-foreground">{lead.name}</span>
                  <StatusPill status={lead.status} />
                  <span className="text-sm text-subtle">{formatDateTime(lead.createdAt)}</span>
                </span>
                <span className="mt-1 block truncate text-sm text-muted">
                  {lead.topic} · {lead.email}
                  {lead.company ? ` · ${lead.company}` : ''}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <select
                  aria-label="Állapot"
                  value={lead.status}
                  disabled={pendingId === lead.id}
                  onChange={(event) => setStatus(lead.id, event.target.value as LeadStatus)}
                  className="rounded-lg border border-border-strong bg-background px-3 py-1.5 text-sm"
                >
                  {leadStatuses.map((status) => (
                    <option key={status} value={status}>
                      {leadStatusLabels[status]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => remove(lead.id, lead.name)}
                  disabled={pendingId === lead.id}
                  className="rounded-lg px-2.5 py-1.5 text-sm text-danger transition-colors duration-fast hover:bg-danger/10 disabled:opacity-50"
                >
                  Törlés
                </button>
              </div>
            </div>

            {open ? (
              <div className="mt-4 rounded-xl border border-border bg-surface p-5">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-subtle">E-mail</dt>
                    <dd>
                      <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                        {lead.email}
                      </a>
                    </dd>
                  </div>
                  {lead.phone ? (
                    <div>
                      <dt className="text-subtle">Telefon</dt>
                      <dd>
                        <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                          {lead.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {lead.company ? (
                    <div>
                      <dt className="text-subtle">Cég</dt>
                      <dd className="text-foreground">{lead.company}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-subtle">Téma</dt>
                    <dd className="text-foreground">{lead.topic}</dd>
                  </div>
                </dl>

                <p className="mt-4 whitespace-pre-wrap border-t border-border pt-4 leading-relaxed text-muted">
                  {lead.message}
                </p>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        status === 'new' && 'bg-primary/10 text-primary ring-primary/20',
        status === 'in-progress' && 'bg-warning/10 text-warning ring-warning/20',
        status === 'done' && 'bg-success/10 text-success ring-success/20',
        status === 'archived' && 'bg-surface text-muted ring-border',
      )}
    >
      {leadStatusLabels[status]}
    </span>
  );
}
