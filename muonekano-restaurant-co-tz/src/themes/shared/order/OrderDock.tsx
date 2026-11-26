// © Bright Abuu. Haki zote zimehifadhiwa.
"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  buildOrderPayload,
  cartCount,
  cartTotal,
  lineKey,
  removeLine,
  setQty,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutForm,
} from "@/lib/cart";
import { getEnv } from "@/lib/env";
import { formatTZS } from "@/lib/money";
import { isFinalStatus, orderStatusLabel } from "@/lib/order-status";
import { clearLastOrder, getDeviceId, postOrder, saveLastOrder } from "@/lib/place-order";
import { usePick, useT } from "@/app/_components/Lang";
import { useOrderState, useOrderStatus } from "./hooks";
import { setLast, updateCart } from "./store";
import { Turnstile } from "./Turnstile";
import { useBackdropClose } from "./backdrop";
import { OrderAlertsControl } from "./OrderAlerts";
import { OrderTimeline } from "./OrderTimeline";
import { RateOrder } from "../extras/RateOrder";
import { useOrderAlerts, type OrderAlerts } from "./useOrderAlerts";
import "./order.css";
import "./order-close.css";

const EMPTY_FORM: CheckoutForm = { type: "dine_in", table: "", name: "", phone: "", address: "", notes: "" };

/** Kikapu cha chini ya skrini na dirisha la kuagiza. Inafanana kwa muonekano wowote; rangi zinatoka kwa theme. */
export function OrderDock({ slug, defaultTable }: { slug: string; defaultTable: string }) {
  const { cart, last } = useOrderState(slug);
  const tracked = useOrderStatus(last?.id ?? null);
  // Arifa za oda (sauti, mtetemo, Web Push): hali yake iko hapa, juu ya dirisha, ili iendelee dirisha likiwa limefungwa.
  const alerts = useOrderAlerts(last?.id ?? null, tracked);
  const dialog = useRef<HTMLDialogElement>(null);
  const backdrop = useBackdropClose(dialog);
  const t = useT();
  const [open, setOpen] = useState(false);

  const count = cartCount(cart);
  const status = tracked?.status ?? null;
  // Mstari wa oda unabaki hata hali ikiwa ya mwisho (Imefikishwa, Imehudumiwa, Imeghairiwa), ili mteja aliyefunga dirisha
  // aone matokeo; unatoweka mteja akibonyeza "Oda nyingine" au baada ya saa 12 (LAST_TTL_MS).
  const showOrderBar = count === 0 && last !== null;
  const visible = count > 0 || showOrderBar;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className="ord">
      {visible && <div className="ord-spacer" aria-hidden="true" />}
      {visible && (
        <div className="ord-bar" role="region" aria-label={t("Kikapu")}>
          <p aria-live="polite">
            {count > 0 ? (
              <>
                <strong>{t("Kikapu: {count}", { count })}</strong> · {formatTZS(cartTotal(cart))}
              </>
            ) : (
              <>
                <strong>{t("Oda #{no}", { no: last?.no ?? "" })}</strong> · {status ? t(orderStatusLabel(status, tracked?.type)) : t("Inatafutwa hali…")}
              </>
            )}
          </p>
          <button type="button" className="ord-btn light" onClick={() => setOpen(true)}>
            {count > 0 ? t("Angalia kikapu") : t("Angalia oda")}
          </button>
        </div>
      )}

      <dialog ref={dialog} className="ord-dialog" aria-labelledby={`ord-title-${slug}`} onClose={() => setOpen(false)} {...backdrop}>
        {open && <Checkout slug={slug} defaultTable={defaultTable} onClose={() => setOpen(false)} alerts={alerts} />}
      </dialog>
    </div>
  );
}

