import { processSteps } from '@/lib/content/site';
import { WAVE_VIEWBOX, wavePath } from '@/lib/wave-path';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone, type SectionBand } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * A folyamat öt lépése — számozott kártyák egy sorban.
 *
 * **Miért sor, és nem idővonal.** Korábban függőleges idővonal volt itt, a
 * lépések felváltva a középvonal két oldalán. Az öt lépés attól hosszú
 * görgetéssé nyúlt, és a *sorrend* — ami itt maga az információ — csak
 * darabonként látszott. Egymás mellett viszont az egész út egy pillantással
 * átfogható: ennyi lépés van, itt tartasz, ez jön.
 *
 * **A kártyák váltakozva ülnek magasabban és mélyebben.** Nem dísz: öt egyforma
 * doboz egy sorban rácsnak látszik, nem útnak. A váltakozás ritmust ad, és a
 * szem magától balról jobbra halad rajta.
 *
 * **A fejléc hulláma viszi a formanyelvet.** Minden kártya tetején egy tömör
 * színsáv áll, aminek az alsó éle **hullám** (`lib/wave-path.ts`) — ugyanaz a
 * görbe, ami a szekcióhatárokat rajzolja. A tónus lépésről lépésre mélyül a kék
 * skálán: az
 * első lépés a legvilágosabb, az élesítés a legmélyebb. Színátmenet nincs, csak
 * öt tiszta fokozat — ahogy az oldalon mindenütt.
 *
 * **A mozgás két rétegű.** A kártyák görgetésre úsznak be, lépcsőzve
 * (`Reveal`), a sorszám pedig **görgetéshez kötve telik meg** kontúrosból
 * tömörré (`animation-timeline`). Az utóbbihoz nincs figyelő, és a
 * compositoron fut. Ahol a böngésző nem ismeri, a szám eleve teli: egy hiányzó
 * animáció nem tüntethet el információt.
 */

/**
 * A fejléc sávjának tónusa lépésenként.
 *
 * A skála sötét vége felé halad, és szándékosan a `wave-5`-nél kezd: a
 * `wave-3` és a `wave-4` túl közel van a világoskék szekciófelülethez, ott a
 * sáv elmosódna.
 */
const CAPS = ['wave-5', 'wave-6', 'wave-7', 'wave-8', 'wave-9'] as const;

/** Fázistolás sávonként, hogy ne ugyanaz a hullám ismétlődjön ötször. */
const PHASES = [0.1, 0.62, 0.28, 0.84, 0.45];

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

        {/* Az alsó térköz az eltolt kártyáknak tart helyet: azok a rács alá
            lógnak, és enélkül a következő szekcióra futnának rá. */}
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:mt-16 xl:grid-cols-5 xl:pb-12">
          {processSteps.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={staggerDelay(index, 90)}
              className={cn(
                'flex min-w-0',
                // **Eltolás, nem felső margó.** A margó a rácsban rövidebbre
                // vágná a kártya dobozát, tehát az eltolt kártyák alacsonyabbak
                // lennének — a referencián viszont egyforma magasak, csak
                // lejjebb ülnek. Az eltolás nem számoltat elrendezést, és a
                // compositoron marad.
                //
                // Csak ott van értelmezve, ahol a kártyák **egy sorban**
                // állnak: keskenyebb nézetben egymás alá kerülnek, ott az
                // eltolás csak szabálytalan réseket csinálna.
                index % 2 === 1 && 'xl:translate-y-12',
              )}
            >
              <StepCard step={step} index={index} />
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function StepCard({
  step,
  index,
}: {
  step: { readonly title: string; readonly body: string };
  index: number;
}) {
  const tone = CAPS[index % CAPS.length] as string;
  const phase = PHASES[index % PHASES.length] as number;

  return (
    <Card flush className="process-card flex w-full flex-col overflow-hidden">
      <Cap tone={tone} phase={phase} />

      <div className="flex flex-1 flex-col px-6 pb-7 pt-5">
        <p aria-hidden="true" data-numeric className="process-card__number">
          {String(index + 1).padStart(2, '0')}
        </p>

        <h3 className="mt-3 text-h5">
          {/* A sorszám a képernyőolvasónak is kell, de nem kétszer: a rajzolt
              szám rejtett, a jelentése a címsorba kerül. */}
          <span className="sr-only">{index + 1}. lépés — </span>
          {step.title}
        </h3>

        <WaveRule className="mt-4" />

        <p className="text-soft mt-4 text-body-sm">{step.body}</p>
      </div>
    </Card>
  );
}

/**
 * A kártya fejlécsávja: tömör tónus, hullámos alsó éllel.
 *
 * Két rétegből áll. A tömör blokk adja a sáv testét, az alatta lévő rajz pedig
 * a hullámot: a gerinc **fölötti** rész ugyanaz a tónus (`fill: 'up'`), alatta
 * a kártya felülete látszik át.
 *
 * **Fehér kontúr itt nincs**, pedig a hullámokon mindenütt van. Ott két kék
 * tónus találkozik, és a kontúr választja el őket; itt a sáv a kártya **fehér**
 * felületével határos, tehát az él magától a lehető legélesebb — egy fehér
 * vonal a fehéren nem jelenne meg, csak egy fölösleges útvonal lenne a
 * rajzban.
 */
function Cap({ tone, phase }: { tone: string; phase: number }) {
  return (
    <span aria-hidden="true" className="block">
      <span className="block h-9 w-full" style={{ backgroundColor: `rgb(var(--${tone}))` }} />
      <svg
        className="block h-5 w-full"
        viewBox={WAVE_VIEWBOX}
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d={wavePath({ crests: 1, amplitude: 0.42, phase, baseline: 0.52, skew: 0.3, fill: 'up' })}
          fill={`rgb(var(--${tone}))`}
        />
      </svg>
    </span>
  );
}
