"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Kuingia kwa msimamizi: email + nenosiri AU Google, kisha 2FA (TOTP) kama ameiwasha.
//  * "restaurant": admin wa mgahawa. 2FA ni ya HIARI (uamuzi wa Bright): aliyeiwasha anaulizwa namba yake;
//    asiyeiwasha anaingia moja kwa moja. Database inalinda vilevile (migration 38: aliyewasha 2FA anahitaji aal2).
//    Bila `only`: anapelekwa kwenye admin ya mgahawa wake (my_admin_restaurant). Na `only`: mgahawa huo tu.
//  * "platform": mmiliki wa jukwaa (/hq). Nenosiri + 2FA LAZIMA, bila Google. Asiye mmiliki anaona ujumbe uleule
//    wa "email au nenosiri si sahihi" (haijulikani kama ukurasa upo).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "./Lang";
import { getBrowserClient, type MyStaff } from "@/lib/supabase-browser";
import { adminCredsSchema, totpCodeSchema } from "@/lib/auth";
import { finishOAuth, startGoogle } from "@/lib/oauth";

type Step =
  | { kind: "creds" }
  | { kind: "verify"; factorId: string }
  | { kind: "enroll"; factorId: string; qr: string; secret: string };

const GENERIC_ERR = "Email au nenosiri si sahihi.";
const UNCONFIRMED = "Thibitisha email yako kwanza: fungua kiungo tulichokutumia kwenye email, kisha uingie.";
const NO_ENV = "Mipangilio ya mazingira (.env.local) haijakamilika.";

type Props = {
  mode: "restaurant" | "platform";
  appName: string;
  onOwner?: () => void;
  /** Ukurasa wa kuingia wa mgahawa mmoja (/<slug>/admin/login): admin wa mgahawa huo tu. */
  only?: { slug: string; restaurantId: string };
  /** Njia ya kurudi baada ya Google (ukurasa huu). Bila hii, kitufe cha Google hakionekani. */
  googleReturn?: string;
};

