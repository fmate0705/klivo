'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Button, ButtonLink } from '@/components/ui/button';

/**
 * A hibaoldal kliens komponens, ezért nem tud az adattárolóhoz nyúlni. Az
 * e-mail cím itt build időben égetett környezeti változóból jön — pontosan
 * ugyanaz az érték, amit a `.env` a cégadatok kezdőértékének is ad.
 */
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@klivo.hu';

/**
 * A gyökér hibahatár.
 *
 * A hiba részleteit soha nem írjuk ki a felületre: egy verem-nyom pontosan azt
 * mondja el egy támadónak, amit tudni szeretne a rendszerről. A konzolra viszont
 * kikerül, hogy a konténer naplójában megtalálható legyen, és ott van a
 * `digest`, amivel egy konkrét hiba visszakereshető.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[hiba]', error);
  }, [error]);

  return (
    <div className="flex min-h-svh items-center bg-background py-24">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-danger">
            Hiba
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl">Valami elromlott</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Az oldal betöltése közben váratlan hiba történt. Próbáld újra — ha továbbra sem működik,
            írj nekünk, és megnézzük.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={reset}>
              Újrapróbálom
            </Button>
            <ButtonLink href="/" variant="outline" size="lg">
              Vissza a főoldalra
            </ButtonLink>
          </div>

          <p className="mt-8 text-sm text-subtle">
            Írj a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:text-primary-hover">
              {CONTACT_EMAIL}
            </a>{' '}
            címre.
            {error.digest ? <> Hibaazonosító: {error.digest}</> : null}
          </p>
        </div>
      </Container>
    </div>
  );
}
