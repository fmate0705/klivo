import { cn } from '@/lib/cn';

/**
 * Hullámvonal — a márkajel hulláma, elválasztóként.
 *
 * Ott áll, ahol egy sima vonal lenne: a kártyacímek alatt, a folyamat
 * blokkjainál, a kapcsolat oldal panelein. Ugyanaz a görbe, amiből a logó jele
 * áll — így az apró elválasztó is a márkát erősíti, nem csak kitölt.
 *
 * **A doboz teljes szélességét kitölti.** A minta `userSpaceOnUse`
 * koordinátákban ismétlődik, tehát a hullámhossz mindenhol ugyanaz, és
 * szélesebb kártyán egyszerűen több hegy fér ki. Nyújtott \`viewBox\`-szal a
 * hullám kártyánként más magasságú lenne — az pedig három különböző elválasztót
 * jelentene ugyanabban a rácsban.
 *
 * Ez az egy elem vonalrajz és nem CSS-forma: a szekcióhatárok nagy hullámai
 * tömör felületek, ott a kitöltés a helyes eszköz, itt viszont egy két pixel
 * vastag *vonalra* van szükség.
 *
 * Ha `group` osztályú szülőben ül, rálebegésre elcsúszik: a hullám átfut rajta.
 * A csúszás `transform`, tehát a mellette álló szöveg nem mozdul el tőle.
 *
 * Az azonosító **állandó**: minden példány ugyanazt a mintát rajzolja, tehát
 * nem kell egyedivé tenni — és így a komponens szerver komponens maradhat.
 */
const PATTERN_ID = 'klivo-wave-rule';

export function WaveRule({
  tone = 'strong',
  className,
}: {
  /** `strong` a tinta, `soft` a visszafogott tónus. */
  tone?: 'strong' | 'soft';
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'wave-rule block h-3 w-full overflow-hidden',
        tone === 'strong' ? 'text-ink' : 'text-line-strong',
        className,
      )}
    >
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-3 w-full transition-transform duration-panel ease-standard group-hover:translate-x-1.5 group-focus-within:translate-x-1.5"
      >
        <defs>
          <pattern id={PATTERN_ID} width="42" height="12" patternUnits="userSpaceOnUse">
            {/* Pontosan egy periódus (42 egység), és mindkét irányban túlnyúlik
                a csempén: a szomszédos csempék így ugyanabban a magasságban és
                ugyanazzal az érintővel találkoznak — nem törik meg a hullám. */}
            <path d="M-10.5 2s5.25 6 10.5 6 5.25-6 10.5-6 5.25 6 10.5 6 5.25-6 10.5-6 5.25 6 10.5 6 5.25-6 10.5-6" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="12" fill={`url(#${PATTERN_ID})`} stroke="none" />
      </svg>
    </span>
  );
}
