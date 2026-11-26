// (c) Bright Abuu. Haki zote zimehifadhiwa.
// Nembo ya jukwaa ("Tiketi + Ubao"): tiketi yenye meno chini. Chanzo kimoja cha umbo na rangi zake.
// Inatumiwa na src/app/_components/BrandMark.tsx na scripts/brand-icons.mjs (inayotengeneza public/brand/*).
// Zebra haitumii nembo hii. Rangi hapa ni za nembo tu; rangi za kurasa ziko src/styles/brand.css.
import type { Metadata } from "next";

/** Jina la jukwaa kwenye nembo. Jina la brand bado ni uamuzi wa Bright: likibadilika, badilisha hapa tu. */
export const BRAND_NAME = "restaurant";

export type BrandTone = "lt" | "dk";

/** Umbo la tiketi kwenye viewBox 34x34: juu ni mstatili, chini ni meno manne. */
export const LOGO_VIEWBOX = "0 0 34 34";
export const LOGO_TICKET_PATH = "M3 2 H31 V28 L27.5 32 L24 28 L20.5 32 L17 28 L13.5 32 L10 28 L6.5 32 L3 28 Z";

type LogoColors = { body: string; stripe: string; line1: string; line2: string };

/** Mwanga: tiketi nyeusi, mstari mwekundu juu. Giza: tiketi nyeupe, mstari wa kijani-limau. */
export const LOGO_COLORS: Record<BrandTone, LogoColors> = {
  lt: { body: "#151515", stripe: "#C2391B", line1: "#F2F1EC", line2: "#F2F1EC" },
  dk: { body: "#ECEFEA", stripe: "#C9F26B", line1: "#C9F26B", line2: "#0F1211" },
};

/** Ndani ya <svg>: sehemu nne za nembo, kwa rangi za tone husika. */
export function logoParts(tone: BrandTone): string {
  const c = LOGO_COLORS[tone];
  return [
    `<path d="${LOGO_TICKET_PATH}" fill="${c.body}"/>`,
    `<rect x="3" y="2" width="28" height="6" fill="${c.stripe}"/>`,
    `<rect x="8" y="13" width="18" height="2.6" rx="1.3" fill="${c.line1}"/>`,
    `<rect x="8" y="19" width="11" height="2.6" rx="1.3" fill="${c.line2}" opacity=".7"/>`,
  ].join("");
}

/** SVG kamili ya nembo (bila mandhari). */
export function logoSvg(tone: BrandTone, size = 34): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${LOGO_VIEWBOX}">${logoParts(tone)}</svg>`;
}

/** SVG ya ikoni ya programu (apple-icon, PWA): nembo katikati ya mandhari ya bg, nafasi ya 18% pembeni. */
export function appIconSvg(tone: BrandTone, size: number): string {
  const bg = tone === "lt" ? "#F2F1EC" : "#0F1211";
  const pad = 34 * 0.18;
  const box = 34 + pad * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-pad} ${-pad} ${box} ${box}">` +
    `<rect x="${-pad}" y="${-pad}" width="${box}" height="${box}" fill="${bg}"/>${logoParts(tone)}</svg>`
  );
}

/**
 * Ikoni za jukwaa kwa metadata ya Next. Tovuti ya masoko inazipata zenyewe ((marketing)/icon.svg).
 * Admin, Ingia na wahudumu waongeze `icons: BRAND_ICONS` kwenye metadata ya layout yao.
 * Usiziweke kwenye layout kuu: kurasa za mteja wa Zebra (Premium) hazipaswi kupata nembo ya jukwaa.
 */
export const BRAND_ICONS: NonNullable<Metadata["icons"]> = {
  icon: [{ url: "/brand/icon.svg", type: "image/svg+xml" }],
  apple: [{ url: "/brand/apple-icon.png", sizes: "180x180", type: "image/png" }],
};
