import type { Metadata } from "next";
import ServiceDetail from "@/components/sections/ServiceDetail";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Weboldal készítés",
  description:
    "Professzionális weboldal készítés és honlapkészítés 100 000 Ft-tól: landing és bemutatkozó oldalak, fullstack megoldások, erős SEO-val és AI-láthatósággal.",
  path: "/weboldal-keszites",
});

export default function Page() {
  return <ServiceDetail slug="weboldal-keszites" />;
}
