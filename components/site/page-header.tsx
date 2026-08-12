import { Container } from '@/components/ui/container';
import { GlowSpot, SectionArt } from '@/components/ui/section-art';
import { cn } from '@/lib/cn';

/**
 * A belső oldalak fejléce.
 *
 * Ugyanaz a szerkezet minden aloldalon: felcím, cím, bevezető, gombok. Az
 * ismétlés itt előny — a látogató két oldal után tudja, hol keresse a választ
 * arra, hogy „miről szól ez az oldal”.
 *
 * A háttérben egy halvány rács és egy fénykorong fut, opcionálisan egy
 * nagyméretű grafika (`art`). A kép itt is háttér: kifut a szekció széléig, és
 * elhalványul — nincs keret, nincs árnyék, nincs saját helye az elrendezésben.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  art,
  wash = true,
  fadeTo = 'background',
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  align?: 'left' | 'center';
  /** Dekoratív háttérgrafika útvonala (`/images/…`). */
  art?: string;
  /** A hero színfátyla a fejléc mögött. Csak indokolt esetben kapcsolandó ki. */
  wash?: boolean;
  /**
   * A fejléc alatti átmenet célszíne — a *következő* szekció háttere.
   *
   * Enélkül a lágy átmenet fehérbe futna akkor is, ahol szürke szekció jön,
   * és a vágás visszatérne, csak pár képponttal lejjebb.
   */
  fadeTo?: 'background' | 'surface';
  children?: React.ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden bg-surface pb-24 pt-[calc(var(--header-height)+3.5rem)] sm:pb-28 sm:pt-[calc(var(--header-height)+5rem)]">
      {/* Ugyanaz a színfátyol, ami a hero mögött fut: ettől tartozik egybe a
          főoldal és az aloldalak nyitóképe. */}
      {wash ? (
        <SectionArt
          src="/images/bg-aurora.webp"
          position="top"
          fit="cover"
          opacity={0.42}
          className="mask-fade-b"
        />
      ) : null}

      <div
        aria-hidden="true"
        data-decorative
        className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10 opacity-60 [--grid-size:72px]"
      />
      {/*
       * A fejléc képe jobbra igazodik, teljes egészében látszik (`contain`), és
       * maszkkal oldódik fel a háttérben. Két hiba ellen véd ez a beállítás:
       * a `cover` levágná a mockup felét, a kemény szél pedig dobozba zárná.
       *
       * Nagy képernyőn erősebb az áttetszősége, mert ott van hely mellette;
       * kisebb kijelzőn a szöveg alá csúszna, ezért ott halványabb.
       */}
      {art ? (
        <SectionArt
          src={art}
          align="right"
          fit="contain"
          className="mask-soft left-auto right-0 top-0 h-full w-full max-w-[34rem] opacity-25 lg:opacity-70"
        />
      ) : null}
      <GlowSpot className="-right-24 -top-32" size="30rem" />

      {/*
       * Lágy átmenet a következő szekcióba.
       *
       * Korábban egy vonal zárta a fejlécet, és a szürke felület egyik
       * képsorról a másikra váltott fehérre — ez az éles váltás az, ami
       * „hirtelennek” hat görgetés közben. A színátmenet ugyanazt a határt
       * húsz képpont helyett hat centiméteren teszi meg, így a szem nem
       * érzékel vágást.
       */}
      <div
        aria-hidden="true"
        data-decorative
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent',
          fadeTo === 'surface' ? 'to-surface' : 'to-background',
        )}
      />

      <Container className="relative">
        <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
          {eyebrow ? (
            <p
              data-reveal
              className={cn(
                'mb-5 inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-primary',
                align === 'center' && 'justify-center',
              )}
            >
              <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
              {eyebrow}
            </p>
          ) : null}

          <h1 data-reveal className="text-4xl sm:text-5xl">
            {title}
          </h1>

          {lead ? (
            <p
              data-reveal
              style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
              className="mt-6 text-lg leading-relaxed text-muted sm:text-xl"
            >
              {lead}
            </p>
          ) : null}

          {children ? (
            <div
              data-reveal
              style={{ '--reveal-delay': '160ms' } as React.CSSProperties}
              className={cn('mt-9 flex flex-wrap gap-3', align === 'center' && 'justify-center')}
            >
              {children}
            </div>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
