import type { Config } from 'tailwindcss';

/**
 * A színek mind csatorna-tokenen keresztül jönnek, hogy az opacity módosítók
 * működjenek: `bg-primary/10`, `border-border/60`, `ring-focus/25`. A Tailwind
 * csak akkor tudja ezeket kiszámolni, ha eléri az sRGB csatornákat — egy hex
 * értéket tartalmazó, átlátszatlan `var()` esetén némán nem generál szabályt.
 *
 * Maguk a token értékek az `app/globals.css`-ben élnek; ez a fájl csak
 * elérhetővé teszi őket a utility rétegnek. Itt egyetlen szín sincs beégetve.
 */
const channel = (token: string) => `rgb(var(--${token}-rgb) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: channel('background'),
        surface: channel('surface'),
        'surface-raised': channel('surface-raised'),
        foreground: channel('foreground'),
        muted: channel('muted'),
        subtle: channel('subtle'),
        border: channel('border'),
        'border-strong': channel('border-strong'),
        primary: {
          DEFAULT: channel('primary'),
          hover: channel('primary-hover'),
          foreground: channel('primary-foreground'),
        },
        accent: {
          DEFAULT: channel('accent'),
          warm: channel('accent-warm'),
        },
        success: channel('success'),
        warning: channel('warning'),
        danger: channel('danger'),
        focus: channel('focus'),
        ink: channel('ink'),
        mockup: channel('mockup'),
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--leading-xs)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--leading-sm)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-base)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--leading-lg)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--leading-xl)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-2xl)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-3xl)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-4xl)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-5xl)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--leading-6xl)' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-normal)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--ease-standard)',
        standard: 'var(--ease-standard)',
        expo: 'var(--ease-out-expo)',
        soft: 'var(--ease-in-out-soft)',
        emphasized: 'var(--ease-emphasized)',
      },
      maxWidth: {
        container: 'var(--container)',
        'container-wide': 'var(--container-wide)',
        prose: 'var(--container-prose)',
      },
      spacing: {
        header: 'var(--header-height)',
      },
      animation: {
        'float-slow': 'float-slow 11s var(--ease-in-out-soft) infinite',
        drift: 'drift 26s var(--ease-in-out-soft) infinite',
        marquee: 'marquee var(--marquee-duration, 42s) linear infinite',
        'cue-bounce': 'cue-bounce 2.4s var(--ease-in-out-soft) infinite',
        'rise-in': 'rise-in var(--duration-slower) var(--ease-out-expo) both',
        'fade-in': 'fade-in var(--duration-slow) var(--ease-out-expo) both',
        'draw-line': 'draw-line 1.6s var(--ease-out-expo) both',
        'pulse-ring': 'pulse-ring 3.6s var(--ease-in-out-soft) infinite',
      },
      backgroundImage: {
        'sheen-primary': 'linear-gradient(120deg, rgb(var(--primary-rgb)), rgb(var(--accent-rgb)))',
      },
    },
  },
  plugins: [],
};

export default config;
