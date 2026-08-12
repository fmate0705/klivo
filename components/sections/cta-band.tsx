import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { ButtonLink } from '@/components/ui/button';
import { GlowSpot, GridArt } from '@/components/ui/section-art';
import { primaryCta } from '@/lib/site';
import { emailHref, getSettings } from '@/lib/store/settings';

/**
 * A záró felszólítás.
 *
 * Nem sáv, hanem *panel*: egy lekerekített, szegélyezett felület, amely
 * kiemelkedik a lapból. Így lesz feltűnő anélkül, hogy sötét lenne — a
 * figyelmet a keret, az árnyék és a köré tett térköz viszi, nem a színváltás.
 *
 * A háttérben a hero négyzetes rácsa fut tovább (ez az oldal vizuális
 * aláírása), plusz egy halvány fénykorong. Fotó nincs mögötte: a szöveg itt a
 * lényeg, egy kép csak rontaná az olvashatóságát.
 */
export async function CtaBand({
  title = 'Van egy ötleted? Nézzük meg, mibe kerül.',
  lead = 'Írd meg pár mondatban, mire van szükséged. Egy munkanapon belül válaszolunk, és fix árat adunk — nem általánosságokat.',
}: {
  title?: string;
  lead?: string;
}) {
  const { contact } = await getSettings();

  return (
    <Section spacing="tight">
      <Container>
        <div
          data-reveal="scale"
          className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-surface-raised px-6 py-20 shadow-xl sm:px-14 sm:py-24"
        >
          {/* Vékony színcsík a panel tetején: ez emeli ki a felületet anélkül,
              hogy sötét sávot kellene tenni a lapra. */}
          <span
            aria-hidden="true"
            data-decorative
            className="bg-sheen-primary absolute inset-x-0 top-0 h-[3px]"
          />
          <GridArt size={64} opacity={0.6} />
          <GlowSpot className="left-1/2 top-[-16rem] -translate-x-1/2" size="46rem" />
          <GlowSpot className="-bottom-32 -right-24" color="accent" size="28rem" />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="tracking-display text-4xl sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">{lead}</p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href={primaryCta.href} size="lg" className="w-full sm:w-auto">
                {primaryCta.label}
              </ButtonLink>
              <a
                href={emailHref(contact.email)}
                className="text-[0.9375rem] font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast hover:text-primary hover:decoration-primary/50"
              >
                {contact.email}
              </a>
            </div>

            {/* Három rövid megerősítés, ami a gomb megnyomása előtti utolsó
                kifogásokat veszi el. */}
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
              {[contact.responseTime, 'Fix ár, előre rögzítve', 'Nincs kötelezettség'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M4 8.4 6.6 11 12 5.4"
                        stroke="rgb(var(--primary-rgb))"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
