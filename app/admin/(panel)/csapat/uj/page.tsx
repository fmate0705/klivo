import Link from 'next/link';
import { TeamEditor } from '@/components/admin/team-editor';

export const dynamic = 'force-dynamic';

export default function NewTeamMemberPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link href="/admin/csapat" className="text-body-sm text-muted hover:text-ink">
          ← Csapat
        </Link>
        <h1 className="mt-2 text-h4 font-semibold">Új csapattag</h1>
        <p className="mt-1 text-muted">A mentés után azonnal megjelenik a Rólunk oldalon.</p>
      </header>

      <TeamEditor />
    </div>
  );
}
