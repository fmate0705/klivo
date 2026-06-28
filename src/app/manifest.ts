import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Klivo Webügynökség",
    short_name: "Klivo",
    description: site.description,
    lang: "hu",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FBFBFD",
    theme_color: "#FBFBFD",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
