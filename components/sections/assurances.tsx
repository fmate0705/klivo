import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionArt } from '@/components/ui/section-art';
import { assurances } from '@/lib/site';

/**
 * Az üzemeltetési garanciák sávja.
 *
 * Egyetlen szám kerül ki nagyban: a rendelkezésre állás. Ez az a mérőszám, amit
 * egy megrendelő is érteni fog — az oldal elérhető vagy sem. A technikai
 * mutatókat (betöltési mérőszámok és társaik) szándékosan nem tesszük ki: aki
 * nem fejlesztő, annak semmit nem mondanak, aki meg az, úgyis lemér mindent.
 *
 * A háttérben ugyanaz a rétegzett grafika fut, amit a tárhely oldal is használ —
 * háttérként, keret nélkül, hogy a szám maradjon a főszereplő.
 */
export function Assurances() {
  return (
    <Section tone="surface" spacing="tight" className="isolate overflow-hidden">
      {/* A rétegzett grafika egy *tárgy*, nem tapéta: `contain`-nel teljes
          egészében látszik, jobbra igazítva, maszkkal feloldott széllel. A
          korábbi `cover` a felét levágta, és ettől hatott elrontottnak. */}
      <SectionArt
        src="/images/hosting-layers.webp"
        align="right"
        fit="contain"
        className="mask-soft left-auto right-0 w-full max-w-[36rem] opacity-20 lg:opacity-45"
      />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-20">
          <div data-reveal className="shrink-0">
            <span className="tracking-display block text-6xl font-semibold text-foreground">
              98%+
            </span>
            <span className="mt-3 block text-sm text-muted">
              rendelkezésre állás az általunk
              <br className="hidden sm:inline" /> üzemeltetett oldalakon
            </span>
          </div>

          <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {assurances.map((item, index) => (
              <li
                key={item.title}
                data-reveal
                style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
              >
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
