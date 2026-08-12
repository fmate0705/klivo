import { PageHeader } from '@/components/site/page-header';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { Ownership } from '@/components/sections/ownership';
import { Assurances } from '@/components/sections/assurances';
import { Faq } from '@/components/sections/faq';
import { CtaBand } from '@/components/sections/cta-band';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { primaryCta } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Folyamat — így készül a weboldalad',
  description:
    'Megkeresés, fix ajánlat, építés, közös finomhangolás, élesítés és üzemeltetés. Nem tervrajzokat küldünk, hanem működő oldalt mutatunk.',
  path: '/folyamat',
});

/**
 * Amit ez az oldal nem állít.
 *
 * Nincs benne „designtervet küldünk jóváhagyásra” lépés, mert nem így dolgozunk.
 * A folyamat leírásának pontosan azt kell tükröznie, ami a megrendelővel
 * történni fog — egy szépen hangzó, de nem létező lépés az első csalódás forrása.
 */
const expectations = [
  {
    title: 'Amire tőlünk számíthatsz',
    items: [
      'Egy munkanapon belüli válasz a megkeresésedre.',
      'Írásban rögzített ár és határidő, a munka megkezdése előtt.',
      'Működő oldal, nem tervrajz és nem képernyőkép.',
      'Annyi módosítási kör, amennyitől tényleg jó lesz.',
      'Élesítés a saját domainedre, majd üzemeltetés.',
    ],
  },
  {
    title: 'Amire mi számítunk tőled',
    items: [
      'Egy rövid leírás arról, mit csinál a vállalkozásod, és kinek.',
      'Ha van logó, arculat vagy kép, azt küldd el — ha nincs, megoldjuk.',
      'Visszajelzés a bemutatott változatra, néhány napon belül.',
      'A domainhez való hozzáférés az élesítéshez.',
    ],
  },
] as const;

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Folyamat"
        title="Ahogy egy Klivo oldal elkészül"
        lead="Öt lépés, sallang nélkül. Nem küldözgetünk hetekig terveket: megépítjük, megmutatjuk, és onnantól közösen alakítjuk."
        art="/images/app-modules.webp"
      >
        <ButtonLink href={primaryCta.href} size="lg">
          {primaryCta.label}
        </ButtonLink>
      </PageHeader>

      <ProcessTimeline />

      <Section tone="surface">
        <Container>
          <SectionHeader
            eyebrow="Elvárások"
            title="Kinek mi a dolga"
            lead="Egy projekt akkor gyors, ha mindkét oldal tudja, mit vállalt. Ez a kettő a miénk és a tiéd."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {expectations.map((block, index) => (
              <div
                key={block.title}
                data-reveal
                style={{ '--reveal-delay': `${index * 100}ms` } as React.CSSProperties}
                className="rounded-2xl border border-border bg-surface-raised p-8"
              >
                <h3 className="text-xl">{block.title}</h3>
                <ul className="mt-6 space-y-3">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-3 text-muted">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className="mt-1.5 shrink-0"
                      >
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
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Ownership />

      <Assurances />

      <Faq />

      <CtaBand />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Folyamat', path: '/folyamat' },
        ])}
      />
    </>
  );
}
