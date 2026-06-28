import type { Metadata } from "next";
import ServiceDetail from "@/components/sections/ServiceDetail";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Egyedi weboldal és webalkalmazás fejlesztés",
  description:
    "Webshopok, foglalási és jegyrendszerek, AI-chatbot és teljes webalkalmazások admin felülettel. Egyedi árajánlat a feladat felmérése után.",
  path: "/egyedi-fejlesztes",
});

export default function Page() {
  return <ServiceDetail slug="egyedi-fejlesztes" />;
}
