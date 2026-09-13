'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import {
  CONSENT_CHANGED_EVENT,
  readConsent,
  type ConsentChoice,
} from '@/components/site/cookie-consent';

/**
 * Látogatómérés (Google Analytics) — **kizárólag hozzájárulás után**.
 *
 * **Miért nem elég a mérőkódot betenni a fejlécbe.** A GA nem működéshez
 * szükséges: sütit tesz a látogató eszközére, és az adatot harmadik félhez
 * továbbítja. Az EU-ban ehhez **előzetes** hozzájárulás kell — nem elég utólag
 * kikapcsolhatóvá tenni. Ez a komponens ezért nem tölt be semmit addig, amíg a
 * látogató nem mondta ki, hogy elfogadja; elutasításnál a googletagmanager.com
 * felé **egyetlen kérés sem** indul.
 *
 * **Miért nem `NEXT_PUBLIC_` a mérőazonosító.** A `NEXT_PUBLIC_` előtagú
 * változókat a build süti a kliens csomagba, a `.env` viszont szándékosan nincs
 * a Docker build kontextusában — az azonosító tehát üres lenne, és a mérés
 * némán nem indulna el. Így a szerver olvassa futásidőben, és propként adja át;
 * a `.env` átírása után elég a konténert újraindítani.
 *
 * **Nincs mérés azonosító nélkül.** Ha a `GA_MEASUREMENT_ID` nincs kitöltve, a
 * komponens nem rajzol semmit — a fejlesztői gépen és egy próbakörnyezetben
 * tehát magától néma marad.
 */
export function Analytics({ id }: { id: string }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    setChoice(readConsent());

    // A buborék eseménye: elfogadásra a mérés azonnal elindul, újratöltés
    // nélkül. A süti tájékoztató „visszavonás" gombja ugyanezt használja.
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ConsentChoice>).detail;
      setChoice(detail ?? readConsent());
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, []);

  if (!id || choice !== 'accepted') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
