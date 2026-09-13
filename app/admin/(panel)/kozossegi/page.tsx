import { SocialManager } from '@/components/admin/social-manager';
import { listSocialLinks } from '@/lib/store/social';

export const dynamic = 'force-dynamic';

/**
 * A közösségi profilok.
 *
 * Külön menüpont, mert nem tartalom: nem írunk hozzá semmit, csak azt mondjuk
 * meg, hol vagyunk még megtalálhatók. A címek a láblécbe, a kapcsolat oldalra
 * és a keresőnek küldött strukturált adatba (`sameAs`) is ugyaninnen mennek.
 */
export default async function AdminSocialPage() {
  const links = await listSocialLinks();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-h4 font-semibold">Közösségi média</h1>
        <p className="mt-1 text-muted">
          {links.length === 0
            ? 'Még nincs profil felvéve.'
            : `${links.length} profil. Ezek jelennek meg a láblécben és a kapcsolat oldalon.`}
        </p>
      </header>

      <SocialManager links={links} />
    </div>
  );
}
