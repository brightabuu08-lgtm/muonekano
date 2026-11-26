// © Bright Abuu. Haki zote zimehifadhiwa.
"use client";
import { useState } from "react";
import { addLine, canAddNew, lineKey, setQty, type NewLine } from "@/lib/cart";
import { packPrice } from "@/lib/menu-extras";
import { OfferPrice } from "../extras/Offer";
import { usePick, useT } from "@/app/_components/Lang";
import { useOrderState } from "./hooks";
import { updateCart } from "./store";
import "./order.css";

export type PackView = { id: string; label_sw: string; label_en: string | null; desc_sw: string | null; desc_en: string | null; price: number; available: boolean; offer?: number | null };

/** Vifurushi vya chakula kimoja, kila kimoja na kitufe cha kuongeza kwenye kikapu. Data na bei vinatoka server. */
export function ItemPacks({ slug, itemId, itemName, itemAvailable, options, packs }: {
  slug: string;
  itemId: string;
  itemName: string;
  itemAvailable: boolean;
  options: string[];
  packs: PackView[];
}) {
  const { cart } = useOrderState(slug);
  const t = useT();
  const pick = usePick();
  const [option, setOption] = useState("");
  const needsOption = options.length > 0;
  const optionId = `opt-${itemId}`;

  return (
    <div className="ord">
      {itemAvailable && needsOption && (
        <div className="ord-opt">
          <label htmlFor={optionId}>{t("Chagua mtindo kabla ya kuongeza")}</label>
          <select id={optionId} value={option} onChange={(e) => setOption(e.target.value)}>
            <option value="">{t("Chagua…")}</option>
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      )}
      <ul className="packs">
        {packs.map((p) => {
          const line: NewLine = { packId: p.id, itemName, packLabel: p.label_sw, packLabelEn: p.label_en, price: packPrice(p), option: needsOption ? option || null : null };
          const key = lineKey(line);
          const qty = cart.find((l) => lineKey(l) === key)?.qty ?? 0;
          const orderable = itemAvailable && p.available;
          const blocked = needsOption && !option;
          const full = qty === 0 && !canAddNew(cart, line);
          const what = `${itemName}, ${pick(p.label_sw, p.label_en)}`;
          return (
            <li key={p.id}>
              <span>
                {pick(p.label_sw, p.label_en)}
                {p.desc_sw ? <small> · {pick(p.desc_sw, p.desc_en)}</small> : null}
              </span>
              <span className="ord-right">
                <strong><OfferPrice price={p.price} offer={p.offer} /></strong>
                {orderable && qty === 0 && (
                  <button
                    type="button"
                    className="ord-btn small"
                    disabled={blocked || full}
                    onClick={() => updateCart(slug, (c) => addLine(c, line))}
                    aria-label={t("Ongeza {name} kwenye kikapu", { name: what })}
                    title={blocked ? t("Chagua mtindo kwanza") : full ? t("Kikapu kimejaa") : undefined}
                  >
                    {t("Ongeza")}
                  </button>
                )}
                {orderable && qty > 0 && (
                  <span className="ord-step" role="group" aria-label={t("Idadi ya {name}", { name: what })}>
                    <button type="button" className="ord-btn step" onClick={() => updateCart(slug, (c) => setQty(c, key, qty - 1))} aria-label={t("Punguza {name}", { name: what })}>
                      −
                    </button>
                    <output aria-live="polite">{qty}</output>
                    <button type="button" className="ord-btn step" onClick={() => updateCart(slug, (c) => addLine(c, line))} aria-label={t("Ongeza {name}", { name: what })}>
                      +
                    </button>
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
