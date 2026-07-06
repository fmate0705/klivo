import Link from "next/link";
import {
  Phone,
  EnvelopeSimple,
  MapPin,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { contact } from "@/lib/site";

/**
 * Kapcsolati szekció — közvetlen elérhetőségek (e-mail, telefon).
 *
 * MEGJEGYZÉS: az online, űrlapos e-mail küldés jelenleg KI van kapcsolva
 * (lásd docs/decisions/0005-disable-email.md). Amíg nincs beállítva egy
 * levelező- vagy űrlapszolgáltatás, a látogatók közvetlenül e-mailben vagy
 * telefonon érnek el minket — így a weboldalnak nincs szüksége háttér-
 * szolgáltatásra, és semmi sem tudja "leállítani" a konténert emiatt.
 *
 * Az űrlapos változat megőrizve a
 * src/components/sections/ContactForm.tsx fájlban, később bármikor
 * visszakapcsolható. Ez a komponens szabadon, biztonságosan szerkeszthető.
 */
export default function ContactInfo() {
  return (
    <div className="contact__grid">
      <div className="contact__intro reveal">
        <h2 className="section-title">Írj nekünk</h2>
        <p className="section-lede">
          Mondd el pár sorban, mire van szükséged. E-mailben vagy telefonon is
          elérsz minket, és 24 órán belül visszajelzünk egy átlátható ajánlattal.
        </p>
        <ul className="contact__info">
          <li className="info-item">
            <span className="icon-chip icon-chip--sm">
              <EnvelopeSimple size={18} />
            </span>
            <span>
              <span className="info-item__label">E-mail</span>
              <a href={contact.emailHref}>{contact.email}</a>
            </span>
          </li>
          <li className="info-item">
            <span className="icon-chip icon-chip--sm">
              <Phone size={18} />
            </span>
            <span>
              <span className="info-item__label">Telefon</span>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </span>
          </li>
          <li className="info-item">
            <span className="icon-chip icon-chip--sm">
              <MapPin size={18} />
            </span>
            <span>
              <span className="info-item__label">Hol</span>
              <strong>{contact.areaServed}</strong>, online az egész országban
            </span>
          </li>
          <li className="info-item">
            <span className="icon-chip icon-chip--sm">
              <Clock size={18} />
            </span>
            <span>
              <span className="info-item__label">Elérhetőség</span>
              {contact.hours}
            </span>
          </li>
        </ul>
      </div>

      <div className="detail-card reveal">
        <h3>Kérj ingyenes ajánlatot</h3>
        <p>
          Írj egy e-mailt a projekted rövid leírásával: mire van szükséged és
          milyen határidővel. Semmire nem kötelez, és 24 órán belül válaszolunk.
        </p>
        <div className="contact__actions">
          <a className="btn btn--primary" href={contact.emailHref}>
            E-mail írása <ArrowRight size={18} weight="bold" />
          </a>
          <a className="btn btn--ghost" href={contact.phoneHref}>
            <Phone size={18} weight="bold" /> Hívj minket
          </a>
        </div>
        <p className="form__note">
          Az adataidat bizalmasan kezeljük, lásd az{" "}
          <Link href="/adatkezelesi-tajekoztato">Adatkezelési tájékoztatót</Link>.
        </p>
      </div>
    </div>
  );
}
