"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Menyu ya umma ya kifurushi cha Standard (brand "Tiketi + Ubao", hali ya mwanga .lt): artboards 01b, 02, 02b, 03, 05b.
// Rangi na fonti zinatoka src/styles/brand.css tu. Kikapu na checkout ni vya pamoja (shared/order), vinavaa brand hii
// kupitia default.css chini ya .dm pekee, kwa hiyo Zebra haiguswi.
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/app/_components/BrandMark";
import { LangToggle, usePick, useT } from "@/app/_components/Lang";
import { BRAND_NAME } from "@/lib/brand";
import type { MenuItem } from "@/lib/menu";
import { formatTZS } from "@/lib/money";
import { packPrice } from "@/lib/menu-extras";
import { OfferPrice, OfferTag } from "../shared/extras/Offer";
import { RatingBadge } from "../shared/extras/Stars";
import type { MenuViewProps } from "../types";
import { OrderDock } from "../shared/order/OrderDock";
import BookingSheet from "./BookingSheet";
import { ItemSheet } from "./ItemSheet";
import { TablePicker, useTableChoice } from "./TablePicker";
import { UNKNOWN_TABLES, acceptTable } from "./tables";
import "./default.css";
import "./default-extras.css";

/** Herufi za kwanza za jina la mgahawa (hadi mbili), kwa alama ya mgahawa mpaka nembo yake iwekwe. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "?";
}

/** Bei ya chini (pamoja na ofa ya leo) ya vifurushi vinavyopatikana (au ya vyote kama hakuna kinachopatikana); null kama hakuna kifurushi. */
export function fromPrice(item: MenuItem): number | null {
  const open = item.item_packs.filter((p) => p.available);
  const list = open.length > 0 ? open : item.item_packs;
  return list.length > 0 ? Math.min(...list.map(packPrice)) : null;
}

/** Chakula kinalingana na maneno ya kutafuta (jina au lebo, bila kujali herufi kubwa). */
export function matches(item: MenuItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.tag_sw ?? "", item.tag_en ?? ""].some((s) => s.toLowerCase().includes(q));
}

