import type { SocialLink } from '@/lib/store/social';
import { platformOf } from '@/lib/content/social';
import { cn } from '@/lib/cn';

/**
 * A közösségi profilok ikonsora.
 *
 * **Egy komponens, két hangnem.** Ugyanez a sor fut a sötét láblécben és a
 * világos kapcsolat oldalon: a jel `currentColor`-t vesz fel, a keret pedig a
 * `border-soft`/`text-soft` hangnem-osztályokat, amelyeket a szülő
 * `data-tone`-ja állít. Két külön változatból előbb-utóbb két különböző méret
 * és két különböző hover lenne.
 *
 * **A név nem dísz.** Az ikon önmagában néma: a képernyőolvasó a `sr-only`
 * feliratot olvassa fel („Facebook”), a mutató alatt pedig a `title` jelenik
 * meg. Egy ikonsor felirat nélkül pontosan az a minta, ami vakon
 * használhatatlan.
 *
 * A hivatkozás `target="_blank"` + `rel="noopener noreferrer"`: idegen
 * felületre visz, és a megnyitott lap nem kaphat hivatkozást a mi ablakunkra.
 */
export function SocialLinks({
  links,
  size = 'md',
  className,
}: {
  links: SocialLink[];
  /** `sm` a láblécbe, `md` a kapcsolat oldalra. */
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {links.map((link) => {
        const platform = platformOf(link.platform);
        // Ismeretlen felület: a tároló régebbi adata lehet, amihez már nincs
        // jelünk. Kihagyjuk — egy üres négyzet rosszabb, mint a hiánya.
        if (!platform) return null;

        return (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={platform.label}
              className={cn(
                'border-soft text-soft flex items-center justify-center rounded-pill border',
                'transition-[color,border-color,transform] duration-feedback ease-standard',
                // `text-inherit` a szülő hangneméből veszi a kiemelt színt:
                // a sötét láblécben fehér, a világos kapcsolat oldalon tinta.
                // Egy rögzített `text-on-dark` az egyiken láthatatlan lenne.
                'hover:-translate-y-0.5 hover:text-inherit focus-visible:-translate-y-0.5',
                'motion-reduce:hover:translate-y-0',
                size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
              )}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}
              >
                <path d={platform.path} />
              </svg>
              <span className="sr-only">{platform.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
