"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Fomu ya kujiunga (Standard): Google AU email + nenosiri, kisha muonekano → jina na anwani → nembo → Turnstile.
//  * Google: mtumiaji anaingia kwanza (anarudi hapa na ?code=), kisha anajaza mgahawa tu; hakuna email ya kuthibitisha.
//  * Email: email ya kuthibitisha inatumwa (Resend); anaingia baada ya kuthibitisha.
// Server (signup-restaurant) ndiyo inayoamua kila kitu; hapa ni ukaguzi wa mapema na ujumbe unaoeleweka.
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "../_components/Lang";
import { GoogleMark } from "../_components/MfaLoginForm";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getEnv } from "@/lib/env";
import { getDeviceId } from "@/lib/place-order";
import { finishOAuth, startGoogle } from "@/lib/oauth";
import { themesOfPlan } from "@/themes/catalog";
import { Turnstile } from "@/themes/shared/order/Turnstile";
import {
  LOGO_TYPES,
  SLUG_RE,
  buildSignupGooglePayload,
  buildSignupPayload,
  postSignup,
  slugify,
  validateSignup,
  type SignupErrors,
  type SignupForm,
} from "@/lib/signup";

type SlugState = "idle" | "checking" | "free" | "taken";

export default function JiungeForm() {
  const t = useT();
  const router = useRouter();
  const themes = themesOfPlan("standard");
  const appEnv = getEnv();
  const siteKey = appEnv.success ? (appEnv.data.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null) : null;

  const [form, setForm] = useState<SignupForm>({ name: "", slug: "", email: "", password: "", password2: "", theme: themes[0]?.key ?? "default" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugCheck, setSlugCheck] = useState<{ slug: string; state: SlugState } | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [token, setToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaProblem, setCaptchaProblem] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [google, setGoogle] = useState<{ email: string } | null>(null);
  const [done, setDone] = useState<{ slug: string; email: string; logoFailed: boolean; confirm: boolean } | null>(null);

  const set = <K extends keyof SignupForm>(k: K, v: SignupForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Kurudi kutoka Google, au kikao cha Google kilichopo: anajiunga kama mtumiaji huyo.
  // Akiwa tayari na mgahawa, anapelekwa kwenye admin yake.
  useEffect(() => {
    const b = getBrowserClient();
    if ("error" in b) return;
    let live = true;
    void (async () => {
      const r = await finishOAuth(b.client);
      if (!live) return;
      if (r !== "none" && r !== "ok") return setFailure(r);
      const { data } = await b.client.auth.getUser();
      const u = data.user;
      if (!live || !u || u.app_metadata?.provider !== "google" || !u.email) return;
      const { data: mine } = await b.client.rpc("my_admin_restaurant");
      const slug = (mine as { slug: string }[] | null)?.[0]?.slug;
      if (slug) return router.replace(`/${slug}/admin`);
      if (live) setGoogle({ email: u.email });
    })();
    return () => {
      live = false;
    };
  }, [router]);

  async function onGoogle() {
    const b = getBrowserClient();
    if ("error" in b || sending) return;
    setFailure(null);
    setSending(true);
    const e = await startGoogle(b.client, "/signup");
    if (e) {
      setSending(false);
      setFailure(t(e));
    }
  }

  async function leaveGoogle() {
    const b = getBrowserClient();
    if (!("error" in b)) await b.client.auth.signOut();
    setGoogle(null);
  }

  // Anwani inafuata jina mpaka mtu aiandike mwenyewe.
  function onName(v: string) {
    setForm((f) => ({ ...f, name: v, slug: slugEdited ? f.slug : slugify(v) }));
  }

  // Ukaguzi wa anwani wakati wa kuandika (database ndiyo jibu la mwisho wakati wa kutuma).
  useEffect(() => {
    const slug = form.slug;
    if (!SLUG_RE.test(slug)) return;
    const b = getBrowserClient();
    if ("error" in b) return;
    let live = true;
    const timer = setTimeout(async () => {
      const { data, error } = await b.client.rpc("slug_available", { p_slug: slug });
      if (live) setSlugCheck({ slug, state: error ? "idle" : data === true ? "free" : "taken" });
    }, 400);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [form.slug]);
  const slugState: SlugState = !SLUG_RE.test(form.slug) ? "idle" : slugCheck?.slug === form.slug ? slugCheck.state : "checking";

  const fieldProps = (k: keyof SignupErrors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `jn-err-${k}` : undefined,
  });
  const fieldError = (k: keyof SignupErrors) =>
    errors[k] ? <p id={`jn-err-${k}`} className="gate-err" role="alert">{t(String(errors[k]))}</p> : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setFailure(null);
    const errs = validateSignup(form, logo ? { type: logo.type, size: logo.size } : null, { google: Boolean(google) });
    if (slugState === "taken" && !errs.slug) errs.slug = "Anwani hii imeshachukuliwa. Chagua nyingine.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!token) return setFailure(t("Subiri uthibitisho wa usalama ukamilike kisha ubonyeze tena."));
    const b = getBrowserClient();
    if ("error" in b) return setFailure(t("Kujiunga hakupatikani sasa hivi. Jaribu tena baadaye."));

    setSending(true);
    let accessToken: string | undefined;
    if (google) {
      const { data } = await b.client.auth.getSession();
      accessToken = data.session?.access_token;
      if (!accessToken) {
        setSending(false);
        setGoogle(null);
        return setFailure(t("Kikao cha Google kimeisha. Bonyeza Endelea na Google tena."));
      }
    }
    const res = await postSignup(
      { url: b.url, anonKey: b.anonKey, accessToken },
      google
        ? buildSignupGooglePayload(form, logo?.type ?? null, getDeviceId(), token)
        : buildSignupPayload(form, logo?.type ?? null, getDeviceId(), token),
    );
    setToken(null);
    setCaptchaKey((k) => k + 1);
    if (!res.ok) {
      setSending(false);
      if (res.code === "slug_taken") {
        setSlugCheck({ slug: form.slug, state: "taken" });
        setErrors({ slug: res.message });
        return;
      }
      return setFailure(t(res.message));
    }

    let logoFailed = false;
    if (logo && res.logo) {
      const up = await b.client.storage.from("menu").uploadToSignedUrl(res.logo.path, res.logo.token, logo, { contentType: logo.type });
      logoFailed = Boolean(up.error);
    }
    setSending(false);
    setDone({ slug: res.slug, email: google?.email ?? form.email.trim().toLowerCase(), logoFailed, confirm: res.confirm });
  }

  if (done) {
    return (
      <div className="jn-done" role="status">
        {done.confirm ? (
          <>
            <h2>{t("Angalia email yako")}</h2>
            <p>{t("Tumetuma kiungo cha kuthibitisha kwa {email}. Kifungue, kisha uingie.", { email: done.email })}</p>
          </>
        ) : (
          <h2>{t("Mgahawa wako uko tayari")}</h2>
        )}
        <p>{t("Menyu yako itakuwa:")} <code className="gate-secret">restaurant.co.tz/{done.slug}</code></p>
        {done.logoFailed && <p className="gate-err">{t("Nembo haikupakiwa. Utaiweka tena kwenye admin, sehemu ya Kifurushi.")}</p>}
        {done.confirm ? (
          <Link className="gate-btn jn-btnlink" href="/login">{t("Nenda kuingia")}</Link>
        ) : (
          <Link className="gate-btn jn-btnlink" href={`/${done.slug}/admin`}>{t("Nenda kwenye admin uongeze vyakula")}</Link>
        )}
      </div>
    );
  }

  return (
    <>
      {google ? (
        <div className="jn-as" role="status">
          <span>{t("Unajiunga kama")} <b>{google.email}</b></span>
          <button className="gate-link" type="button" onClick={() => void leaveGoogle()}>{t("Badilisha")}</button>
        </div>
      ) : (
        <div className="gate-oauth">
          <button className="gate-google" type="button" onClick={() => void onGoogle()} disabled={sending}>
            <GoogleMark />
            {t("Endelea na Google")}
          </button>
          <p className="gate-or" aria-hidden="true"><span>{t("au jaza fomu")}</span></p>
        </div>
      )}

      <form className="gate-card" onSubmit={submit} noValidate>
        <fieldset className="jn-themes">
          <legend className="gate-label">{t("Muonekano wa menyu")}</legend>
          {themes.map((th) => (
            <label key={th.key} className="jn-theme">
              <input type="radio" name="theme" value={th.key} checked={form.theme === th.key} onChange={() => set("theme", th.key)} />
              <span className="jn-swatch" aria-hidden="true">
                {th.swatch.map((c) => <i key={c} style={{ background: c }} />)}
              </span>
              <span className="jn-theme-txt">
                <b>{t(th.name)}</b>
                <small>{t(th.blurb)}</small>
              </span>
            </label>
          ))}
          {fieldError("theme")}
        </fieldset>

        <label className="gate-label" htmlFor="jn-name">{t("Jina la mgahawa")}</label>
        <input id="jn-name" className="gate-input" value={form.name} maxLength={80} autoComplete="organization"
          onChange={(e) => onName(e.target.value)} {...fieldProps("name")} />
        {fieldError("name")}

        <label className="gate-label" htmlFor="jn-slug">{t("Anwani ya menyu")}</label>
        <div className="jn-slug">
          <span aria-hidden="true">restaurant.co.tz/</span>
          <input id="jn-slug" className="gate-input" value={form.slug} maxLength={40} autoCapitalize="none" spellCheck={false}
            onChange={(e) => { setSlugEdited(true); set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }}
            {...fieldProps("slug")} />
        </div>
        {!errors.slug && slugState !== "idle" && (
          <p className={slugState === "taken" ? "gate-err" : "gate-help"} aria-live="polite">
            {slugState === "checking" ? t("Inaangalia…") : slugState === "free" ? t("Anwani hii ipo wazi.") : t("Anwani hii imeshachukuliwa. Chagua nyingine.")}
          </p>
        )}
        {fieldError("slug")}

        <label className="gate-label" htmlFor="jn-logo">{t("Nembo (si lazima)")}</label>
        <input id="jn-logo" className="gate-input jn-file" type="file" accept={LOGO_TYPES.join(",")}
          onChange={(e) => setLogo(e.target.files?.[0] ?? null)} {...fieldProps("logo")} />
        <p className="gate-help">{t("JPG, PNG au WebP, hadi MB 2.")}</p>
        {fieldError("logo")}

        {!google && (
          <>
            <label className="gate-label" htmlFor="jn-email">{t("Email ya admin")}</label>
            <input id="jn-email" className="gate-input" type="email" autoComplete="email" value={form.email} maxLength={254}
              onChange={(e) => set("email", e.target.value)} {...fieldProps("email")} />
            {fieldError("email")}

            <label className="gate-label" htmlFor="jn-pass">{t("Nenosiri")}</label>
            <input id="jn-pass" className="gate-input" type="password" autoComplete="new-password" value={form.password} maxLength={200}
              onChange={(e) => set("password", e.target.value)} {...fieldProps("password")} />
            <p className="gate-help">{t("Angalau herufi 12.")}</p>
            {fieldError("password")}

            <label className="gate-label" htmlFor="jn-pass2">{t("Rudia nenosiri")}</label>
            <input id="jn-pass2" className="gate-input" type="password" autoComplete="new-password" value={form.password2} maxLength={200}
              onChange={(e) => set("password2", e.target.value)} {...fieldProps("password2")} />
            {fieldError("password2")}
          </>
        )}

        <div className="jn-captcha">
          {siteKey ? (
            <Turnstile key={captchaKey} siteKey={siteKey} onToken={setToken} onProblem={() => setCaptchaProblem(true)} />
          ) : (
            <p className="gate-err">{t("Kujiunga hakupatikani sasa hivi. Jaribu tena baadaye.")}</p>
          )}
          {captchaProblem && siteKey && (
            <p className="gate-err" role="alert">{t("Uthibitisho wa usalama haukupakia. Angalia mtandao wako, pakia ukurasa upya kisha ujaribu tena.")}</p>
          )}
        </div>

        {failure && <p className="gate-err" role="alert">{failure}</p>}
        <button className="gate-btn" type="submit" disabled={sending || !siteKey}>
          {sending ? t("Inafungua…") : t("Fungua mgahawa")}
        </button>
        <p className="gate-help">
          {google
            ? t("Menyu inaanza kufanya kazi mara moja ukiongeza vyakula. 2FA ni ya hiari: unaweza kuiwasha kwenye admin.")
            : t("Utapokea email ya kuthibitisha. Menyu inaanza kufanya kazi mara moja ukiongeza vyakula.")}
        </p>
        <p className="gate-help jn-legal">
          {t("Kwa kufungua mgahawa, unakubali")}{" "}
          <Link href="/terms" target="_blank">{t("Masharti ya Matumizi")}</Link>{" "}
          {t("na")}{" "}
          <Link href="/privacy" target="_blank">{t("Sera ya Faragha")}</Link>.
        </p>
      </form>
    </>
  );
}