export default function MfaLoginForm({ mode, appName, onOwner, only, googleReturn }: Props) {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState<Step>({ kind: "creds" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const allowGoogle = mode === "restaurant" && Boolean(googleReturn);

  function client() {
    const b = getBrowserClient();
    return "error" in b ? null : b.client;
  }

  async function reset(message: string) {
    await client()?.auth.signOut();
    setStep({ kind: "creds" });
    setPassword("");
    setCode("");
    setErr(message);
  }

  async function enter() {
    const sb = client();
    if (!sb) return reset(NO_ENV);
    if (mode === "platform") {
      const { data } = await sb.rpc("platform_is_owner");
      if (data !== true) return reset(GENERIC_ERR);
      return onOwner?.();
    }
    if (only) {
      const { data } = await sb.rpc("my_staff");
      const me = (data as MyStaff[] | null)?.[0];
      // Admin wa mgahawa mwingine hapaswi kuingia hapa, hata akiwa na akaunti halali.
      if (!me || me.role !== "admin" || me.restaurant_id !== only.restaurantId) return reset("Akaunti hii si ya msimamizi wa mgahawa huu.");
      return router.replace(`/${only.slug}/admin`);
    }
    const { data } = await sb.rpc("my_admin_restaurant");
    const mine = (data as { slug: string }[] | null)?.[0];
    if (mine) return router.replace(`/${mine.slug}/admin`);
    // Aliyeingia kwa Google bila mgahawa: anaendelea kufungua mgahawa wake (kikao kinabaki).
    const { data: u } = await sb.auth.getUser();
    if (u.user?.app_metadata?.provider === "google") return router.replace("/signup");
    return reset("Akaunti hii haina mgahawa. Wahudumu wanaingia kwa namba ya simu na PIN kwenye ukurasa wa mgahawa.");
  }

  async function enroll() {
    const sb = client();
    if (!sb) return reset(NO_ENV);
    const { data: factors } = await sb.auth.mfa.listFactors();
    for (const f of factors?.all ?? []) {
      if (f.factor_type === "totp" && f.status === "unverified") await sb.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data: en, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: appName });
    if (error || !en) return reset("Imeshindwa kuandaa 2FA. Jaribu tena.");
    setStep({ kind: "enroll", factorId: en.id, qr: en.totp.qr_code, secret: en.totp.secret });
  }

  /** Baada ya nenosiri au Google: namba ya 2FA kama ameiwasha (au kama ni mmiliki wa jukwaa), vinginevyo ingia. */
  async function afterSignIn() {
    const sb = client();
    if (!sb) return reset(NO_ENV);
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") return enter();
    const { data: factors } = await sb.auth.mfa.listFactors();
    const verified = factors?.totp?.[0];
    if (verified) return setStep({ kind: "verify", factorId: verified.id });
    if (mode === "platform") return enroll();
    return enter();
  }

  // Kurudi kutoka Google (?code=): kubadilisha kuwa kikao kisha kuendelea kama baada ya nenosiri.
  useEffect(() => {
    if (!allowGoogle) return;
    const b = getBrowserClient();
    if ("error" in b) return;
    let live = true;
    void (async () => {
      const r = await finishOAuth(b.client);
      if (!live || r === "none") return;
      if (r !== "ok") return setErr(r);
      setBusy(true);
      try {
        await afterSignIn();
      } finally {
        if (live) setBusy(false);
      }
    })();
    return () => {
      live = false;
    };
    // afterSignIn inasoma hali ya sasa tu; inatosha kuiendesha mara moja baada ya kurudi kutoka Google.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowGoogle]);

  async function onGoogle() {
    const sb = client();
    if (!sb || !googleReturn || busy) return;
    setErr("");
    setBusy(true);
    const e = await startGoogle(sb, googleReturn);
    if (e) {
      setBusy(false);
      setErr(e);
    }
  }

  async function onCreds(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr("");
    if (!adminCredsSchema.safeParse({ email: email.trim(), password }).success) return setErr(GENERIC_ERR);
    const sb = client();
    if (!sb) return setErr(NO_ENV);
    setBusy(true);
    try {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return setErr(/not confirmed/i.test(error.message) ? UNCONFIRMED : GENERIC_ERR);
      await afterSignIn();
    } catch {
      setErr("Hakuna mtandao. Angalia muunganisho kisha jaribu tena.");
    } finally {
      setBusy(false);
    }
  }

  async function onCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy || step.kind === "creds") return;
    setErr("");
    if (!totpCodeSchema.safeParse(code).success) return setErr("Weka namba 6 kutoka kwenye programu ya 2FA.");
    const sb = client();
    if (!sb) return;
    setBusy(true);
    try {
      const { data: ch, error: ce } = await sb.auth.mfa.challenge({ factorId: step.factorId });
      if (ce || !ch) return setErr("Imeshindwa kuthibitisha. Jaribu tena.");
      const { error } = await sb.auth.mfa.verify({ factorId: step.factorId, challengeId: ch.id, code });
      if (error) {
        setCode("");
        return setErr("Namba si sahihi au imeisha muda. Subiri namba mpya kisha jaribu tena.");
      }
      await enter();
    } catch {
      setErr("Hakuna mtandao. Angalia muunganisho kisha jaribu tena.");
    } finally {
      setBusy(false);
    }
  }

  if (step.kind === "creds") {
    return (
      <>
        {allowGoogle && (
          <div className="gate-oauth">
            <button className="gate-google" type="button" onClick={() => void onGoogle()} disabled={busy}>
              <GoogleMark />
              {t("Endelea na Google")}
            </button>
            <p className="gate-or" aria-hidden="true"><span>{t("au")}</span></p>
          </div>
        )}
        <form className="gate-card" onSubmit={onCreds} noValidate>
          <label className="gate-label" htmlFor="email">{t("Email")}</label>
          <input id="email" className="gate-input" type="email" autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)} maxLength={200} />
          <label className="gate-label" htmlFor="password">{t("Nenosiri")}</label>
          <input id="password" className="gate-input" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} maxLength={200} />
          {err && <p className="gate-err" role="alert">{t(err)}</p>}
          <button className="gate-btn" type="submit" disabled={busy}>{busy ? t("Inaingia…") : t("Endelea")}</button>
        </form>
      </>
    );
  }

  return (
    <form className="gate-card" onSubmit={onCode} noValidate>
      {step.kind === "enroll" && (
        <>
          <p className="gate-help">
            <strong>{t("Hatua ya kwanza tu:")}</strong>{" "}
            {t("fungua programu ya 2FA (Google Authenticator au Authy) kwenye simu yako, changanua picha hii, kisha andika namba 6 inayoonekana.")}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gate-qr" src={step.qr} alt={t("QR ya kusajili programu ya 2FA")} width={180} height={180} />
          <p className="gate-help">
            {t("Huwezi kuchanganua? Andika ufunguo huu kwenye programu:")} <code className="gate-secret">{step.secret}</code>
          </p>
        </>
      )}
      {step.kind === "verify" && (
        <p className="gate-help">{t("Fungua programu yako ya 2FA kisha andika namba 6 ya")} <strong>{appName}</strong>.</p>
      )}
      <label className="gate-label" htmlFor="code">{t("Namba ya 2FA")}</label>
      <input id="code" className="gate-input gate-pin" type="text" inputMode="numeric" autoComplete="one-time-code"
        placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6} autoFocus />
      {err && <p className="gate-err" role="alert">{t(err)}</p>}
      <button className="gate-btn" type="submit" disabled={busy}>{busy ? t("Inathibitisha…") : t("Ingia")}</button>
      <button className="gate-link" type="button" onClick={() => reset("")}>{t("Rudi nyuma")}</button>
    </form>
  );
}

/** Nembo ya "G" ya Google (rangi zake rasmi zinahitajika na mwongozo wa kitufe cha Google). */
export function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
