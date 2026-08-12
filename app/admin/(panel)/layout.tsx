import { AdminShell } from '@/components/admin/admin-shell';
import { requireSession } from '@/lib/auth/session';
import { countNewLeads } from '@/lib/store/leads';

/**
 * Minden admin oldal ezen a rétegen keresztül jön, és itt fut a második
 * jogosultság-ellenőrzés (az első a middleware). Ha egy útvonal valaha kiesik a
 * middleware matcheréből, ez még mindig megvédi.
 */
export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('/admin');
  const newLeads = await countNewLeads();

  return (
    <AdminShell username={session.sub} newLeads={newLeads}>
      {children}
    </AdminShell>
  );
}
