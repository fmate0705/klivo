import type { Metadata } from "next";
import ServiceDetail from "@/components/sections/ServiceDetail";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tárhely és üzemeltetés",
  description:
    "Megbízható tárhely 20 000 Ft / hó-tól. Külsős oldalakat is átveszünk 25 000 Ft-tól, a módosításokat pedig óradíjban végezzük.",
  path: "/tarhely",
});

export default function Page() {
  return <ServiceDetail slug="tarhely" />;
}
