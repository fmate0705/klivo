/**
 * Strukturált adat beillesztése.
 *
 * A `JSON.stringify` kimenetében a `<` karakter zárhatná a script elemet, ha egy
 * adat véletlenül `</script>`-et tartalmaz — ezért cseréljük escape-elt
 * alakra. Ez nem elméleti: a bejegyzések szövege az adminból jön, tehát az
 * adat és a markup határa itt valódi határ.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