export function MenuView({ restaurant, menu, table = "", tables = UNKNOWN_TABLES }: MenuViewProps) {
  const t = useT();
  const pick = usePick();
  const slug = restaurant.slug;
  const { ready, choice, set } = useTableChoice(slug);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<MenuItem | null>(null);
  const [booking, setBooking] = useState(false);

  // QR ya zamani yenye ?meza=5: namba hiyo inakuwa chaguo la tab hii (kama inakubalika), bila kuuliza.
  const qrTable = acceptTable(tables, table);
  useEffect(() => {
    if (qrTable && !(choice?.kind === "table" && choice.table === qrTable)) set({ kind: "table", table: qrTable });
    // Inaendeshwa mara moja kwa kila namba ya QR, si kila chaguo jipya la mteja.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrTable]);

  // Chaguo kutoka sessionStorage halijaaminiwa: linapita sheria ileile ya meza kabla ya kutumika.
  const chosenTable = (choice?.kind === "table" ? acceptTable(tables, choice.table) : "") || qrTable;
  const delivery = choice?.kind === "delivery";
  // Hakuna meza halali wala delivery (mara ya kwanza, au meza iliyohifadhiwa haipo tena): uliza meza.
  const showPicker = menu.ok && (picking || (ready && !chosenTable && !delivery));

  const shown = useMemo(() => {
    if (!menu.ok) return [];
    return menu.categories
      .map((cat) => ({ cat, items: menu.items.filter((i) => i.category_id === cat.id && matches(i, query)) }))
      .filter((g) => g.items.length > 0);
  }, [menu, query]);
  const hasItems = menu.ok && menu.items.length > 0;
  // Ofa ya leo: vyakula vinavyopatikana vyenye kifurushi chenye bei ya ofa ya leo (kifurushi cha bei ya chini).
  const offers = menu.ok
    ? menu.items.flatMap((i) => {
        const p = i.available ? i.item_packs.filter((x) => x.available && x.offer != null).sort((a, b) => packPrice(a) - packPrice(b))[0] : undefined;
        return p ? [{ item: i, pack: p }] : [];
      })
    : [];

  return (
    <div className="lt dm" data-theme="default">
      <header className="dm-head">
        <span className="dm-logo" aria-hidden="true">
          {initials(restaurant.displayName)}
        </span>
        <div className="dm-title">
          <h1>{restaurant.displayName}</h1>
          <p>{t("Menu")}</p>
        </div>
        {menu.ok && !showPicker && (chosenTable || delivery) && (
          <button
            type="button"
            className="dm-where"
            onClick={() => setPicking(true)}
            aria-label={chosenTable ? t("Meza {table}, badilisha", { table: chosenTable }) : t("Delivery, badilisha")}
          >
            <b>{chosenTable ? t("Meza {table}", { table: chosenTable }) : t("Delivery")}</b>
            <small>{t("badilisha")}</small>
          </button>
        )}
        <LangToggle className="dm-lang" />
      </header>

      {showPicker ? (
        <main className="dm-body">
          <TablePicker
            setup={tables}
            current={chosenTable}
            onPick={(n) => {
              set({ kind: "table", table: n });
              setPicking(false);
            }}
            onDelivery={() => {
              set({ kind: "delivery" });
              setPicking(false);
            }}
            onCancel={chosenTable || delivery ? () => setPicking(false) : undefined}
          />
        </main>
      ) : (
        <main className="dm-body">
          {!menu.ok && (
            <p role="alert" className="notice">
              {t(menu.message)}
            </p>
          )}

          {hasItems && (
            <div className="dm-tools">
              <label htmlFor="dm-search" className="dm-sr">
                {t("Tafuta chakula")}
              </label>
              <input
                id="dm-search"
                type="search"
                className="dm-search"
                placeholder={t("Tafuta chakula")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              <nav className="dm-cats" aria-label={t("Makundi ya menu")}>
                {shown.map(({ cat }) => (
                  <a key={cat.id} href={`#c-${cat.slug}`}>
                    {pick(cat.name_sw, cat.name_en)}
                  </a>
                ))}
              </nav>
              <button type="button" className="dm-btn dm-book" onClick={() => setBooking(true)}>
                {t("Hifadhi meza")}
              </button>
            </div>
          )}

          {offers.length > 0 && !query.trim() && (
            <section className="dm-cat dm-offers" aria-labelledby="c-ofa">
              <h2 id="c-ofa">{t("Ofa ya leo")}</h2>
              <ul className="dm-offer-list">
                {offers.map(({ item, pack }) => (
                  <li key={pack.id}>
                    <button type="button" className="dm-offer" onClick={() => setOpen(item)} aria-label={t("{name}, chagua", { name: item.name })}>
                      <b>{item.name}</b>
                      <span className="dm-offer-p">
                        <OfferPrice price={pack.price} offer={pack.offer} showPercent />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasItems && shown.length === 0 && <p className="dm-mut dm-none">{t("Hakuna chakula kinacholingana na \"{q}\".", { q: query.trim() })}</p>}

          {shown.map(({ cat, items }) => (
            <section key={cat.id} className="dm-cat" aria-labelledby={`c-${cat.slug}`}>
              <h2 id={`c-${cat.slug}`}>{pick(cat.name_sw, cat.name_en)}</h2>
              {items.map((item) => {
                const price = fromPrice(item);
                const photo = item.image_urls[0];
                return (
                  <article key={item.id} className={item.available ? "dm-item" : "dm-item gone"}>
                    {photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="dm-thumb" src={photo} alt={item.name} width={800} height={800} loading="lazy" />
                    )}
                    <div className="dm-item-main">
                      <div className="item-head">
                        <h3>{item.name}</h3>
                        {item.item_packs.some((p) => p.available && p.offer != null) && <OfferTag />}
                        {!item.available && <span className="badge">{t("Kimekwisha")}</span>}
                      </div>
                      {item.tag_sw && <p className="tag">{pick(item.tag_sw, item.tag_en)}</p>}
                      <RatingBadge rating={item.rating} className="dm-rate" />
                      <div className="dm-item-foot">
                        {price !== null && (
                          <span className="dm-price">
                            {item.item_packs.length > 1 && <small>{t("Kuanzia")} </small>}
                            {formatTZS(price)}
                          </span>
                        )}
                        {item.available && item.item_packs.length > 0 && (
                          <button type="button" className="dm-btn dm-choose" onClick={() => setOpen(item)} aria-label={t("{name}, chagua", { name: item.name })}>
                            {t("Chagua")}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ))}
        </main>
      )}

      <footer className="dm-foot">
        <p className="dm-powered">
          <span aria-hidden="true">
            <BrandMark tone="lt" size={18} />
          </span>
          <span>{t("Inaendeshwa na {brand}", { brand: BRAND_NAME })}</span>
        </p>
        <p>© 2026 Bright Abuu. {t("Haki zote zimehifadhiwa.")}</p>
      </footer>

      {open && <ItemSheet slug={slug} item={open} onClose={() => setOpen(null)} />}
      {booking && <BookingSheet slug={slug} onClose={() => setBooking(false)} />}
      {menu.ok && !showPicker && <OrderDock key={chosenTable} slug={slug} defaultTable={chosenTable} />}
    </div>
  );
}
