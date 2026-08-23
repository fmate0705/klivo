import { cn } from '@/lib/cn';

/**
 * Görgetésre hívó jel.
 *
 * Egy egér körvonala, benne egy ponttal, amely lassan lefelé csúszik és
 * elhalványul — utánozza magát a mozdulatot, amit kér. A felirat mellette
 * marad: az ikon egyedül csak egy alakzat lenne, a szöveg egyedül pedig nem
 * mutatja meg, mit kell csinálni.
 *
 * A képernyőolvasó elől el van rejtve. Nem funkció, hanem jelzés — a görgetés
 * enélkül is megy, és a látássérült látogatónak nincs mit „követnie”.
 */
export function ScrollCue({ label, className }: { label: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('flex items-center gap-3', className)}>
      <span className="text-soft text-body-sm">{label}</span>

      <svg
        viewBox="0 0 20 32"
        className="h-7 w-[1.125rem] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="1" y="1" width="18" height="30" rx="9" className="opacity-45" />
        <circle
          cx="10"
          cy="9"
          r="1.8"
          fill="currentColor"
          stroke="none"
          className="scroll-cue__dot"
        />
      </svg>
    </span>
  );
}
