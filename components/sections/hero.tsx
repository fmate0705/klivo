import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { hero, primaryCta, secondaryCta } from '@/lib/content/site';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { WaveCurls } from '@/components/wave/wave-curls';
import { Bubbles } from '@/components/wave/bubbles';
import { WordCycle } from '@/components/hero/word-cycle';
import { ScrollCue } from '@/components/hero/scroll-cue';

/**
 * A nyitóképernyő.
 *
 * Mély tengerkék felület, rajta az egymásra torlódó hullámtestek, amelyek a
 * mutatót követik. A szöveg fehér: a hullámmező felső kétharmadában csak a két
 * legmélyebb kék fut, tehát a címsor mindig 5,8:1 fölött marad.
 * A középpontban egyetlen dolog: a mondat, a lehető legnagyobb méretben. Egy ügynökségi
 * oldalon az első képernyőn a *mondat* a bizonyíték; ha az halk, az egész oldal
 * az. A kép a következő szekciókban jön, amikor már van mit illusztrálnia.
 *
 * A címsor sorai maszkolt ablakon át emelkednek be, 110 ms-onként lépcsőzve. Az
 * első sor akkor indul, amikor a nyitó függöny utolsó sávja is felfelé mozdul,
 * tehát a két mozgás egyetlen mozdulatnak látszik, nem két egymás utáninak.
 */

/** A nyitó függöny utolsó sávja 285 ms-nál indul; a címsor onnan veszi át. */
const FIRST_LINE_DELAY_MS = 420;
const LINE_STEP_MS = 110;

/** A címsor utáni elemek innen lépcsőznek tovább. */
const AFTER_TITLE_MS = FIRST_LINE_DELAY_MS + hero.titleLines.length * LINE_STEP_MS;

export function Hero({
  /**
   * Látszódjon-e a zárósor (a mit építünk mondat és a görgetésjelző).
   *
   * Akkor kapcsol ki, ha a nyitóképernyő alá partnersáv kerül: két záró gesztus
   * egymás alatt kioltja egymást, és a nyitókép a duplájára nyúlik. A sáv
   * ugyanazt a szerepet tölti be — lezárja a képernyőt, és lefelé mutat.
   */
  closing = true,
}: { closing?: boolean } = {}) {
  return (
    <section
      data-tone="dark"
      className={cn(
        'relative isolate flex flex-col overflow-hidden bg-wave-9 pt-32 text-on-dark lg:pt-40',
        // Zárósorral a nyitóképernyő majdnem teljes képernyős. Nélküle
        // alacsonyabb: a partnersáv lép a zárósor helyére, és a kettő együtt
        // adja ki a képernyőt. Enélkül a sáv alatta üres kék mezőt hagyna, és
        // a hajlat alá csúszna.
        closing ? 'min-h-[90svh] pb-8 sm:pb-10' : 'min-h-[80svh] pb-2 lg:min-h-[76svh]',
      )}
      aria-labelledby="hero-cim"
    >
      {/* Zárósor nélkül a nyitóképernyő alacsonyabb, és a `center`
          igazítású rajzterületből a **világos taréjok** is belógnak a felvezető
          bekezdés mögé — fehér szöveg azokon 1,2:1. A `top` változat a
          rajzterületet a doboznál magasabbra feszíti és a tetejéhez igazítja,
          tehát mindig a felső kétharmad látszik, ahol csak a két legmélyebb kék
          fut. Ugyanezt csinálják az aloldalak fejlécei is. */}
      <WaveCurls waterline align={closing ? 'center' : 'top'} />
      <Bubbles />

      <Container className="wave-content flex flex-1 flex-col">
        <div
          className={cn(
            'flex flex-1 flex-col',
            // A zárósor helye. Nélküle kisebb alsó térköz elég: a sort a
            // partnersáv váltja ki, és a szöveg így sem csúszik a vízvonalra —
            // arról a `top` igazítású rajzterület gondoskodik odafent.
            closing ? 'justify-center pb-24 lg:pb-32' : 'justify-center pb-16 lg:pb-20',
          )}
        >
          <h1
            id="hero-cim"
            className="max-w-[15ch] font-display text-[clamp(3.25rem,10.5vw,9rem)] font-bold leading-[0.9] tracking-[-0.045em]"
          >
            {hero.titleLines.map((line, index) => (
              <span key={line} className="rise-mask">
                <span
                  className="rise"
                  style={
                    {
                      '--rise-delay': `${FIRST_LINE_DELAY_MS + index * LINE_STEP_MS}ms`,
                    } as CSSProperties
                  }
                >
                  {line}{' '}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="rise mt-9 max-w-prose text-body-lg font-medium text-on-dark"
            style={{ '--rise-delay': `${AFTER_TITLE_MS + 80}ms` } as CSSProperties}
          >
            {hero.subtitle}
          </p>

          <div
            className="rise mt-10 flex flex-wrap items-center gap-3"
            style={{ '--rise-delay': `${AFTER_TITLE_MS + 180}ms` } as CSSProperties}
          >
            <ButtonLink href={primaryCta.href} tone="dark" size="lg" arrow>
              {primaryCta.label}
            </ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="secondary" tone="dark" size="lg">
              {secondaryCta.label}
            </ButtonLink>
          </div>
        </div>

        {/* Zárósor a mély vízen: itt már a sötét szalagok futnak, tehát fehér.
            Partnersáv mellett elmarad — azt a szerepet a sáv veszi át.

            A felső vonal csak `sm`-től van meg. Mobilon a sor két sorba törik,
            és a teteje kicsúszik a vízvonal fölé — a vonal ott a világos vízen
            ülne, egy vízszintes karcként a hullámok fölött. A vízvonal hullámos
            éle amúgy is elválasztja a sort a hero törzsétől. */}
        {closing ? (
          <div
            data-tone="dark"
            className="rise border-soft mt-auto flex flex-col gap-4 pt-6 text-on-dark sm:flex-row sm:items-baseline sm:justify-between sm:border-t"
            style={{ '--rise-delay': `${AFTER_TITLE_MS + 280}ms` } as CSSProperties}
          >
            <p className="flex flex-wrap items-baseline gap-x-2 text-body-lg">
              <span className="text-on-dark/80">{hero.rotatingPrefix}</span>
              <WordCycle words={hero.rotatingWords} className="font-display font-semibold" />
            </p>

            <ScrollCue label={hero.scrollCue} />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
