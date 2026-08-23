import { primaryCta } from '@/lib/content/site';
import { getOrganization } from '@/lib/organization';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';

/**
 * A záró felhívás.
 *
 * Egyetlen elsődleges cselekvés, ugyanazzal a felirattal, mint a fejlécben — az
 * oldalon végig egy szándék van, és annak egy neve. Mellette a két közvetlen
 * elérhetőség, mert aki telefonálni akar, az nem űrlapot keres.
 *
 * Utolsó sötét szekció a lábléc előtt: a kettő együtt zárja le az oldalt, a
 * hullám pedig átvezet a láblécbe. Szándékosan **tömör** — egy záró felhívás
 * nem lehet akkora, mint egy tartalmi szekció, különben úgy néz ki, mintha
 * lenne még mondanivalója.
 */
export function CtaBand({
  band,
  title = 'Mondd el, mire van szükséged',
  lead,
}: {
  band?: SectionBand;
  title?: string;
  lead?: string;
}) {
  const { contact } = getOrganization();

  return (
    <Section band={band} tone="blue" bubbles className="py-14 md:py-16 lg:py-20">
      <Container>
        <div className="max-w-2xl">
          <Reveal as="h2" className="text-h3">
            {title}
          </Reveal>

          <Reveal as="p" delay={60} className="mt-4 max-w-prose text-body text-on-dark">
            {lead ??
              `Írd le néhány mondatban, mit szeretnél. Átnézzük, és fix árat adunk rá. ${contact.responseTime}`}
          </Reveal>

          <Reveal delay={120} className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href={primaryCta.href} tone="dark" size="lg" arrow>
              {primaryCta.label}
            </ButtonLink>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
