// © Bright Abuu. Haki zote zimehifadhiwa.
// Picha ya Open Graph (1200x630) ya ukurasa mkuu wa masoko, kwa lugha moja, kwa brand "Tiketi + Ubao" (mwanga).
// Imechorwa kwa maumbo na maandishi tu: hakuna nembo za watu wengine (wala ya Zebra), hakuna picha za nje.
// Nembo ni <BrandMark tone="lt" /> na jina ni BRAND_NAME (src/lib/brand.ts). Rangi zinatoka LOGO_COLORS.lt:
// ImageResponse haisomi var(--...) za brand.css, kwa hiyo hatunakili hex; tunatumia rangi za nembo (line1 = bg, body = fg, stripe = nyanya).
// Fonti ni ya kawaida ya ImageResponse (Funnel haijapakiwa hapa), kwa hiyo mwonekano wa herufi si ule wa tovuti.
// opengraph-image.tsx ("/") na en/opengraph-image.tsx ("/en") zinaita hii; `alt`, `size` na `contentType` lazima ziwe kwenye faili hizo.
import { ImageResponse } from "next/og";
import { BrandMark } from "@/app/_components/BrandMark";
import { BRAND_NAME, LOGO_COLORS } from "@/lib/brand";
import { translate, type Lang } from "@/lib/i18n";
import { copy } from "./copy";
import { siteOrigin } from "./seo";
import { siteConfig } from "./site-config";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const { line1: BG, body: FG } = LOGO_COLORS.lt;

export function renderOgImage(lang: Lang): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <BrandMark tone="lt" size={72} />
          <div style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2, display: "flex" }}>{BRAND_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, display: "flex" }}>{translate(lang, copy.hero.title)}</div>
          <div style={{ fontSize: 32, lineHeight: 1.35, opacity: 0.62, display: "flex" }}>{translate(lang, copy.meta.titleSuffix)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", borderTop: `3px dashed ${FG}`, opacity: 0.3 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
            <div style={{ display: "flex", opacity: 0.62 }}>{siteConfig.cities.join("  ·  ")}</div>
            <div style={{ display: "flex", fontWeight: 700 }}>{new URL(siteOrigin()).host}</div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
