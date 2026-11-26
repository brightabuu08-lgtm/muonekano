"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import { staffPref } from "@/app/_components/alertsBrowser";
import { askOnClick } from "@/app/_components/askAlerts";
import { useT } from "@/app/_components/Lang";
import { normalizeTzPhone, pinSchema, staffLoginMessage, staffLoginUrl } from "@/lib/auth";

export default function StaffLoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const t = useT();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr("");

    const normalized = normalizeTzPhone(phone);
    if (!normalized) return setErr("Weka namba ya simu sahihi, mfano 0712 345 678.");
    if (!pinSchema.safeParse(pin).success) return setErr("PIN ni tarakimu 6.");

    const b = getBrowserClient();
    if ("error" in b) return setErr("Mipangilio ya mazingira (.env.local) haijakamilika.");

    setBusy(true);
    // Ndani ya kubonyeza "Ingia", kabla ya await yoyote: ombi la ruhusa ya arifa (mara moja tu kwa kifaa; haliulizwi ikiwa
    // limekataliwa, limezimwa, au iPhone haiko kwenye Home Screen). Kuingia hakusubiri jibu; ukurasa wa kazi unasajili kimya
    // ruhusa ikitolewa.
    void askOnClick(staffPref);
    try {
      const res = await fetch(staffLoginUrl(b.url), {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: b.anonKey },
        body: JSON.stringify({ phone: normalized, pin, slug }),
      });
      if (!res.ok) {
        setPin("");
        return setErr(staffLoginMessage(res.status));
      }
      const body = (await res.json()) as { session?: { access_token: string; refresh_token: string } };
      if (!body.session) return setErr(staffLoginMessage(500));
      const { error } = await b.client.auth.setSession({
        access_token: body.session.access_token,
        refresh_token: body.session.refresh_token,
      });
      if (error) return setErr(staffLoginMessage(500));
      router.replace(`/${slug}/staff`);
    } catch {
      setErr("Hakuna mtandao. Angalia muunganisho kisha jaribu tena.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gate-card" onSubmit={onSubmit} noValidate>
      <label className="gate-label" htmlFor="phone">{t("Namba ya simu")}</label>
      <input
        id="phone"
        className="gate-input"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0712 345 678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        maxLength={18}
      />

      <label className="gate-label" htmlFor="pin">{t("PIN yako (tarakimu 6)")}</label>
      <input
        id="pin"
        className="gate-input gate-pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        placeholder="••••••"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6}
      />

      {err && (
        <p className="gate-err" role="alert">
          {t(err)}
        </p>
      )}
      <button className="gate-btn" type="submit" disabled={busy}>
        {busy ? t("Inaingia…") : t("Ingia")}
      </button>
    </form>
  );
}
