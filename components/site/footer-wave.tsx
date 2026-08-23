import { WaveBand, type Tone } from '@/components/wave/section-divider';

/**
 * Átvezetés a láblécbe.
 *
 * Miért nem a láblécben ül? Mert a taraj felső színének a **fölötte lévő**
 * szekció felületét kell folytatnia, azt viszont a lábléc nem ismeri — a
 * elrendezés mindenhol ugyanazt a láblécet rendereli. Így az oldal mondja meg,
 * honnan jön a hullám, pontosan úgy, ahogy minden más szekciónál is.
 *
 * **Csak ott kell, ahol az utolsó szekció világos.** A záró felhívás és a
 * lábléc ugyanaz a kék felület, tehát a kettő között nincs mit átvezetni — ott
 * a hullám csak egy fölösleges vonal lenne a két azonos színű blokk között.
 */
export function FooterWave({ from = 'blue' }: { from?: Tone }) {
  return <WaveBand from={from} to="deep" layers={3} depth="md" />;
}
