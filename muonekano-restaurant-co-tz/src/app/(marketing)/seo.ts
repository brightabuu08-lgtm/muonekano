// © Bright Abuu. Haki zote zimehifadhiwa.
// SEO ya tovuti ya masoko mahali pamoja: asili ya tovuti (domain), metadata, hreflang, robots na sitemap.
// Hakuna domain mpya hapa: inasomwa kutoka site-config.ts, au NEXT_PUBLIC_SITE_URL ikiwekwa (mfano kwenye staging).
// Kurasa za mgahawa (/[slug]), /admin na /staff haziko kwenye sitemap ya masoko.
import type { Metadata, MetadataRoute } from "next";
import { translate, type Lang } from "@/lib/i18n";
import { copy, keywordsSw, metaEn } from "./copy";
import { isFilled, siteConfig, siteUrl, type SiteConfig } from "./site-config";

/** Njia ya ukurasa mkuu kwa kila lugha: "/" ni Kiingereza (lugha kuu), "/sw" ni Kiswahili. */
export const LANG_PATHS: Readonly<Record<Lang, string>> = { en: "/", sw: "/sw" };

/** Kurasa za masoko tu (njia za ndani). Ukurasa wa mfano /zebra na /[slug] nyingine haziwekwi hapa. */
export const MARKETING_PATHS = [LANG_PATHS.en, LANG_PATHS.sw] as const;

/** Njia ambazo roboti za utafutaji hazitakiwi kuzifikia: admin, wafanyakazi (pia ndani ya /<slug>) na API. */
export const BLOCKED_PATHS = ["/admin", "/staff", "/*/admin", "/*/staff", "/api/"] as const;

/** Lugha ya Open Graph kwa kila lugha ya ukurasa. */
const OG_LOCALE: Readonly<Record<Lang, string>> = { sw: "sw_TZ", en: "en_US" };

/**
 * Asili ya tovuti (https://domain, bila njia). Kipaumbele: NEXT_PUBLIC_SITE_URL ikiwa ni URL halali ya http(s);
 * vinginevyo domain ya site-config. Thamani mbovu haivunji ujenzi: inarudi kwenye site-config.
 */
export function resolveOrigin(envValue: string | undefined, config: SiteConfig = siteConfig): string {
  const raw = (envValue ?? "").trim();
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.protocol === "https:" || u.protocol === "http:") return u.origin;
    } catch {
      // thamani si URL: tumia site-config
    }
  }
  return siteUrl(config);
}

/** Asili ya tovuti ya sasa, kutoka kwenye mazingira ya seva. */
export function siteOrigin(): string {
  return resolveOrigin(process.env.NEXT_PUBLIC_SITE_URL);
}

/** Jina la chapa kwa matumizi ya hadharani, au null ikiwa bado ni nafasi ya kujazwa (haitoki kwenye title wala OG). */
export function publicBrand(config: SiteConfig = siteConfig): string | null {
  return isFilled(config.brandName) ? config.brandName.trim() : null;
}

export function marketingTitle(config: SiteConfig = siteConfig, lang: Lang = "en"): string {
  const brand = publicBrand(config);
  const suffix = translate(lang, copy.meta.titleSuffix);
  return brand ? `${brand} | ${suffix}` : suffix;
}

/**
 * hreflang ya kweli: kila lugha ina anwani yake ("/" Kiingereza na "/sw" Kiswahili) na kila ukurasa unazitaja zote mbili,
 * pamoja na x-default (Kiingereza). Njia ni za ndani: metadataBase inazifanya URL kamili.
 */
export function hreflangPaths(): Record<string, string> {
  return { en: LANG_PATHS.en, sw: LANG_PATHS.sw, "x-default": LANG_PATHS.en };
}

/**
 * Metadata ya ukurasa mkuu kwa lugha moja. Canonical ni anwani ya ukurasa huo wenyewe (si ya lugha nyingine).
 * Picha ya OG na twitter inatoka kwenye opengraph-image.tsx (kanuni ya faili ya Next): "/" na /sw kila moja ina yake.
 */
export function marketingMetadata(origin: string = siteOrigin(), config: SiteConfig = siteConfig, lang: Lang = "en"): Metadata {
  const title = marketingTitle(config, lang);
  const description = translate(lang, copy.meta.description);
  const siteName = publicBrand(config) ?? undefined;
  const path = LANG_PATHS[lang];
  const other: Lang = lang === "sw" ? "en" : "sw";
  return {
    metadataBase: new URL(origin),
    title,
    description,
    keywords: lang === "en" ? [...metaEn.keywords] : [...keywordsSw, ...metaEn.keywords],
    alternates: { canonical: path, languages: hreflangPaths() },
    openGraph: {
      type: "website",
      url: path,
      siteName,
      title,
      description,
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[other]],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function buildRobots(origin: string = siteOrigin()): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [...BLOCKED_PATHS] }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

export function buildSitemap(origin: string = siteOrigin()): MetadataRoute.Sitemap {
  const abs = (path: string) => (path === "/" ? `${origin}/` : `${origin}${path}`);
  // Kila anwani inataja zote (pamoja na yenyewe), kama Google inavyotaka kwa hreflang kwenye sitemap.
  const languages = Object.fromEntries(Object.entries(hreflangPaths()).map(([code, path]) => [code, abs(path)]));
  return MARKETING_PATHS.map((path) => ({
    url: abs(path),
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: { languages },
  }));
}
