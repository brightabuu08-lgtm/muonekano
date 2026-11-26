// © Bright Abuu. Haki zote zimehifadhiwa.
"use client";
// Hali ya arifa za oda kwenye dirisha la oda ya mteja. Hali yote iko kwenye useOrderAlerts (inaitwa mara moja, kwenye OrderDock);
// hapa ni muonekano tu, unaofuata theme kupitia --o-* za order.css. Arifa ni za kiotomatiki (ruhusa inaombwa kwenye "Tuma oda"),
// kwa hiyo kitufe ni cha KUZIMA; kitufe kikubwa cha kuwasha kinaonekana tu kwa aliyezima au aliyefunga ombi la ruhusa. Ruhusa
// ikikataliwa au iPhone isiyo kwenye Home Screen: maelezo tu.
import { useT } from "@/app/_components/Lang";
import type { OrderAlerts } from "./useOrderAlerts";
import "./order-alerts.css";

// Maneno ya sauti ya ukurasa yanashirikiwa na ukurasa wa wafanyakazi (kamusi ileile).
const ASK = "Utaarifiwa oda yako ikibadilika, hata ukifunga ukurasa.";
const PUSH = "Arifa zimewashwa. Utaarifiwa oda yako ikibadilika, hata ukifunga ukurasa.";
const PAGE = "Arifa zimewashwa wakati ukurasa huu uko wazi.";
const BLOCKED = "Umezuia arifa kwenye kivinjari. Ziruhusu kwenye mipangilio ya tovuti kisha ujaribu tena.";
const INSTALL = "Kwenye iPhone, weka tovuti hii kwenye Home Screen (Shiriki, kisha Ongeza kwenye Skrini ya Nyumbani) ili upate arifa simu ikiwa imefungwa.";
const NOTES: Record<Exclude<OrderAlerts["note"], "none">, string> = {
  failed: "Hatukuweza kuwasha arifa za simu iliyofungwa. Sauti ya ukurasa inafanya kazi; jaribu tena baadaye.",
  unsupported: "Kivinjari hiki hakitumi arifa za simu iliyofungwa. Sauti inafanya kazi ukurasa ukiwa wazi.",
  unconfigured: "Arifa za simu iliyofungwa hazijawekwa kwenye mfumo bado. Sauti inafanya kazi ukurasa ukiwa wazi.",
};

export function OrderAlertsControl({ alerts }: { alerts: OrderAlerts }) {
  const t = useT();
  const { view, note, busy, enable, disable } = alerts;
  const wantsButton = view === "ask" || view === "off";
  const text =
    view === "push" ? PUSH : view === "page" ? PAGE : view === "blocked" ? BLOCKED : view === "install" ? INSTALL : ASK;

  return (
    <div className="ord-alert" role="group" aria-label={t("Arifa za oda")}>
      <p className="ord-sub" aria-live="polite">
        {t(text)}
      </p>
      {note !== "none" && <p className="ord-sub">{t(NOTES[note])}</p>}
      {wantsButton ? (
        <button type="button" className="ord-btn ghost" onClick={() => void enable()} disabled={busy}>
          {busy ? t("Inawasha…") : t("Washa arifa")}
        </button>
      ) : (
        <button type="button" className="ord-link" onClick={() => void disable()} disabled={busy}>
          {t("Zima arifa")}
        </button>
      )}
    </div>
  );
}
