import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TeamEditor } from '@/components/admin/team-editor';
import { getTeamMember } from '@/lib/store/team';

export const dynamic = 'force-dynamic';

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getTeamMember(id);
  if (!member) notFound();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link href="/admin/csapat" className="text-body-sm text-muted hover:text-ink">
          ← Csapat
        </Link>
        <h1 className="mt-2 text-h4 font-semibold">{member.name}</h1>
        <p className="mt-1 text-muted">{member.role}</p>
      </header>

      <TeamEditor member={member} />
    </div>
  );
}
