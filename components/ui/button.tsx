import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Buttons and button-shaped links.
 *
 * The pressed state is a 1px translate rather than a scale: on a page this
 * spacious, a scaling button reads as a toy. The hover lift is the same
 * distance in reverse, so the control feels like a physical key.
 */
const button = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full',
    'font-medium tracking-[-0.01em]',
    'transition-[transform,background-color,border-color,color,box-shadow] duration-fast ease-standard',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:translate-y-px',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground shadow-sm',
          'hover:-translate-y-px hover:bg-primary-hover hover:shadow-md',
        ],
        secondary: [
          'bg-foreground text-background shadow-sm',
          'hover:-translate-y-px hover:bg-foreground/90 hover:shadow-md',
        ],
        outline: [
          'border border-border-strong bg-background text-foreground',
          'hover:-translate-y-px hover:border-foreground/30 hover:bg-surface hover:shadow-sm',
        ],
        ghost: 'text-foreground hover:bg-surface',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-[0.9375rem]',
        lg: 'h-[3.25rem] px-8 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonVariants = VariantProps<typeof button>;

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariants) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & ButtonVariants) {
  return (
    <Link href={href} className={cn(button({ variant, size }), className)} {...props}>
      {children}
    </Link>
  );
}

/**
 * A text link with an arrow that slides on hover — used wherever a section
 * hands the reader off to a deeper page.
 */
export function ArrowLink({
  href,
  children,
  className,
  tone = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  tone?: 'primary' | 'foreground';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-1.5 text-[0.9375rem] font-medium',
        'transition-colors duration-fast',
        tone === 'primary' && 'text-primary hover:text-primary-hover',
        tone === 'foreground' && 'text-foreground hover:text-primary',
        className,
      )}
    >
      {children}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-normal ease-expo group-hover:translate-x-1"
      >
        <path
          d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
