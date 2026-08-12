import { AdminCard } from '@/components/admin/ui';
import { LeadTable } from '@/components/admin/lead-table';
import { listLeads } from '@/lib/store/leads';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const leads = await listLeads();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Üzenetek</h1>
        <p className="mt-1 text-muted">
          A kapcsolati űrlapon beérkezett megkeresések. Kattints egy sorra a teljes üzenetért.
        </p>
      </header>

      <AdminCard>
        <LeadTable
          leads={leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            topic: lead.topic,
            message: lead.message,
            status: lead.status,
            createdAt: lead.createdAt,
          }))}
        />
      </AdminCard>
    </div>
  );
}
