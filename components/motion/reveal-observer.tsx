'use client';

import { useEffect } from 'react';

/**
 * Scroll reveal for the whole document, from one observer.
 *
 * Server components opt in by adding `data-reveal` (optionally with a
 * `--reveal-delay` custom property). This component finds them all and flips
 * `data-revealed="true"` as they enter the viewport; the transition itself is
 * pure CSS, declared once in `globals.css`.
 *
 * The design constraints that shaped this:
 *
 * - **One observer, not one per element.** A page has 60+ revealed elements;
 *   60 observers means 60 sets of callbacks competing on the same scroll.
 * - **No React state.** Nothing re-renders while scrolling. The observer
 *   mutates a DOM attribute and CSS does the rest, which keeps the work off
 *   the main thread's React path entirely.
 * - **Unobserve after revealing.** Elements animate once. Re-animating content
 *   the reader has already seen is noise, and it makes scrolling back up feel
 *   broken.
 * - **A MutationObserver for late arrivals.** Client-rendered content (filtered
 *   blog lists, admin tables) mounts after the first pass, and would otherwise
 *   stay invisible at `opacity: 0` forever — a silent, total content failure.
 */
export function RevealObserver() {
  useEffect(() => {
    const elements = () =>
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])');

    // Reduced motion: reveal everything immediately and never observe.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      elements().forEach((element) => element.setAttribute('data-revealed', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', 'true');
          observer.unobserve(entry.target);
        }
      },
      {
        // Start slightly before the element is fully on screen, and require a
        // sliver of it to be visible — otherwise tall sections trigger while
        // still entirely below the fold.
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.08,
      },
    );

    const observeAll = () => elements().forEach((element) => observer.observe(element));
    observeAll();

    // Anything above the fold on load should already be visible: waiting for a
    // scroll event that may never come would leave the hero blank.
    const revealAboveFold = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')
        .forEach((element) => {
          if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
            element.setAttribute('data-revealed', 'true');
            observer.unobserve(element);
          }
        });
    };
    revealAboveFold();

    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
