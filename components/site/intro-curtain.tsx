import type { CSSProperties } from 'react';
import { LogoMark } from '@/components/site/logo';
import type { Tone } from '@/components/wave/wave-band';
import { WaveLayer } from '@/components/wave/wave-layer';

/**
 * A nyitó animáció.
 *
 * A képernyőt ugyanazok a hullámsávok fedik, amelyek az oldalon végigfutnak, és
 * egyenként húzódnak el felfelé — a legmélyebb tengerkéktől a világos
 * égszínkékig, 130 ezredmásodpercenként lépcsőzve. **Mindegyik sáv alja
 * hullám**, ugyanabból a formából, amiből a szekcióhatárok: a függöny nem egy
 * egyenes él, hanem víz, ami visszahúzódik. A jel előbb megjelenik és megáll
 * egy ütemre; a kaszkád csak 900 ms után indul, és 2,3 másodperc körül ér
 * véget. Ennyi idő alatt a nyitóképernyő képei megérkeznek, de a látogató még
 * nem vár. A leleplezés tehát maga is az oldal
 * formanyelvében történik, nem egy általános pörgő karika: mire az utolsó sáv
 * elhagyja a képernyőt, a látogató már látta, mi lesz az oldal nyelve.
 *
 * Szerver komponens, nulla kliensoldali JavaScripttel: hogy egyáltalán
 * lefusson-e, azt a `MotionBoot` fejlécszkript dönti el a `<html>` egy
 * adat-attribútumával, a mozgást pedig a CSS animáció végzi. Ha bármi elakad, a
 * függöny alapból rejtett — nem az a hibás állapot áll elő, hogy egy sötét lap
 * marad a tartalom fölött.
 */

/**
 * A sávok sötéttől világosig, és **ebben a sorrendben húzódnak el**.
 *
 * A legsötétebb van legfelül, az indul elsőként, alóla bukkan elő a következő,
 * és így tovább. A rétegsorrendnek egyeznie kell a késleltetéssel: ha a felső
 * réteg indulna utoljára, a kaszkádból semmi nem látszana — csak egy sötét lap
 * húzódna fel, mert a többi már mögötte, láthatatlanul lefutott volna.
 *
 * A záró réteg a legvilágosabb, és az emelkedik el a sötét nyitóképernyőről:
 * ez az utolsó, legnagyobb kontrasztú mozdulat.
 */
const LAYERS: {
  tone: Tone;
  crests: number;
  amplitude: number;
  phase: number;
  delay: number;
  duration: number;
}[] = [
  { tone: 'wave-9', crests: 0.9, amplitude: 0.4, phase: 0.1, delay: 900, duration: 900 },
  { tone: 'wave-7', crests: 1.4, amplitude: 0.34, phase: 0.55, delay: 1030, duration: 920 },
  { tone: 'wave-5', crests: 1, amplitude: 0.42, phase: 0.3, delay: 1160, duration: 950 },
  { tone: 'wave-3', crests: 1.8, amplitude: 0.28, phase: 0.75, delay: 1290, duration: 980 },
];

export function IntroCurtain() {
  return (
    <div className="intro" aria-hidden="true">
      {LAYERS.map((layer, index) => (
        <span
          key={layer.tone}
          className="intro__layer"
          style={
            {
              '--intro-delay': `${layer.delay}ms`,
              '--intro-duration': `${layer.duration}ms`,
              // Az elsőként induló réteg van legfelül.
              zIndex: LAYERS.length - index,
            } as CSSProperties
          }
        >
          {/* Ugyanaz a hullámforma, amiből a szekcióhatárok állnak — a
              függöny alja hullámzik, nem egy egyenes él húzódik el. */}
          <span className="intro__wave">
            <WaveLayer
              tone={layer.tone}
              top={0}
              crest="clamp(70px, 9vw, 170px)"
              crests={layer.crests}
              amplitude={layer.amplitude}
              phase={layer.phase}
              line={0.4}
              duration="9s"
              drift="4%"
            />
          </span>
        </span>
      ))}

      {/* A jel a legsötétebb sávon ül, ezért krémszínű — és mire az világosabb
          rétegre érne, már el is tűnt. */}
      <span className="intro__mark" style={{ zIndex: LAYERS.length + 1 } as CSSProperties}>
        <span className="flex items-center gap-3 text-on-dark">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-h3 font-bold tracking-tight">Klivo</span>
        </span>
      </span>
    </div>
  );
}
