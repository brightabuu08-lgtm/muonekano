// © Bright Abuu. Haki zote zimehifadhiwa.
// Mipangilio YOTE ya tovuti ya masoko mahali pamoja: jina la chapa, bei, WhatsApp, email, mitandao ya kijamii, domain na mfano.
// Thamani zinazoanza na "[" ni nafasi za kujazwa (placeholder). Kila nafasi ikijazwa, tovuti inaanza kuitumia yenyewe.

/** Maandishi yanayotegemea lugha: Kiswahili kwa "/" na Kiingereza kwa "/en". Funguo ni zilezile za `Lang`. */
export type Localized = { sw: string; en: string };
export type Plan = { name: string; price: string; period: Localized };
export type Social = { id: "instagram" | "tiktok"; label: string; url: string };

export type SiteConfig = {
  /** Jina la chapa (linaonekana kwenye kichwa, footer na ujumbe wa WhatsApp). */
  brandName: string;
  /** Domain ya jukwaa, bila https:// (mfano restaurant.co.tz). Bado haijanunuliwa. */
  domain: string;
  /** Slug ya mgahawa wa mfano: /zebra. */
  demoSlug: string;
  /** Namba ya WhatsApp ya kupokea maombi: tarakimu tu pamoja na nchi, mfano 255712345678. */
  whatsappNumber: string;
  /** Email ya kupokea maombi (mbadala wa WhatsApp). */
  email: string;
  /** Muda wa kuweka mfumo wa mgahawa, kwa maneno, kwa lugha zote mbili (mfano sw "siku 3 hadi 7", en "3 to 7 days"). */
  setupTime: Localized;
  social: Social[];
  plans: { standard: Plan; premium: Plan };
  /** Miji inayotajwa kwenye maelezo ya ukurasa (SEO) na kwenye fomu. */
  cities: string[];
  copyright: string;
  /** Mstari wa haki miliki kwa Kiingereza (ukurasa wa /en). Tafsiri ya `copyright`. */
  copyrightEn: string;
};

export const siteConfig: SiteConfig = {
  brandName: "Restaurant",
  domain: "restaurant.co.tz",
  demoSlug: "zebra",
  whatsappNumber: "255694454479",
  email: "info@restaurant.co.tz",
  setupTime: { sw: "siku 3 hadi 7", en: "3 to 7 days" },
  social: [
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/iam_b.r.y.t" },
    { id: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@iam_b.r.y.t" },
  ],
  plans: {
    standard: { name: "Standard", price: "TZS 30,000", period: { sw: "kwa mwezi", en: "per month" } },
    premium: { name: "Premium", price: "TZS 60,000", period: { sw: "kwa mwezi", en: "per month" } },
  },
  cities: ["Dar es Salaam", "Arusha", "Zanzibar", "Mwanza"],
  copyright: "© Bright Abuu. Haki zote zimehifadhiwa.",
  copyrightEn: "© Bright Abuu. All rights reserved.",
};

/** Thamani imejazwa (si tupu na si placeholder ya "[...]"). */
export function isFilled(value: string): boolean {
  const v = value.trim();
  return v !== "" && !v.startsWith("[");
}

/** Anwani ya mfano: /zebra. */
export function demoPath(config: SiteConfig = siteConfig): string {
  return `/${config.demoSlug}`;
}

/** URL kamili ya tovuti (kwa metadata). */
export function siteUrl(config: SiteConfig = siteConfig): string {
  return `https://${config.domain}`;
}

/** Namba ya WhatsApp kama tarakimu tu (9 hadi 15), au null kama bado haijawekwa au si sahihi. */
export function whatsappDigits(config: SiteConfig = siteConfig): string | null {
  if (!isFilled(config.whatsappNumber)) return null;
  const digits = config.whatsappNumber.replace(/[\s\-+()]/g, "");
  return /^[0-9]{9,15}$/.test(digits) ? digits : null;
}

/** Nafasi zote ambazo bado hazijajazwa, kwa orodha ya ukaguzi. */
export function unfilledPlaceholders(config: SiteConfig = siteConfig): string[] {
  const all: string[] = [
    config.brandName,
    config.whatsappNumber,
    config.email,
    config.setupTime.sw,
    config.setupTime.en,
    config.plans.standard.price,
    config.plans.standard.period.sw,
    config.plans.standard.period.en,
    config.plans.premium.price,
    config.plans.premium.period.sw,
    config.plans.premium.period.en,
    ...config.social.map((s) => s.url),
  ];
  return all.filter((v) => !isFilled(v));
}
