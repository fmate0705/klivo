import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { GridArt } from '@/components/ui/section-art';
import { pillars } from '@/lib/site';

/**
 * Az érvelés első lépcsője: négy állítás arról, mit kap a megrendelő.
 *
 * Nem kártyarács. Négy egyforma doboz mellérendeli a négy állítást, a szem
 * átfut rajtuk, és egyik sem marad meg. Itt ehelyett egy *lista* van, széles
 * sorokkal: balra a nagy, kontúros sorszám, jobbra a cím és az érv. A hajszálnyi
 * elválasztó vonalak adják a ritmust, keret és háttér nélkül.
 *
 * A bal oldali fejléc nagy képernyőn megtapad görgetés közben, így a „miért mi”
 * kérdés végig a szeme előtt marad annak, aki a válaszokat olvassa.
 */
export function Pillars() {
  return (
    <Section id="ertek" className="isolate overflow-hidden">
      {/* A hero rácsa itt fut tovább — a lap tetejétől lefelé ez az oldal
          vizuális aláírása. */}
      <GridArt size={76} opacity={0.45} />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader
            eyebrow="Miért a Klivo"
            title="Egy weboldal akkor jó, ha hoz valamit"
            lead="Nem díjakat gyűjtünk, hanem ügyfeleket szerzünk neked. Ez a négy dolog az, amiben nem kötünk kompromisszumot."
            className="lg:sticky lg:top-32 lg:self-start"
          />

          <ul className="divide-y divide-border border-y border-border">
            {pillars.map((pillar, index) => (
              <li
                key={pillar.title}
                data-reveal
                style={{ '--reveal-delay': `${index * 80}ms` } as React.CSSProperties}
                className="group flex gap-6 py-8 first:pt-0 sm:gap-10"
              >
                <span
                  aria-hidden="true"
                  className="tracking-display w-[2.2ch] shrink-0 select-none text-4xl font-semibold leading-none text-transparent transition-colors duration-slow sm:text-5xl"
                  style={{ WebkitTextStroke: '1px rgb(var(--border-strong-rgb))' }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div>
                  <h3 className="text-xl transition-colors duration-fast group-hover:text-primary sm:text-2xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 max-w-xl leading-relaxed text-muted">{pillar.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
