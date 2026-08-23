import Link from 'next/link';
import Image from 'next/image';
import { AdminCard } from '@/components/admin/ui';
import { ButtonLink } from '@/components/ui/button';
import { listTeam } from '@/lib/store/team';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const members = await listTeam();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h4 font-semibold">Csapat</h1>
          <p className="mt-1 text-muted">
            {members.length} tag. Ez jelenik meg a Rólunk oldal „Ismerd meg a csapatot”
            szekciójában.
          </p>
        </div>
        <ButtonLink href="/admin/csapat/uj">Új csapattag</ButtonLink>
      </header>

      <AdminCard>
        {members.length === 0 ? (
          <p className="text-muted">
            Még nincs csapattag. Amíg üres, a szekció nem jelenik meg a nyilvános oldalon.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="h-14 w-11 shrink-0 overflow-hidden rounded-card bg-wave-3">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt=""
                        width={88}
                        height={112}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : null}
                  </span>

                  <span className="min-w-0">
                    <Link
                      href={`/admin/csapat/${member.id}`}
                      className="block truncate text-body-sm font-medium hover:text-wave-7"
                    >
                      {member.name}
                    </Link>
                    <span className="block text-body-sm text-muted">
                      {member.role} · sorrend: {member.order}
                    </span>
                  </span>
                </div>

                <Link
                  href={`/admin/csapat/${member.id}`}
                  className="text-body-sm text-wave-7 hover:underline"
                >
                  Szerkesztés
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
