// © Bright Abuu. Haki zote zimehifadhiwa.
// Hali ya kikapu na oda ya mwisho kwa ukurasa mmoja wa menu. Ni "external store" ili React isisome
// hifadhi ya browser wakati wa kuchora ukurasa kwenye server (hakuna hydration mismatch).
import { MAX_LINES, MAX_QTY, type Cart, type CartLine } from "@/lib/cart";
import { readLastOrder, type LastOrder } from "@/lib/place-order";

export type OrderState = { cart: Cart; last: LastOrder | null };

const EMPTY: OrderState = { cart: [], last: null };
const listeners = new Set<() => void>();
let state: OrderState = EMPTY;
let bound: string | null = null;

const cartKey = (slug: string) => `resto-cart:${slug}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Kikapu kilichohifadhiwa kwenye kikao cha tab. Chochote kisicho cha kawaida kinatupwa badala ya kuaminiwa. */
export function parseStoredCart(raw: string | null): Cart {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const out: CartLine[] = [];
    for (const x of data.slice(0, MAX_LINES)) {
      if (!x || typeof x !== "object") continue;
      const l = x as Record<string, unknown>;
      if (
        typeof l.packId === "string" && UUID.test(l.packId) &&
        typeof l.itemName === "string" && l.itemName.length <= 200 &&
        typeof l.packLabel === "string" && l.packLabel.length <= 200 &&
        typeof l.price === "number" && Number.isFinite(l.price) && l.price >= 0 &&
        typeof l.qty === "number" && Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= MAX_QTY &&
        (l.option === null || (typeof l.option === "string" && l.option.length <= 60)) &&
        (l.packLabelEn === undefined || l.packLabelEn === null || (typeof l.packLabelEn === "string" && l.packLabelEn.length <= 200))
      ) {
        out.push({
          packId: l.packId,
          itemName: l.itemName,
          packLabel: l.packLabel,
          ...(typeof l.packLabelEn === "string" ? { packLabelEn: l.packLabelEn } : {}),
          price: l.price,
          qty: l.qty,
          option: l.option,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

function persistCart(slug: string, cart: Cart): void {
  try {
    if (cart.length === 0) globalThis.sessionStorage?.removeItem(cartKey(slug));
    else globalThis.sessionStorage?.setItem(cartKey(slug), JSON.stringify(cart));
  } catch {
    /* kuhifadhi ni hiari */
  }
}

export function subscribe(slug: string, listener: () => void): () => void {
  listeners.add(listener);
  if (bound !== slug) {
    bound = slug;
    let stored: string | null = null;
    try {
      stored = globalThis.sessionStorage?.getItem(cartKey(slug)) ?? null;
    } catch {
      /* hifadhi haipatikani */
    }
    state = { cart: parseStoredCart(stored), last: readLastOrder(slug) };
  }
  return () => {
    listeners.delete(listener);
  };
}

export const getSnapshot = (): OrderState => state;
export const getServerSnapshot = (): OrderState => EMPTY;

function set(next: OrderState): void {
  state = next;
  for (const l of listeners) l();
}

export function updateCart(slug: string, fn: (c: Cart) => Cart): void {
  const cart = fn(state.cart);
  if (cart === state.cart) return;
  persistCart(slug, cart);
  set({ ...state, cart });
}

export function setLast(last: LastOrder | null): void {
  set({ ...state, last });
}
