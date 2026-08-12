/**
 * One scroll listener for the entire page.
 *
 * Several components want to react to scroll position (the reading-flow
 * connectors, the hero parallax, the process timeline). Each registering its
 * own `scroll` listener would mean N listeners, N layout reads, and N chances
 * to trigger a synchronous reflow on the same frame.
 *
 * Instead every subscriber registers an element here. On each animation frame
 * after a scroll, the driver measures every registered element once, computes
 * its 0→1 progress through the viewport, and writes that value to a CSS custom
 * property on the element. Components then express their motion entirely in
 * CSS as a function of `--p`.
 *
 * Consequences that matter:
 * - No React state is involved, so scrolling never renders a component.
 * - All layout reads happen together, before any write, so the browser is never
 *   forced to flush layout mid-loop (layout thrashing).
 * - The listener detaches itself when the last subscriber leaves.
 */

type Entry = {
  element: HTMLElement;
  /** Custom property to write, e.g. `--p`. */
  property: string;
  /**
   * Where the 0→1 range starts and ends, as a fraction of viewport height
   * measured from the viewport bottom. `[0, 1]` means: 0 when the element's
   * top touches the bottom edge, 1 when it reaches the top edge.
   */
  range: [number, number];
};

const entries = new Set<Entry>();
let frame = 0;
let listening = false;

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function measure(): void {
  frame = 0;
  const viewport = window.innerHeight;
  if (viewport === 0) return;

  // Phase 1 — read. Collect every rect before touching the DOM.
  const readings: { entry: Entry; progress: number }[] = [];
  for (const entry of entries) {
    const rect = entry.element.getBoundingClientRect();
    const [start, end] = entry.range;

    const span = (end - start) * viewport + rect.height;
    const travelled = viewport - start * viewport - rect.top;
    readings.push({ entry, progress: span > 0 ? clamp01(travelled / span) : 0 });
  }

  // Phase 2 — write. No further layout is forced from here.
  for (const { entry, progress } of readings) {
    entry.element.style.setProperty(entry.property, progress.toFixed(4));
  }
}

function schedule(): void {
  if (frame) return;
  frame = requestAnimationFrame(measure);
}

function startListening(): void {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

function stopListening(): void {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

/**
 * Registers an element. Returns an unsubscribe function.
 *
 * Under `prefers-reduced-motion` the property is pinned to its end value and
 * nothing is observed — the layout still looks finished, it just does not move.
 */
export function observeScroll(
  element: HTMLElement,
  property = '--p',
  range: [number, number] = [0, 1],
): () => void {
  if (typeof window === 'undefined') return () => {};

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.style.setProperty(property, '1');
    return () => {};
  }

  const entry: Entry = { element, property, range };
  entries.add(entry);
  startListening();
  schedule();

  return () => {
    entries.delete(entry);
    if (entries.size === 0) stopListening();
  };
}
