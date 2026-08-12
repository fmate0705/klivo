import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/site/logo';
import { nav, services } from '@/lib/site';

export const metadata = {
  title: 'Az oldal nem található',
  robots: { index: false, follow: false },
};

/**
 * A 404-es oldal.
 *
 * Nem viccel és nem kér bocsánatot: megmondja, mi történt, és felkínálja a
 * legvalószínűbb következő lépéseket. Egy eltévedt látogató a legdrágább
 * látogató — vagy továbbmegy, vagy elmegy.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="border-b border-border">
        <Container className="flex h-header items-center">
          <Logo />
        </Container>
      </div>

      <div className="flex flex-1 items-center py-24">
        <Container>
          <div className="max-w-2xl">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-primary">
              404
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl">Ez az oldal nincs meg</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Lehet, hogy elgépelted a címet, vagy az oldal időközben átkerült máshová. Innen tudsz
              továbbmenni:
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/" size="lg">
                Vissza a főoldalra
              </ButtonLink>
              <ButtonLink href="/kapcsolat" variant="outline" size="lg">
                Kapcsolat
              </ButtonLink>
            </div>

            <div className="mt-14 grid gap-10 border-t border-border pt-10 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-subtle">
                  Szolgáltatások
                </h2>
                <ul className="mt-4 space-y-2">
                  {services.map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/szolgaltatasok/${service.slug}`}
                        className="text-primary transition-colors duration-fast hover:text-primary-hover"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-subtle">
                  Oldalak
                </h2>
                <ul className="mt-4 space-y-2">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-primary transition-colors duration-fast hover:text-primary-hover"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
