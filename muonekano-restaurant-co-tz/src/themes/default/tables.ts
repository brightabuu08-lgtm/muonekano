// © Bright Abuu. Haki zote zimehifadhiwa.
// Kiolesura KIMOJA cha data ya meza kwa menyu ya Standard (brand artboard 01b, "chagua meza").
// QR ni moja kwa mgahawa mzima; mteja anachagua namba ya meza yake baada ya kuskani.
// Idadi ya meza inawekwa na mmiliki kwenye admin (kazi ya Admin na Jukwaa: migration + place-order).
// Mpaka data hiyo iwepo, idadi haijulikani (count = null) na mteja anaandika namba yake mwenyewe.
// Kazi safi (bila React) ili zijaribiwe.
import { cleanTable } from "@/lib/cart";
import type { Restaurant } from "@/lib/restaurant";

export type TableSetup = {
  /** Idadi ya meza (1..MAX_TABLES), au null kama mgahawa haujaweka idadi bado. */
  count: number | null;
};

/** Kikomo cha juu cha idadi ya meza tunachoonyesha kama vitufe. */
export const MAX_TABLES = 200;

export const UNKNOWN_TABLES: TableSetup = { count: null };

/** Idadi kutoka chanzo chochote (database, JSON) → TableSetup salama. Thamani isiyo sahihi = haijulikani. */
export function normalizeTableSetup(raw: unknown): TableSetup {
  return typeof raw === "number" && Number.isInteger(raw) && raw >= 1 && raw <= MAX_TABLES ? { count: raw } : UNKNOWN_TABLES;
}

/**
 * Server: mpangilio wa meza wa mgahawa kwa ukurasa wa menyu.
 * Admin na Jukwaa: baada ya migration ya idadi ya meza, soma idadi hapa (mfano kutoka settings)
 * na uirudishe kupitia normalizeTableSetup. Hakuna sehemu nyingine ya menyu inayohitaji kubadilika.
 */
export async function loadTableSetup(restaurant: Restaurant): Promise<TableSetup> {
  void restaurant;
  return UNKNOWN_TABLES;
}

/** Namba za meza za kuonyesha kama vitufe ("1".."n"); tupu kama idadi haijulikani. */
export function tableNumbers(setup: TableSetup): string[] {
  if (setup.count === null) return [];
  return Array.from({ length: setup.count }, (_, i) => String(i + 1));
}

/**
 * Namba ya meza aliyoichagua au kuiandika mteja → namba safi, au "" kama haikubaliki.
 * Idadi ikijulikana, namba lazima iwe kati ya 1 na idadi hiyo (sifuri za mwanzo zinaondolewa: "04" → "4").
 * Idadi isipojulikana, inakubaliwa chochote ambacho cleanTable (sheria ya oda) inakubali.
 */
export function acceptTable(setup: TableSetup, raw: string): string {
  const t = cleanTable(raw);
  if (!t) return "";
  if (setup.count === null) return t;
  if (!/^\d{1,3}$/.test(t)) return "";
  const n = Number(t);
  return n >= 1 && n <= setup.count ? String(n) : "";
}
