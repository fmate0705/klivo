import Link from 'next/link';
import { cn } from '@/lib/cn';
import { site } from '@/lib/site';

/**
 * A szóvédjegy.
 *
 * Szövegként és egy apró geometrikus jelként van megrajzolva, nem képfájlként:
 * minden képsűrűségen éles marad, nem kerül külön kérésbe, és nem tud
 * elrendezést ugrasztani betöltés közben.
 */
export function Logo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-[-0.03em] text-foreground',
        className,
      )}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="22" rx="6.5" fill="rgb(var(--primary-rgb))" />
        {/* Stilizált K: egy szár, két sugár. */}
        <path
          d="M8.5 6.5v11M15.5 6.5 9.6 12.1M15.5 17.5 9.6 12.1"
          stroke="rgb(255 255 255)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {site.name}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" aria-label={`${site.name} — főoldal`} className="rounded-md">
      {content}
    </Link>
  );
}
