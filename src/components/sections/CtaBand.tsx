import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { primaryCta } from "@/lib/site";

export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container cta-band__inner reveal">
        <div>
          <h2 className="cta-band__title">Készen állsz, hogy megtaláljanak?</h2>
          <p className="cta-band__text">
            Kérj ingyenes, kötöttség nélküli konzultációt. 24 órán belül
            válaszolunk.
          </p>
        </div>
        <Link href={primaryCta.href} className="btn btn--light btn--lg">
          {primaryCta.label}
          <ArrowRight size={18} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
