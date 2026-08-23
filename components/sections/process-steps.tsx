import { processSteps } from '@/lib/content/site';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone, type SectionBand } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal } from '@/components/motion/reveal';

/**
 * A folyamat öt lépése — függőleges idővonal.
 *
 * A lépések felváltva állnak a középvonal két oldalán, és mindegyiknél egy nagy,
 * **kontúros sorszám** áll: ez görgetésre telik meg. A pont az idővonalon
 * ugyanekkor gyullad ki. A mozgás nem díszítés — a sorrend maga az információ,
 * és a haladás megmutatja, hol tart az ember az úton.
 *
 * A kitöltés `animation-timeline`-nal megy, tehát nincs hozzá görgetésfigyelő,
 * és a compositoron fut. Ahol a böngésző nem ismeri, a szám és a pont eleve
 * teli: egy hiányzó animáció nem tüntethet el információt.
 *
 * Mobilon nincs két oldal: a vonal balra kerül, a lépések egymás alá. Ott a
 * felezés csak összenyomná a szöveget.
 */
export function ProcessSteps({
  band,
  title = 'Így dolgozunk',
  lead = 'Öt lépés a megkereséstől az élesítésig. Mindegyiknél tudod, mi történik éppen, és mi következik.',
  tone = 'sky',
}: {
  band?: SectionBand;
  title?: string;
  lead?: string;
  tone?: SectionTone;
}) {
  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading title={title} lead={lead} className="max-w-3xl" />

        <ol className="relative mt-16 lg:mt-20">
          {/* A középvonal. Mobilon balra, széles nézetben középen. */}
          <span
            aria-hidden="true"
            className="border-soft absolute bottom-8 left-[7px] top-3 w-px border-l lg:left-1/2 lg:-translate-x-1/2"
          />

          {processSteps.map((step, index) => {
            const right = index % 2 === 1;
            return (
              <li
                key={step.title}
                className={cn(
                  'process-step relative pb-14 pl-10 last:pb-0',
                  'lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-20 lg:pl-0',
                )}
              >
                {/* A pont az idővonalon. */}
                <span
                  aria-hidden="true"
                  className="process-step__dot border-soft bg-raised absolute left-0 top-[0.55rem] block h-4 w-4 rounded-pill border lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
                />

                <Reveal
                  variant={right ? 'right' : 'left'}
                  className={cn(
                    right ? 'lg:col-start-2 lg:pl-8' : 'lg:col-start-1 lg:pr-8 lg:text-right',
                  )}
                >
                  <span aria-hidden="true" className="process-step__number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-h4">{step.title}</h3>
                  <p
                    className={cn(
                      'text-soft mt-3 max-w-md text-body-sm',
                      right ? null : 'lg:ml-auto',
                    )}
                  >
                    {step.body}
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
