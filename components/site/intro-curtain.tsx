import { LogoMark } from '@/components/site/logo';
import { WaveCurls } from '@/components/wave/wave-curls';
import { WAVE_VIEWBOX, wavePath } from '@/lib/wave-path';

/**
 * A nyitó animáció.
 *
 * A képernyőt **ugyanaz a hullámfelület** fedi, mint a nyitóképernyőt: az
 * örvénylő taréjok (`WaveCurls`), középen a márkajellel. A leleplezés tehát maga
 * is az oldal formanyelvében történik, nem egy általános pörgő karika — mire a
 * függöny elhúzódik, a látogató már látta, mi lesz az oldal nyelve.
 *
 * **Él, amíg tart.** A hullámok lassan ráközelítenek. Mutatókövetés itt nincs:
 * a függöny három másodpercig él, és a követés három további, teljes képernyős
 * compositor-réteget tartana életben az egész munkamenetre. Három másodperc után az
 * egész lap fölfelé húzódik, és az alsó éle **hullám**, nem egyenes vonal — a
 * felület alján ülő vízvonal folytatódik lefelé egy hullámos szoknyában.
 *
 * Szerver komponens, nulla kliensoldali JavaScripttel: hogy egyáltalán
 * lefusson-e, azt a `MotionBoot` fejlécszkript dönti el a `<html>` egy
 * adat-attribútumával, a mozgást pedig CSS animáció végzi. Ha bármi elakad, a
 * függöny alapból rejtett — nem az a hibás állapot áll elő, hogy egy kék lap
 * marad a tartalom fölött.
 */
export function IntroCurtain() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__sheet">
        <WaveCurls sparse waterline />

        {/* A függöny hullámos alsó éle: a vízvonal folytatása lefelé. Enélkül
            a leleplezés egy egyenes vonal mentén történne. */}
        <span className="intro__skirt">
          <svg
            className="intro__skirt-wave"
            viewBox={WAVE_VIEWBOX}
            preserveAspectRatio="none"
            focusable="false"
          >
            <path
              d={wavePath({ crests: 1.2, amplitude: 0.34, phase: 0.3, skew: 0.4, fill: 'up' })}
              fill="currentColor"
            />
          </svg>
        </span>

        <span className="intro__mark">
          <span className="flex items-center gap-3 text-on-dark">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-h3 font-bold tracking-tight">Klivo</span>
          </span>
        </span>
      </div>
    </div>
  );
}
