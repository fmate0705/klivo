import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * A Klivo jel és névjegy.
 *
 * A jel három egymás alatt futó hullámvonal: ugyanaz a motívum, ami az egész
 * oldal hátterét adja, egyetlen 24 pixeles glifává sűrítve. Nem monogram és
 * nem betűjel — azokból mindenkinek van egy, és 20 pixelen már felismerhetetlen.
 *
 * Rálebegésre a három vonal eltérő mértékben csúszik el, mintha átfutna rajtuk
 * egy hullám. 220 ms, `transform`-mal: a márkajel él, de nem hívja fel magára
 * a figyelmet.
 */

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={cn('h-6 w-6 shrink-0', className)}
    >
      <path
        d="M2 7c2.5 0 2.5-3.5 5-3.5S9.5 7 12 7s2.5-3.5 5-3.5S19.5 7 22 7"
        className="origin-center transition-transform duration-ui ease-standard group-hover/logo:translate-x-[1.5px]"
      />
      <path
        d="M2 13.5c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5"
        className="origin-center transition-transform duration-ui ease-standard group-hover/logo:-translate-x-[1.5px]"
      />
      <path
        d="M2 20c2.5 0 2.5-3.5 5-3.5s2.5 3.5 5 3.5 2.5-3.5 5-3.5 2.5 3.5 5 3.5"
        className="origin-center transition-transform duration-ui ease-standard group-hover/logo:translate-x-[1.5px]"
      />
    </svg>
  );
}

export function Logo({
  href = '/',
  tone = 'light',
  className,
}: {
  href?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group/logo inline-flex items-center gap-2.5 rounded-pill',
        tone === 'dark' ? 'text-on-dark' : 'text-ink',
        className,
      )}
    >
      <LogoMark className={tone === 'dark' ? 'text-on-dark' : 'text-ink'} />
      <span className="font-display text-h5 leading-none tracking-tight">Klivo</span>
      <span className="sr-only">— főoldal</span>
    </Link>
  );
}
