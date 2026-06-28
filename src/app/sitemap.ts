import type { MetadataRoute } from "next";
import { site, services } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "",
    "/kapcsolat",
    "/impresszum",
    "/adatkezelesi-tajekoztato",
    "/aszf",
  ];
  const servicePaths = services.map((s) => `/${s.slug}`);

  return [...staticPaths, ...servicePaths].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "monthly" : "yearly",
    priority: path === "" ? 1 : path.startsWith("/impresszum") || path.startsWith("/aszf") || path.startsWith("/adatkezelesi") ? 0.3 : 0.8,
  }));
}
