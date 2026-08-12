import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { GlowSpot, GridArt } from '@/components/ui/section-art';
import { ownership } from '@/lib/site';

/**
 * „Kié a weboldal?”
 *
 * A szerkezet szándékosan egy **szerződéskivonatot** utánoz: egyetlen
 * hasábban, elválasztó vonalakkal, balra a rövid tétel, jobbra a magyarázat.
 *
 * Miért nem kártyarács: négy egyenrangú doboz mellérendeli a négy állítást, és
 * a szem átfut rajtuk. Ez a négy mondat viszont egy *ígéret* négy pontja —
 * sorban kell olvasni őket, és úgy kell kinézniük, mint valami, amit alá lehet
 * írni. Egy táblázatszerű lista pontosan ezt a hatást kelti, és mellékesen
 * mobilon is jól törik.
 */
export function Ownership() {
  return (
    <Section tone="surface" className="isolate overflow-hidden">
      <GridArt size={72} opacity={0.5} />
      <GlowSpot className="-left-40 top-1/4" size="34rem" />

      <Container className="relative">
        <SectionHeader
          eyebrow="Tulajdonjog"
          title={ownership.title}
          lead={ownership.intro}
          align="center"
        />

        <div
          data-reveal
          className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface-raised shadow-sm sm:mt-16"
        >
          <dl className="divide-y divide-border">
            {ownership.points.map((point, index) => (
              <div
                key={point.title}
                className="grid gap-2 px-6 py-7 transition-colors duration-normal hover:bg-surface/60 sm:grid-cols-[1fr_1.55fr] sm:gap-8 sm:px-10 sm:py-8"
              >
                <dt className="flex items-baseline gap-3 font-semibold text-foreground">
                  <span
                    aria-hidden="true"
                    className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.18em] text-primary"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {point.title}
                </dt>
                <dd className="leading-relaxed text-muted">{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p
          data-reveal
          style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          className="mx-auto mt-6 max-w-4xl text-center text-sm text-subtle"
        >
          Mindezt a szerződés is rögzíti — nem szóbeli ígéret.{' '}
          <Link
            href="/jogi/aszf"
            className="text-primary underline decoration-primary/30 underline-offset-4 transition-colors duration-fast hover:decoration-primary"
          >
            Elolvasom a feltételeket
          </Link>
        </p>
      </Container>
    </Section>
  );
}
