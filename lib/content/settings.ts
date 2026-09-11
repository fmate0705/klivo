/**
 * A megjelenési kapcsolók **alakja** — adattár nélkül.
 *
 * Az olvasás és az írás a `lib/store/site-settings.ts`-ben van; itt csak a
 * típus, az alapértelmezés és a tartomány él. A kettő azért válik szét, mert a
 * szerkesztő felület kliens komponens, az adattár viszont `revalidateTag`-et húz
 * be — ami csak szerveren létezik, és a build elszáll tőle. Ugyanez az oka
 * annak, hogy a `FAQ_PAGES` is `lib/content/` alatt van.
 */

export type SiteSettings = {
  /** A nyitóképernyő alatti partnersáv. */
  partners: {
    enabled: boolean;
  };
  /** A főoldali referencia szekció. */
  works: {
    enabled: boolean;
    /** Hány referencia fér bele. A rács kettes és hármas osztású. */
    count: number;
    /**
     * Mely referenciák, ebben a sorrendben. Üresen a kézi sorrend eleje áll be
     * — lásd `listWorksForHome`.
     */
    ids: string[];
  };
};

/** Alapértelmezés: mindkét szekció be van kapcsolva, három referenciával. */
export const DEFAULT_SETTINGS: SiteSettings = {
  partners: { enabled: true },
  works: { enabled: true, count: 3, ids: [] },
};

/** A főoldali szekcióba ennyi referencia fér. */
export const WORKS_COUNT_RANGE = { min: 1, max: 6 } as const;
