import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export default function LegalPage({
  title,
  lede,
  path,
  updated,
  children,
}: {
  title: string;
  lede?: string;
  path: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Főoldal", path: "/" },
          { name: title, path },
        ])}
      />

      <section className="subhero">
        <div className="subhero__aura" aria-hidden="true">
          <span className="wash" />
        </div>
        <div className="container">
          <nav className="breadcrumb" aria-label="Útvonal">
            <Link href="/">Főoldal</Link>
            <CaretRight size={14} />
            <span aria-current="page">{title}</span>
          </nav>
          <h1 className="subhero__title">{title}</h1>
          {lede && <p className="subhero__lede">{lede}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="prose">
            {updated && <p className="meta">Hatályos: {updated}</p>}
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
