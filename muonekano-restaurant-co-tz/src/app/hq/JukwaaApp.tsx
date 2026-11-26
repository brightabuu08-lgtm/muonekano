"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Ganda la /hq: kikao kilichopo (2FA kamili + mmiliki) kinafungua dashboard moja kwa moja; vinginevyo fomu ya kuingia.
import { useCallback, useEffect, useState } from "react";
import { BrandMark } from "../_components/BrandMark";
import { LangToggle, useT } from "../_components/Lang";
import MfaLoginForm from "../_components/MfaLoginForm";
import { getBrowserClient } from "@/lib/supabase-browser";
import { BRAND_NAME } from "@/lib/brand";
import PlatformDashboard from "./PlatformDashboard";

type State = "checking" | "login" | "owner";

export default function JukwaaApp() {
  const t = useT();
  const [state, setState] = useState<State>("checking");
  const toLogin = useCallback(() => setState("login"), []);

  useEffect(() => {
    let live = true;
    const check = async (): Promise<State> => {
      const b = getBrowserClient();
      if ("error" in b) return "login";
      const { data } = await b.client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data?.currentLevel !== "aal2") return "login";
      const { data: owner } = await b.client.rpc("platform_is_owner");
      return owner === true ? "owner" : "login";
    };
    void check().then((s) => { if (live) setState(s); });
    return () => { live = false; };
  }, []);

  async function signOut() {
    const b = getBrowserClient();
    if (!("error" in b)) await b.client.auth.signOut();
    setState("login");
  }

  if (state === "checking") {
    return (
      <div className="adm-page adm-dk dk">
        <p className="adm-loading" aria-live="polite">{t("Inapakia.")}</p>
      </div>
    );
  }

  if (state === "login") {
    return (
      <main className="adl dk">
        <div className="adl-hero">
          <BrandMark tone="dk" size={32} withName />
        </div>
        <div className="adl-panel">
          <LangToggle className="adl-lang" />
          <p className="adl-for">{BRAND_NAME}</p>
          <h1>{t("Ingia")}</h1>
          <MfaLoginForm mode="platform" appName={BRAND_NAME} onOwner={() => setState("owner")} />
        </div>
      </main>
    );
  }

  return (
    <div className="adm-page adm-dk dk jk">
      <header className="jk-top">
        <BrandMark tone="dk" size={28} withName />
        <span className="adm-sp" />
        <LangToggle className="adm-lang" />
        <button className="adm-signout" type="button" onClick={signOut}>{t("Toka")}</button>
      </header>
      <main className="adm-content jk-main">
        <PlatformDashboard onSignedOut={toLogin} />
      </main>
    </div>
  );
}
