import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Statikusan, build időben generált 1200×630 PNG OG-kép (a régi SVG helyett,
// mert a közösségi platformok a PNG-t megbízhatóan jelenítik meg).
export const dynamic = "force-static";
export const alt =
  "Klivo — weboldal készítés erős SEO-val és AI-láthatósággal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(
  process.cwd(),
  "node_modules/geist/dist/fonts/geist-sans"
);
const geistRegular = readFileSync(join(fontsDir, "Geist-Regular.ttf"));
const geistBold = readFileSync(join(fontsDir, "Geist-Bold.ttf"));

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #FFFFFF 0%, #EEF1FF 100%)",
          padding: "72px 80px",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 17,
              background: "linear-gradient(135deg, #5B6BFF, #7C4DFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#0E0F14" }}>
            Klivo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#0E0F14",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Weboldalak, amelyeket
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#3B5BFF",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            megtalálnak.
          </div>
          <div style={{ fontSize: 30, color: "#3A3D49", marginTop: 28 }}>
            Professzionális weboldal készítés erős SEO-val és AI-láthatósággal.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 24,
            fontWeight: 600,
            color: "#3B5BFF",
          }}
        >
          <div>Weboldal 100 000 Ft-tól</div>
          <div style={{ color: "#9AA0B4" }}>·</div>
          <div>SEO + AI SEO</div>
          <div style={{ color: "#9AA0B4" }}>·</div>
          <div>Tárhely</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistBold, weight: 700, style: "normal" },
      ],
    }
  );
}
