import type { Config } from 'tailwindcss';

/**
 * A design system Tailwindra fordítva.
 *
 * Minden szín CSS custom propertyből jön (`app/globals.css`), RGB hármasként
 * tárolva, hogy a Tailwind alfa-módosítói (`bg-ink/70`) továbbra is működjenek.
 * Így a tokenek egyetlen helyen élnek, és a sötét szekciók ugyanazokat a
 * neveket használják, mint a világosak — nincs két párhuzamos színrendszer.
 *
 * Nincs `gradient` segédosztály és nincs lila árnyalat a palettában: mindkettő
 * kimondott tervezési döntés, és azzal tartjuk be, hogy nem is létezik hozzá
 * token.
 */

function withAlpha(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // A négy szekciófelület.
        white: withAlpha('--white'),
        sky: withAlpha('--sky'),
        blue: withAlpha('--blue'),
        deep: withAlpha('--deep'),
        paper: withAlpha('--paper'),
        surface: withAlpha('--surface'),
        // A hullámskála. Ritkán kell közvetlenül; a hullámkomponensek CSS
        // változóként hivatkoznak rá.
        'wave-1': withAlpha('--wave-1'),
        'wave-2': withAlpha('--wave-2'),
        'wave-3': withAlpha('--wave-3'),
        'wave-4': withAlpha('--wave-4'),
        'wave-5': withAlpha('--wave-5'),
        'wave-6': withAlpha('--wave-6'),
        'wave-7': withAlpha('--wave-7'),
        'wave-8': withAlpha('--wave-8'),
        'wave-9': withAlpha('--wave-9'),
        // Szöveg és keret.
        ink: withAlpha('--ink'),
        'ink-soft': withAlpha('--ink-soft'),
        muted: withAlpha('--muted'),
        'on-dark': withAlpha('--on-dark'),
        'on-dark-muted': withAlpha('--on-dark-muted'),
        line: withAlpha('--line'),
        'line-strong': withAlpha('--line-strong'),
        'line-dark': withAlpha('--line-dark'),
        // Állapotjelzés. Nem díszítés: csak visszajelzésre használjuk.
        success: withAlpha('--success'),
        warning: withAlpha('--warning'),
        danger: withAlpha('--danger'),
      },
      fontFamily: {
        // A változónevek a `app/fonts.ts`-ben dőlnek el.
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // A skála a CEF typography.policy-ból. A `display` és a `h1` a policy
        // fölé megy: a nyitóképernyő címsora az oldal leghangosabb eleme, és
        // 60 px-en nem viszi el a képernyőt. Lásd docs/DESIGN.md.
        //
        // A nagy fokozatok `clamp`-pel folyékonyak. Fix méreten a hosszú magyar
        // szavak (például „keresőoptimalizálásról”) 360 px-es nézeten
        // kilógnának a lapból — és ezt semmilyen sortörés nem javítja, mert egy
        // szó nem tud elférni.
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        body: ['1.0625rem', { lineHeight: '1.65' }],
        'body-lg': ['1.1875rem', { lineHeight: '1.6' }],
        h6: ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        h5: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        h4: ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        h3: ['clamp(1.625rem, 3.6vw, 2.25rem)', { lineHeight: '1.12', letterSpacing: '-0.03em' }],
        h2: ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        h1: ['clamp(2.5rem, 6.5vw, 4rem)', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        display: ['clamp(3rem, 9vw, 6rem)', { lineHeight: '0.92', letterSpacing: '-0.045em' }],
      },
      spacing: {
        // A 4px-es alapegység Tailwind-alapértelmezés; csak a szekció-ritmus
        // hiányzó lépéseit vesszük fel (spacing.policy).
        13: '3.25rem',
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        content: '80rem', // 1280px — layout.policy max_content_width
        wide: '90rem', // 1440px
        prose: '45rem', // 720px — ~65ch
      },
      borderRadius: {
        // Egyetlen lekerekítési rendszer. A `pill` a lebegő navigációé.
        card: '1.25rem',
        panel: '1.75rem',
        pill: '9999px',
      },
      boxShadow: {
        // Árnyék csak elemeléshez, soha díszítésnek. Három szint, nem több.
        raise: '0 1px 2px rgb(var(--shadow) / 0.05), 0 4px 16px rgb(var(--shadow) / 0.06)',
        float: '0 2px 6px rgb(var(--shadow) / 0.06), 0 12px 32px rgb(var(--shadow) / 0.10)',
        lift: '0 4px 12px rgb(var(--shadow) / 0.08), 0 24px 56px rgb(var(--shadow) / 0.14)',
      },
      transitionTimingFunction: {
        // A mozgás-skill görbéi. A beépített CSS easing-ek túl gyengék;
        // ezeken kívül más görbe nincs az oldalon.
        standard: 'var(--ease-out)',
        entrance: 'var(--ease-out)',
        exit: 'var(--ease-in-out)',
      },
      transitionDuration: {
        feedback: '140ms',
        ui: '200ms',
        panel: '300ms',
        page: '420ms',
      },
    },
  },
  plugins: [],
};

export default config;
