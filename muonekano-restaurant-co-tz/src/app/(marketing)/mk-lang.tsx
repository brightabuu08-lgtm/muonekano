"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Lugha ya tovuti ya masoko: URL ndiyo inayoamua ("/" = Kiingereza, lugha kuu; "/sw" = Kiswahili), na HTML ya seva inakuja na lugha hiyo.
// Ni safu juu ya Lang.tsx ya pamoja (hatuigusi, inatumiwa na menyu, admin na staff): tafsiri ni translate() ileile,
// kitufe ni kilekile (.lang-toggle), na chaguo linahifadhiwa kwa setLang() ile ile ili /zebra lifuate.
// Vipengele vya masoko vinaingiza Tr, useT, useLang na LangSwitch kutoka hapa, si kutoka @/app/_components (jaribio linakagua).
import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setLang, useLang as useStoredLang } from "@/app/_components/Lang";
import { translate, type Lang } from "@/lib/i18n";
import type { Localized } from "./site-config";

/** Njia ya ukurasa mkuu kwa kila lugha. */
export const LANG_HOME: Record<Lang, string> = { en: "/", sw: "/sw" };

const PageLang = createContext<Lang>("en");

// Mgeni mwenye SW iliyohifadhiwa anapelekwa /sw mara moja tu kwa kila kichupo; kitufe kikibonyezwa tunaweka alama pia.
// Bila alama hii, kitufe cha "nyuma" kutoka /sw kingerudisha mgeni kwenye /sw milele.
const HANDLED_KEY = "mk-lang-handled";

function isHandled(): boolean {
  try {
    return window.sessionStorage.getItem(HANDLED_KEY) === "1";
  } catch {
    return true; // hifadhi imezuiwa: hatupeleki popote
  }
}

function markHandled(): void {
  try {
    window.sessionStorage.setItem(HANDLED_KEY, "1");
  } catch {
    /* hifadhi imezuiwa */
  }
}

/** Inaweka lugha ya ukurasa huu kwa vipengele vyote vilivyo ndani yake (pia wakati wa kuchora kwenye seva). */
export function MkLang({ lang, children }: { lang: Lang; children: ReactNode }) {
  const stored = useStoredLang();
  const router = useRouter();

  // /sw ndiyo ishara kwamba mgeni anasoma Kiswahili: /zebra na kurasa nyingine zinafuata.
  useEffect(() => {
    if (lang === "sw") setLang("sw");
  }, [lang]);

  // <html lang> sawa na ukurasa, hata kama LangHtml (ya pamoja) imeweka lugha iliyohifadhiwa.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang, stored]);

  useEffect(() => {
    if (lang !== "en" || stored !== "sw" || isHandled()) return;
    markHandled();
    router.replace(LANG_HOME.sw);
  }, [lang, stored, router]);

  return <PageLang value={lang}>{children}</PageLang>;
}

/** Lugha ya ukurasa huu (si ile iliyohifadhiwa). */
export function useLang(): Lang {
  return useContext(PageLang);
}

type Vars = Record<string, string | number>;

/** `t("Maandishi ya Kiswahili", { n: 3 })` -> maandishi ya lugha ya ukurasa huu. */
export function useT(): (sw: string, vars?: Vars) => string {
  const lang = useLang();
  return useCallback((sw: string, vars?: Vars) => translate(lang, sw, vars), [lang]);
}

/** Maandishi ya Kiswahili yaliyotoka kwenye server component, yakitafsiriwa kwa lugha ya ukurasa. */
export function Tr({ children, vars }: { children: string; vars?: Vars }) {
  const t = useT();
  return <>{t(children, vars)}</>;
}

/** Maandishi ya site-config yenye lugha mbili (muda wa kuweka, kipindi cha malipo, haki miliki). */
export function Loc({ value }: { value: Localized }) {
  const lang = useLang();
  return <>{value[lang]}</>;
}

/** Kitufe cha EN | SW chenye muonekano na alama zilezile za LangToggle ya pamoja, lakini kinahamisha kati ya "/" na "/sw". */
export function LangSwitch({ className = "" }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();

  const go = (next: Lang) => {
    setLang(next);
    markHandled();
    if (next !== lang) router.push(LANG_HOME[next]);
  };

  return (
    <div className={`lang-toggle ${className}`.trim()} role="group" aria-label={lang === "en" ? "Language" : "Lugha"}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => go("en")} lang="en">
        EN
      </button>
      <span aria-hidden="true">|</span>
      <button type="button" aria-pressed={lang === "sw"} onClick={() => go("sw")} lang="sw">
        SW
      </button>
    </div>
  );
}
