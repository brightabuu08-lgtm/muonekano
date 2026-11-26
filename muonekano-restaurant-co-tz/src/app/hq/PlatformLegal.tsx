"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// /hq: kubadilisha Sera ya Faragha na Masharti ya Matumizi (Kiingereza na Kiswahili). Kuhifadhi kunapita kwenye
// platform_set_legal_page (mmiliki + 2FA tu; kila badiliko linaandikwa kwenye audit_log). Ukurasa wa umma unasasishwa ndani ya dakika moja.
import { useEffect, useState } from "react";
import { useT } from "../_components/Lang";
import { getBrowserClient } from "@/lib/supabase-browser";
import {
  LEGAL_MAX_BODY,
  legalErrorMessage,
  parseLegalBody,
  parseLegalRows,
  validateLegal,
  type LegalLang,
  type LegalPage,
  type LegalSlug,
} from "@/lib/legal";

const PAGES: { slug: LegalSlug; label: string }[] = [
  { slug: "privacy", label: "Sera ya Faragha" },
  { slug: "terms", label: "Masharti ya Matumizi" },
];
const LANGS: { lang: LegalLang; label: string }[] = [
  { lang: "en", label: "English" },
  { lang: "sw", label: "Kiswahili" },
];

type Draft = { title: string; body: string };
const key = (s: LegalSlug, l: LegalLang) => `${s}:${l}`;
/** Nakala ya rasimu bila ufunguo huu (kurudi kwenye maandishi yaliyohifadhiwa). */
function without(d: Record<string, Draft>, k: string): Record<string, Draft> {
  const out = { ...d };
  delete out[k];
  return out;
}

export default function PlatformLegal() {
  const t = useT();
  const [rows, setRows] = useState<LegalPage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [slug, setSlug] = useState<LegalSlug>("privacy");
  const [lang, setLang] = useState<LegalLang>("en");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      const b = getBrowserClient();
      if ("error" in b) return live && setFailed(true);
      const { data, error } = await b.client.from("legal_pages").select("slug, lang, title, body, updated_at");
      if (!live) return;
      if (error) return setFailed(true);
      setRows(parseLegalRows(data));
    })();
    return () => {
      live = false;
    };
  }, []);

  if (failed) return <p className="adm-err" role="alert">{t("Imeshindwa kupakia kurasa za kisheria. Jaribu tena.")}</p>;
  if (!rows) return <p className="adm-loading" aria-live="polite">{t("Inapakia.")}</p>;

  const saved = rows.find((r) => r.slug === slug && r.lang === lang);
  const k = key(slug, lang);
  const draft = drafts[k] ?? { title: saved?.title ?? "", body: saved?.body ?? "" };
  const changed = !saved || draft.title !== saved.title || draft.body !== saved.body;
  const edit = (patch: Partial<Draft>) => {
    setMsg(null);
    setDrafts((d) => ({ ...d, [k]: { ...draft, ...patch } }));
  };

  async function save() {
    const problem = validateLegal(draft.title, draft.body);
    if (problem) return setMsg({ ok: false, text: problem });
    const b = getBrowserClient();
    if ("error" in b || busy) return;
    setBusy(true);
    const { data, error } = await b.client.rpc("platform_set_legal_page", { p_slug: slug, p_lang: lang, p_title: draft.title, p_body: draft.body });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: legalErrorMessage(error.message) });
    const updatedAt = typeof data === "string" ? data : new Date().toISOString();
    const clean: LegalPage = { slug, lang, title: draft.title.trim(), body: draft.body.replace(/\r\n/g, "\n").trim(), updatedAt };
    setRows((rs) => [...(rs ?? []).filter((r) => !(r.slug === slug && r.lang === lang)), clean]);
    setDrafts((d) => without(d, k));
    setMsg({ ok: true, text: "Imehifadhiwa. Ukurasa wa umma unasasishwa ndani ya dakika moja." });
  }

  return (
    <section className="jk-sec" aria-labelledby="jk-lg">
      <div className="adm-head-row">
        <h2 id="jk-lg" className="adm-sh">{t("Kurasa za kisheria")}</h2>
        <a className="adm-lnk" href={`/${slug}`} target="_blank" rel="noreferrer">{t("Fungua ukurasa")} ↗</a>
      </div>

      <div className="adm-card jk-legal">
        <div className="jk-tabs" role="group" aria-label={t("Ukurasa")}>
          {PAGES.map((p) => (
            <button key={p.slug} type="button" className="adm-chip" aria-pressed={slug === p.slug} onClick={() => { setSlug(p.slug); setMsg(null); }}>
              {t(p.label)}
            </button>
          ))}
          <span className="adm-sp" />
          {LANGS.map((l) => (
            <button key={l.lang} type="button" className="adm-chip" aria-pressed={lang === l.lang} onClick={() => { setLang(l.lang); setMsg(null); }}>
              {l.label}
            </button>
          ))}
        </div>

        <label className="jk-field">
          <span className="adm-help">{t("Kichwa")}</span>
          <input value={draft.title} maxLength={120} onChange={(e) => edit({ title: e.target.value })} />
        </label>

        <div className="jk-field">
          <div className="jk-field-head">
            <span className="adm-help">{t("Maandishi")}</span>
            <button type="button" className="adm-chip" aria-pressed={preview} onClick={() => setPreview((v) => !v)}>
              {t(preview ? "Hariri" : "Hakiki")}
            </button>
          </div>
          {preview ? (
            <div className="jk-preview">
              {parseLegalBody(draft.body).map((b, i) =>
                b.kind === "h" ? <h3 key={i}>{b.text}</h3> : b.kind === "p" ? <p key={i}>{b.text}</p> : (
                  <ul key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
                ),
              )}
            </div>
          ) : (
            <textarea value={draft.body} rows={18} maxLength={LEGAL_MAX_BODY} spellCheck onChange={(e) => edit({ body: e.target.value })} />
          )}
          <p className="adm-help">
            {t("Mstari unaoanza na \"## \" ni kichwa; unaoanza na \"- \" ni kipengele cha orodha; mstari mtupu unaanzisha aya mpya.")}
          </p>
        </div>

        {msg && <p className={msg.ok ? "adm-note" : "adm-err"} role={msg.ok ? "status" : "alert"}>{t(msg.text)}</p>}
        <div className="jk-actions">
          <button type="button" className="adm-btn adm-cta" disabled={busy || !changed} onClick={() => void save()}>
            {busy ? t("Inahifadhi…") : t("Hifadhi")}
          </button>
          {changed && saved && (
            <button type="button" className="adm-btn adm-btn-ghost" disabled={busy}
              onClick={() => setDrafts((d) => without(d, k))}>
              {t("Rudisha ya awali")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