function Checkout({ slug, defaultTable, onClose, alerts }: { slug: string; defaultTable: string; onClose: () => void; alerts: OrderAlerts }) {
  const { cart, last } = useOrderState(slug);
  const tracked = useOrderStatus(last?.id ?? null);
  const t = useT();
  const pick = usePick();
  const appEnv = getEnv();
  const siteKey = appEnv.success ? (appEnv.data.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null) : null;

  const [form, setForm] = useState<CheckoutForm>({ ...EMPTY_FORM, table: defaultTable });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [token, setToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaProblem, setCaptchaProblem] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const total = cartTotal(cart);
  const set = <K extends keyof CheckoutForm>(k: K, v: CheckoutForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const delivery = form.type === "delivery";
  const takeaway = form.type === "takeaway";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setFailure(null);
    const errs = validateCheckout(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!token) {
      setFailure(t("Subiri uthibitisho wa usalama ukamilike kisha ubonyeze tena."));
      return;
    }
    setSending(true);
    const env = getEnv();
    if (!env.success) {
      setSending(false);
      setFailure(t("Mipangilio ya mfumo haijakamilika. Wasiliana na mgahawa."));
      return;
    }
    // Ndani ya kubonyeza "Tuma oda", kabla ya fetch: ombi la ruhusa ya arifa (mara moja tu kwa kifaa). Halisubiriwi: oda inatumwa
    // kawaida, ruhusa ikikataliwa au ikishindwa; ikitolewa, kifaa kinasajiliwa kwa oda hii kimya kimya (useOrderAlerts).
    alerts.begin();
    const res = await postOrder(
      { url: env.data.NEXT_PUBLIC_SUPABASE_URL, anonKey: env.data.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      buildOrderPayload({ slug, device: getDeviceId(), captcha: token, cart, form }),
    );
    setSending(false);
    // Tokeni ya Turnstile inatumika mara moja: kisanduku kijengwe upya kila baada ya jaribio.
    setToken(null);
    setCaptchaKey((k) => k + 1);
    if (!res.ok) {
      setFailure(t(res.message));
      return;
    }
    const placed = { id: res.orderId, no: res.orderNo, total: res.total, at: Date.now() };
    saveLastOrder(slug, placed);
    setLast(placed);
    updateCart(slug, () => []);
    setForm({ ...EMPTY_FORM, table: defaultTable });
    setErrors({});
  }

  const fieldProps = (k: keyof CheckoutErrors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });
  const fieldError = (k: keyof CheckoutErrors) =>
    errors[k] ? (
      <p id={`err-${k}`} className="ord-err" role="alert">
        {t(String(errors[k]))}
      </p>
    ) : null;

  return (
    <div className="ord-sheet">
      <header className="ord-sheet-head">
        <h2 id={`ord-title-${slug}`}>{cart.length > 0 ? t("Kikapu chako") : last ? t("Oda yako") : t("Kikapu chako")}</h2>
        <button type="button" className="ord-btn x" onClick={onClose} aria-label={t("Funga dirisha")}>
          <span aria-hidden="true">&times;</span>
        </button>
      </header>

      {last && (
        <section className="ord-receipt" aria-label={t("Oda ya mwisho")}>
          <p className="ord-receipt-title">
            {cart.length === 0 ? t("Oda yako imepokelewa") : t("Oda yako ya awali")} · <strong>#{last.no}</strong>
          </p>
          {tracked && <OrderTimeline status={tracked.status} type={tracked.type} />}
          <p>
            {t("Hali:")} <strong>{tracked ? t(orderStatusLabel(tracked.status, tracked.type)) : t("Inatafutwa…")}</strong>
          </p>
          <p>{t("Jumla:")} {formatTZS(last.total)}</p>
          {tracked && !isFinalStatus(tracked.status) && <OrderAlertsControl alerts={alerts} />}
          {tracked?.status === "delivered" && <RateOrder orderId={last.id} />}
          {cart.length === 0 && (
            <div className="ord-actions">
              <button
                type="button"
                className="ord-btn ghost"
                onClick={() => {
                  clearLastOrder(slug);
                  setLast(null);
                }}
              >
                {t("Oda nyingine")}
              </button>
            </div>
          )}
        </section>
      )}

      {cart.length === 0 && !last && (
        <div className="ord-empty">
          <p>{t("Kikapu ni tupu. Chagua vyakula kwenye menu, kisha urudi hapa kuagiza.")}</p>
          <button type="button" className="ord-btn" onClick={onClose}>
            {t("Rudi kwenye menu")}
          </button>
        </div>
      )}

      {cart.length > 0 && (
        <form onSubmit={submit} noValidate>
          <ul className="ord-lines">
            {cart.map((l) => {
              const key = lineKey(l);
              return (
                <li key={key}>
                  <div>
                    <strong>{l.itemName}</strong>
                    <span className="ord-sub">
                      {pick(l.packLabel, l.packLabelEn)}
                      {l.option ? ` · ${l.option}` : ""}
                    </span>
                    <span className="ord-sub ord-each">{t("{price} kila moja", { price: formatTZS(l.price) })}</span>
                  </div>
                  <div className="ord-line-right">
                    <span className="ord-step" role="group" aria-label={t("Idadi ya {name}", { name: l.itemName })}>
                      <button type="button" className="ord-btn step" onClick={() => updateCart(slug, (c) => setQty(c, key, l.qty - 1))} aria-label={t("Punguza {name}", { name: l.itemName })}>
                        −
                      </button>
                      <output>{l.qty}</output>
                      <button type="button" className="ord-btn step" onClick={() => updateCart(slug, (c) => setQty(c, key, l.qty + 1))} aria-label={t("Ongeza {name}", { name: l.itemName })}>
                        +
                      </button>
                    </span>
                    <strong>{formatTZS(l.price * l.qty)}</strong>
                    <button type="button" className="ord-link" onClick={() => updateCart(slug, (c) => removeLine(c, key))} aria-label={t("Ondoa {name} kwenye kikapu", { name: l.itemName })}>
                      {t("Ondoa")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="ord-total">
            {t("Jumla:")} <strong>{formatTZS(total)}</strong>
          </p>
          <p className="ord-sub">{t("Mgahawa unathibitisha jumla ya mwisho wakati oda inapopokelewa.")}</p>

          <fieldset className="ord-type">
            <legend>{t("Unaagiza vipi?")}</legend>
            <label>
              <input type="radio" name="type" checked={form.type === "dine_in"} onChange={() => set("type", "dine_in")} />
              {t("Nipo mezani")}
            </label>
            <label>
              <input type="radio" name="type" checked={takeaway} onChange={() => set("type", "takeaway")} />
              {t("Nitachukua mwenyewe (takeaway)")}
            </label>
            <label>
              <input type="radio" name="type" checked={delivery} onChange={() => set("type", "delivery")} />
              {t("Niletewe (delivery)")}
            </label>
          </fieldset>

          {form.type === "dine_in" ? (
            <>
              <div className="ord-field">
              <label htmlFor="o-table">{t("Namba ya meza")}</label>
              <input id="o-table" value={form.table} onChange={(e) => set("table", e.target.value)} maxLength={20} autoComplete="off" {...fieldProps("table")} />
              {fieldError("table")}
            </div>
              <div className="ord-field">
              <label htmlFor="o-name">{t("Jina lako")}</label>
              <input id="o-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} autoComplete="name" {...fieldProps("name")} />
              {fieldError("name")}
            </div>
            </>
          ) : (
            <>
              <div className="ord-field">
                <label htmlFor="o-name">{t("Jina lako")}</label>
                <input id="o-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} autoComplete="name" {...fieldProps("name")} />
                {fieldError("name")}
              </div>
              <div className="ord-field">
                <label htmlFor="o-phone">{t("Namba ya simu")}</label>
                <input id="o-phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={25} autoComplete="tel" placeholder="0712345678" {...fieldProps("phone")} />
                {fieldError("phone")}
              </div>
              {delivery && (
                <div className="ord-field">
                  <label htmlFor="o-address">{t("Mahali pa kuletewa")}</label>
                  <textarea id="o-address" value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={300} rows={2} autoComplete="street-address" {...fieldProps("address")} />
                  {fieldError("address")}
                </div>
              )}
              {takeaway && <p className="ord-sub">{t("Tutakupigia simu oda yako ikiwa tayari kuchukuliwa.")}</p>}
              {!takeaway && <p className="ord-sub">{t("Taarifa hizi zinatumika kukuletea oda hii.")}</p>}
            </>
          )}

          <div className="ord-field">
            <label htmlFor="o-notes">{t("Maelezo ya ziada (si lazima)")}</label>
            <textarea id="o-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={300} rows={2} {...fieldProps("notes")} />
            {fieldError("notes")}
          </div>

          {siteKey ? (
            <Turnstile key={captchaKey} siteKey={siteKey} onToken={setToken} onProblem={() => setCaptchaProblem(true)} />
          ) : (
            <p className="ord-err" role="alert">
              {t("Uthibitisho wa usalama haujawekwa, kwa hiyo oda haziwezi kutumwa sasa. Mjulishe mgahawa.")}
            </p>
          )}
          {captchaProblem && siteKey && (
            <p className="ord-err" role="alert">
              {t("Uthibitisho wa usalama haukupakia. Angalia mtandao wako, pakia ukurasa upya kisha ujaribu tena.")}
            </p>
          )}

          {failure && (
            <p className="ord-err" role="alert">
              {failure}
            </p>
          )}

          <button type="submit" className="ord-btn wide" disabled={sending || !siteKey}>
            {sending ? t("Inatuma…") : t("Tuma oda · {total}", { total: formatTZS(total) })}
          </button>
        </form>
      )}
    </div>
  );
}
