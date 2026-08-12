import { PageHeader } from '@/components/site/page-header';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { GlowSpot, SectionArt } from '@/components/ui/section-art';
import { Assurances } from '@/components/sections/assurances';
import { CtaBand } from '@/components/sections/cta-band';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { about, primaryCta } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Rólunk — kis csapat, egyenes beszéd',
  description:
    'A Klivo magyar webügynökség: weboldalt és webalkalmazást építünk, és üzemeltetjük is. Fix ár, gyors munka, keresőoptimalizálás az első sortól.',
  path: '/rolunk',
});

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Rólunk" title={about.title} lead={about.intro}>
        <ButtonLink href={primaryCta.href} size="lg">
          {primaryCta.label}
        </ButtonLink>
      </PageHeader>

      <Section className="isolate overflow-hidden">
        {/* A grafika háttér: kifut a szekció széléig, és elhalványul — nincs
            keret, nincs saját helye az elrendezésben. */}
        <SectionArt
          src="/images/wave-b.svg"
          position="bottom"
          fit="cover"
          opacity={0.5}
          className="mix-blend-multiply"
        />
        <GlowSpot className="-right-32 top-10" size="34rem" />

        <Container className="relative">
          <SectionHeader
            eyebrow="Ahogy dolgozunk"
            title="Négy dolog, amiben nem engedünk"
            lead="Nem díjakat sorolunk és nem mutatunk kitalált statisztikákat. Azt írjuk le, hogyan dolgozunk — a többi ebből következik."
          />

          <dl className="mt-16 grid gap-x-16 gap-y-14 sm:mt-20 sm:grid-cols-2">
            {about.values.map((value, index) => (
              <div
                key={value.title}
                data-reveal
                style={{ '--reveal-delay': `${(index % 2) * 90}ms` } as React.CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="tracking-display block select-none text-5xl font-semibold leading-none text-transparent sm:text-6xl"
                  style={{ WebkitTextStroke: '1px rgb(var(--border-strong-rgb))' }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <dt className="mt-5 text-xl font-semibold text-foreground">{value.title}</dt>
                <dd className="mt-3 max-w-lg leading-relaxed text-muted">{value.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Assurances />

      <CtaBand
        title="Beszéljünk arról, mire van szükséged"
        lead="Nem sablonajánlatot küldünk. Előbb megértjük, mit csinálsz, aztán mondunk árat."
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Rólunk', path: '/rolunk' },
        ])}
      />
    </>
  );
}
