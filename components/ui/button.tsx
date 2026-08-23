import Link from 'next/link';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { WAVE_VIEWBOX, wavePath } from '@/lib/wave-path';

/**
 * Az oldal egyetlen gombja.
 *
 * Három változat, két hangnem, két méret — és semmi több. Minden elsődleges
 * cselekvés ugyanígy néz ki és ugyanúgy viselkedik, mert a látogatónak egyszer
 * kelljen megtanulnia, mi kattintható.
 *
 * A `tone="dark"` a sötét szekciókban használt párja ugyanennek a gombnak, nem
 * egy másik komponens: így egy hover-időzítés vagy egy sarokrádiusz
 * megváltoztatása egy helyen történik.
 *
 * **A vízhullám.** Nyugalmi állapotban a gomb tiszta: egyetlen felület,
 * felirat, semmi más. Rálebegésre egy valódi hullám úszik be alulról — mintha
 * víz gyűlne benne. Nem tölti fel: az alsó harmadig ér, és ennyi elég a
 * visszajelzéshez. Csak finom mutatóval, mert érintésre a hover hamisan sülne
 * el. A lenyomás egy hajszálnyi összenyomás: a gomb helye nem mozdul, tehát a
 * mutató nem csúszik le róla.
 */

const button = cva(
  [
    'group/button relative inline-flex items-center justify-center gap-2 overflow-hidden',
    'rounded-pill font-medium whitespace-nowrap',
    'transition-[background-color,border-color,color,transform,box-shadow] duration-feedback ease-standard',
    'active:scale-[0.985]',
    'disabled:pointer-events-none disabled:opacity-55',
  ],
  {
    variants: {
      variant: {
        primary: 'shadow-raise hover:shadow-float',
        secondary: 'border',
        ghost: 'border border-transparent',
        // Csak visszafordíthatatlan műveletre (törlés) az adminban.
        danger: 'border border-danger/40 text-danger hover:bg-danger/10',
      },
      tone: {
        light: '',
        dark: '',
      },
      size: {
        md: 'h-11 px-5 text-body-sm',
        lg: 'h-13 px-7 text-body',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        tone: 'light',
        class: 'bg-deep text-paper hover:bg-wave-8',
      },
      {
        // Sötét szekcióban megfordul: ott a krém a legnagyobb kontraszt.
        variant: 'primary',
        tone: 'dark',
        class: 'bg-paper text-ink hover:bg-surface',
      },
      {
        variant: 'secondary',
        tone: 'light',
        class: 'border-line-strong bg-surface text-ink hover:border-wave-6',
      },
      {
        // A háttér **tömör mély kék**, nem átlátszó. A nyitóképernyőn a gomb a
        // hullámmező fölött ül, és a világos tarajok elérnek odáig: átlátszó
        // háttérrel a fehér felirat egy világoskék hullámon 1,6:1 lenne. A záró
        // felhívás és a lábléc felülete amúgy is ugyanez a kék, tehát ott semmi
        // nem változik tőle.
        variant: 'secondary',
        tone: 'dark',
        class: 'border-on-dark/35 bg-deep text-on-dark hover:border-on-dark hover:bg-wave-8',
      },
      {
        variant: 'ghost',
        tone: 'light',
        class: 'text-ink hover:border-line-strong hover:bg-surface',
      },
      {
        variant: 'ghost',
        tone: 'dark',
        class: 'text-on-dark hover:border-line-dark',
      },
    ],
    defaultVariants: { variant: 'primary', tone: 'light', size: 'md' },
  },
);

type ButtonVariants = VariantProps<typeof button>;

/**
 * A jobbra mutató nyíl a hover irányát erősíti: „ez tovább visz”.
 * Dekoráció, ezért a képernyőolvasó elől el van rejtve.
 */
function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4 transition-transform duration-feedback ease-standard group-hover/button:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8h11M9.5 4l4 4-4 4" />
    </svg>
  );
}

/**
 * A gomb vize — **három réteg**, mint a szekcióhatárokon.
 *
 * Egyetlen hullám lapos folt lenne. Három, egymás fölé csúszó réteg, más-más
 * hullámhosszal és fázissal, ugyanazt a rétegzett hatást adja kicsiben, amit a
 * szekcióhatárok nagyban — és a gomb így ugyanannak a rendszernek a része,
 * nem egy külön effekt.
 *
 * A hullámhossz **hosszú**: egy gombnyi szélességen egy-két hegy fér el. Több
 * hegytől fodrozódás lesz, nem hullám.
 *
 * A rétegek **kékek**, nem a gomb szövegszínéből származnak: a fehér gombon is
 * kék víz folyik be, ugyanabból a skálából, amiből az oldal többi hulláma. A
 * három réteg egymás után, 60 ezredmásodperces lépcsőzéssel érkezik — így nem
 * egy tömb csúszik föl, hanem *befolyik*.
 */
const BUTTON_WAVES = [
  { top: 44, tone: 'wave-5', alpha: 0.5, crests: 1.1, amplitude: 0.44, phase: 0.15, delay: 0 },
  { top: 60, tone: 'wave-6', alpha: 0.55, crests: 1.5, amplitude: 0.38, phase: 0.62, delay: 60 },
  { top: 76, tone: 'wave-7', alpha: 0.6, crests: 2, amplitude: 0.3, phase: 0.34, delay: 120 },
];

function ButtonWave() {
  return (
    <span aria-hidden="true" className="btn-wave">
      {BUTTON_WAVES.map((wave, index) => (
        <span
          key={index}
          className="btn-wave__layer"
          style={
            {
              top: `${wave.top}%`,
              '--layer-opacity': wave.alpha,
              color: `rgb(var(--${wave.tone}))`,
              '--layer-delay': `${wave.delay}ms`,
            } as CSSProperties
          }
        >
          <svg
            className="btn-wave__crest"
            viewBox={WAVE_VIEWBOX}
            preserveAspectRatio="none"
            focusable="false"
          >
            <path
              d={wavePath({
                crests: wave.crests,
                amplitude: wave.amplitude,
                phase: wave.phase,
                skew: 0.2,
                fill: 'down',
              })}
              fill="currentColor"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}

type CommonProps = ButtonVariants & {
  className?: string;
  children: ReactNode;
  /** Nyíl a felirat után. Csak továbbvivő cselekvésen. */
  arrow?: boolean;
};

export function ButtonLink({
  href,
  variant,
  tone,
  size,
  className,
  arrow = false,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  return (
    <Link href={href} className={cn(button({ variant, tone, size }), className)} {...rest}>
      <ButtonWave />
      <span className="relative inline-flex items-center gap-2">
        {children}
        {arrow ? <Arrow /> : null}
      </span>
    </Link>
  );
}

export function Button({
  variant,
  tone,
  size,
  className,
  arrow = false,
  children,
  type = 'button',
  ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button type={type} className={cn(button({ variant, tone, size }), className)} {...rest}>
      <ButtonWave />
      <span className="relative inline-flex items-center gap-2">
        {children}
        {arrow ? <Arrow /> : null}
      </span>
    </button>
  );
}
