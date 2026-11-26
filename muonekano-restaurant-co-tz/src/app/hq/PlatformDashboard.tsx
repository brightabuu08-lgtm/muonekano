"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Dashboard ya mmiliki: matukio mapya (kujiunga, kusimamisha, kifurushi), migahawa yote na hali yake kwa siku 7.
// Kila kitendo kinapita kwenye RPC inayokagua mmiliki + 2FA na kuandika kumbukumbu (audit). Inasasishwa kila sekunde 30.
import { useCallback, useEffect, useState } from "react";
import { useT } from "../_components/Lang";
import { formatTZS } from "@/lib/money";
import { getBrowserClient } from "@/lib/supabase-browser";
import { THEME_CATALOG } from "@/themes/catalog";
import PlatformLegal from "./PlatformLegal";
import {
  eventLabel,
  needsAttention,
  parseOverview,
  platformErrorMessage,
  type PlatformOverview,
  type PlatformPlan,
  type PlatformRestaurant,
} from "@/lib/platform";

const REFRESH_MS = 30_000;

function when(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("sw-TZ", { timeZone: "Africa/Dar_es_Salaam", dateStyle: "medium", timeStyle: "short" });
}

type Fetched = { kind: "ok"; data: PlatformOverview } | { kind: "failure"; message: string } | { kind: "signedOut" };

async function fetchOverview(): Promise<Fetched> {
  const b = getBrowserClient();
  if ("error" in b) return { kind: "failure", message: b.error };
  const { data: raw, error } = await b.client.rpc("platform_overview");
  if (error) return error.message.includes("not_found") ? { kind: "signedOut" } : { kind: "failure", message: platformErrorMessage(error.message) };
  const parsed = parseOverview(raw);
  return parsed ? { kind: "ok", data: parsed } : { kind: "failure", message: "Imeshindwa. Jaribu tena." };
}

