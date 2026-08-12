/**
 * Egyetlen JSON-LD blokk beszúrása.
 *
 * A `JSON.stringify` kimenetéből a `<` karaktert Unicode escape-re cseréljük.
 * Enélkül egy adatból származó `</script>` sorozat lezárná a script elemet, és
 * onnantól a maradék tartalom végrehajtható markupként kerülne az oldalra — ez a
 * klasszikus JSON-LD alapú XSS. A csere érvényes JSON marad, tehát a keresők
 * ugyanazt olvassák.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      // A tartalom saját, sorosított adat — nem felhasználói HTML.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
