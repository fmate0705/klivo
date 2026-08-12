import { cn } from '@/lib/cn';

/**
 * The horizontal rhythm of the whole site.
 *
 * One component owns the max width and gutters so sections cannot drift apart
 * by a few pixels — the thing the eye notices first on a page that is meant to
 * feel precise.
 */
export function Container({
  className,
  width = 'default',
  children,
}: {
  className?: string;
  width?: 'default' | 'wide' | 'prose';
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 sm:px-8 lg:px-10',
        width === 'default' && 'max-w-container',
        width === 'wide' && 'max-w-container-wide',
        width === 'prose' && 'max-w-prose',
        className,
      )}
    >
      {children}
    </div>
  );
}