export default function PlatformDashboard({ onSignedOut }: { onSignedOut: () => void }) {
  const t = useT();
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = useCallback((r: Fetched) => {
    if (r.kind === "signedOut") return onSignedOut();
    if (r.kind === "failure") return setFailure(r.message);
    setFailure(null);
    setData(r.data);
  }, [onSignedOut]);

  const load = useCallback(async () => apply(await fetchOverview()), [apply]);

  useEffect(() => {
    let stopped = false;
    const run = async () => {
      const r = await fetchOverview();
      if (!stopped) apply(r);
    };
    void run();
    const timer = window.setInterval(() => void run(), REFRESH_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [apply]);

  async function call(fn: string, args: Record<string, unknown>): Promise<boolean> {
    const b = getBrowserClient();
    if ("error" in b || busy) return false;
    setBusy(true);
    const { error } = await b.client.rpc(fn, args);
    setBusy(false);
    if (error) {
      setFailure(platformErrorMessage(error.message));
      return false;
    }
    await load();
    return true;
  }

  if (!data) {
    return failure ? <p className="adm-err" role="alert">{t(failure)}</p> : <p className="adm-loading" aria-live="polite">{t("Inapakia.")}</p>;
  }

  const byId = new Map(data.restaurants.map((r) => [r.id, r]));
  const active = data.restaurants.filter((r) => r.active).length;
  const orders = data.restaurants.reduce((s, r) => s + r.orders7d, 0);
  const revenue = data.restaurants.reduce((s, r) => s + r.revenue7d, 0);

  return (
    <>
      <div className="adm-head">
        <h1>HQ</h1>
        <p>{t("Migahawa yote inayotumia mfumo. Inasasishwa yenyewe kila sekunde 30.")}</p>
      </div>

      {failure && <p className="adm-err" role="alert">{t(failure)}</p>}

      <div className="adm-stats">
        <div className="adm-st"><b>{data.restaurants.length}</b><span>{t("Migahawa")}</span><small>{t("Inayofanya kazi: {n}", { n: active })}</small></div>
        <div className="adm-st"><b>{orders}</b><span>{t("Oda (siku 7)")}</span></div>
        <div className="adm-st"><b>{formatTZS(revenue)}</b><span>{t("Mauzo (siku 7)")}</span></div>
        <div className="adm-st"><b>{data.unseen}</b><span>{t("Matukio mapya")}</span></div>
      </div>

      <section className="jk-sec" aria-labelledby="jk-ev">
        <div className="adm-head-row">
          <h2 id="jk-ev" className="adm-sh">{t("Matukio")}</h2>
          {data.unseen > 0 && (
            <button className="adm-btn adm-btn-ghost" type="button" disabled={busy} onClick={() => void call("platform_mark_seen", {})}>
              {t("Weka yote yameonekana")}
            </button>
          )}
        </div>
        {data.events.length === 0 ? (
          <p className="adm-empty">{t("Hakuna matukio bado. Mgahawa ukijiunga utaona hapa.")}</p>
        ) : (
          <ul className="jk-events">
            {data.events.map((e) => {
              const r = e.restaurantId ? byId.get(e.restaurantId) : undefined;
              return (
                <li key={e.id} className={e.seen ? "jk-ev" : "jk-ev jk-new"}>
                  {!e.seen && <span className="adm-badge">{t("Mpya")}</span>}
                  <b>{t(eventLabel(e.kind))}</b>
                  <span>{r ? `${r.displayName} · /${r.slug}` : "—"}</span>
                  <small className="adm-mono">{when(e.createdAt)}</small>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="jk-sec" aria-labelledby="jk-rs">
        <h2 id="jk-rs" className="adm-sh">{t("Migahawa")}</h2>
        {data.restaurants.length === 0 ? (
          <p className="adm-empty">{t("Hakuna mgahawa bado.")}</p>
        ) : (
          <div className="jk-list">
            {data.restaurants.map((r) => (
              <RestaurantCard key={r.id} r={r} busy={busy} call={call} />
            ))}
          </div>
        )}
      </section>

      <PlatformLegal />
    </>
  );
}

type CardProps = { r: PlatformRestaurant; busy: boolean; call: (fn: string, args: Record<string, unknown>) => Promise<boolean> };

function RestaurantCard({ r, busy, call }: CardProps) {
  const t = useT();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [plan, setPlan] = useState<PlatformPlan>(r.plan);
  const [theme, setTheme] = useState(r.theme);
  const themes = THEME_CATALOG.filter((th) => th.plan === "standard" || plan === "premium");
  const changed = plan !== r.plan || theme !== r.theme;

  async function toggle() {
    if (await call("platform_owner_set_active", { p_restaurant: r.id, p_active: !r.active, p_confirm: typed.trim() })) {
      setConfirming(false);
      setTyped("");
    }
  }

  return (
    <article className="adm-card jk-card" aria-label={r.displayName}>
      <div className="jk-card-head">
        <div>
          <h3>{r.displayName}</h3>
          <a href={`/${r.slug}`} target="_blank" rel="noreferrer" className="adm-mono">/{r.slug} ↗</a>
        </div>
        <span className={r.active ? "adm-on" : "adm-off"}>{t(r.active ? "Inafanya kazi" : "Imesimamishwa")}</span>
      </div>

      <dl className="jk-facts">
        <div><dt>{t("Kifurushi")}</dt><dd>{r.plan === "premium" ? "Premium" : "Standard"}</dd></div>
        <div><dt>{t("Muonekano")}</dt><dd>{r.theme}</dd></div>
        <div><dt>{t("Email ya admin")}</dt><dd>{r.email ?? "—"}</dd></div>
        <div><dt>{t("Vyakula")}</dt><dd>{r.dishes}</dd></div>
        <div><dt>{t("Oda (siku 7)")}</dt><dd>{r.orders7d}</dd></div>
        <div><dt>{t("Mauzo (siku 7)")}</dt><dd>{formatTZS(r.revenue7d)}</dd></div>
        <div><dt>{t("Oda ya mwisho")}</dt><dd>{when(r.lastOrderAt)}</dd></div>
        <div><dt>{t("Alijiunga")}</dt><dd>{when(r.createdAt)}{r.selfSignup ? ` · ${t("mwenyewe")}` : ""}</dd></div>
      </dl>
      {needsAttention(r) && <p className="adm-help">{t("Bado hakuna chakula kwenye menyu.")}</p>}

      <div className="jk-actions">
        <label>
          <span className="adm-help">{t("Kifurushi")}</span>
          <select value={plan} disabled={busy} onChange={(e) => { const p = e.target.value as PlatformPlan; setPlan(p); if (p === "standard") setTheme("default"); }}>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <label>
          <span className="adm-help">{t("Muonekano")}</span>
          <select value={theme} disabled={busy} onChange={(e) => setTheme(e.target.value)}>
            {themes.map((th) => <option key={th.key} value={th.key}>{t(th.name)}</option>)}
          </select>
        </label>
        <button className="adm-btn" type="button" disabled={busy || !changed}
          onClick={() => void call("platform_owner_set_plan", { p_restaurant: r.id, p_plan: plan, p_theme: theme })}>
          {t("Hifadhi kifurushi")}
        </button>
      </div>

      {confirming ? (
        <div className="jk-confirm">
          <label htmlFor={`jk-c-${r.id}`} className="adm-help">
            {t("Andika anwani ya mgahawa ({slug}) kuthibitisha.", { slug: r.slug })}
          </label>
          <input id={`jk-c-${r.id}`} value={typed} autoCapitalize="none" spellCheck={false} onChange={(e) => setTyped(e.target.value)} />
          <button className={r.active ? "adm-btn adm-danger" : "adm-btn adm-cta"} type="button" disabled={busy || typed.trim() !== r.slug} onClick={() => void toggle()}>
            {t(r.active ? "Simamisha mgahawa" : "Washa mgahawa")}
          </button>
          <button className="adm-btn adm-btn-ghost" type="button" onClick={() => { setConfirming(false); setTyped(""); }}>{t("Ghairi")}</button>
        </div>
      ) : (
        <button className={r.active ? "adm-btn adm-btn-ghost" : "adm-btn"} type="button" disabled={busy} onClick={() => setConfirming(true)}>
          {t(r.active ? "Simamisha…" : "Washa…")}
        </button>
      )}
    </article>
  );
}
