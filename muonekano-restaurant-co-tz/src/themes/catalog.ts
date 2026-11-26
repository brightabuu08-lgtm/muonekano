// © Bright Abuu. Haki zote zimehifadhiwa.
// Orodha ya miundo kwa skrini ya "chagua muonekano" (admin). Kazi safi (bila React) ili ijaribiwe kwa urahisi.
// Muonekano mpya: uongeze hapa pamoja na THEME_KEYS (resolve.ts) na THEMES (index.ts).
import { THEME_KEYS, type Plan, type ThemeKey } from "./resolve";

export type ThemeInfo = {
  key: ThemeKey;
  /** Kifurushi kinachoruhusiwa kuuchagua. */
  plan: Plan;
  name: string;
  blurb: string;
  /** Rangi tatu za kijipicha: mandharinyuma, maandishi/kadi, mapambo. */
  swatch: readonly [string, string, string];
  /** Muonekano uliotengenezwa kwa mgahawa mmoja (nembo na mawasiliano yake yamo ndani): slug ya mgahawa huo. */
  onlyFor?: string;
};

export const THEME_CATALOG: readonly ThemeInfo[] = [
  { key: "default", plan: "standard", name: "Kawaida", blurb: "Safi na rahisi, kwa rangi kuu ya mgahawa wako.", swatch: ["#faf9f6", "#1f2937", "#c8402a"] },
  { key: "zebra", plan: "premium", name: "Zebra", blurb: "Giza lenye ngozi ya pundamilia na kadi za pembe za ndovu.", swatch: ["#12100e", "#f4efe6", "#b8261f"], onlyFor: "zebra" },
  { key: "nino", plan: "premium", name: "Nino", blurb: "Mwanga wenye kijani cha limau, utafutaji na kadi mbili kwa safu.", swatch: ["#f6f7f4", "#111315", "#84bd22"] },
];

export function themesOfPlan(plan: Plan): ThemeInfo[] {
  return THEME_CATALOG.filter((t) => t.plan === plan);
}

/**
 * Je, mgahawa huu unaweza kuchagua muonekano huu? Kila mgahawa unachagua miundo ya Standard; Premium pia inachagua ya
 * Premium. Muonekano wa mgahawa mmoja ni wa mgahawa huo tu. (Inalingana na resolveTheme.)
 */
export function canChooseTheme(info: ThemeInfo, plan: Plan, slug: string): boolean {
  if (info.plan === "premium" && plan !== "premium") return false;
  return !info.onlyFor || info.onlyFor === slug;
}

/** Ujumbe wa kosa la `admin_set_theme` kwa mtumiaji (maneno ya Kiswahili; yanapita kwenye t()). */
export function themeErrorMessage(raw: string | null | undefined): string {
  const m = raw ?? "";
  if (m.includes("premium_only")) return "Kuchagua muonekano ni kwa Premium tu.";
  if (m.includes("not_allowed")) return "Mmiliki wa mgahawa pekee ndiye anayeweza kubadilisha muonekano.";
  return "Imeshindwa kubadilisha muonekano. Jaribu tena.";
}

/** Ufunguo wa muonekano wa mfano kutoka `?muonekano=`; chochote kisichojulikana → null. */
export function previewKey(raw: string | string[] | undefined): ThemeKey | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && (THEME_KEYS as readonly string[]).includes(v) ? (v as ThemeKey) : null;
}
