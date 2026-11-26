// © Bright Abuu. Haki zote zimehifadhiwa.
// restaurant.co.tz/login: admin yeyote anaingia hapa bila kujua anwani ya mgahawa wake. Baada ya nenosiri na 2FA
// anapelekwa /<slug>/admin. Muonekano ni uleule wa ingia ya admin ([slug]/admin/login, brand "Tiketi + Ubao" kwa giza).
import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../_components/BrandMark";
import { LangToggle } from "../_components/Lang";
import { Tr } from "../_components/Tr";
import MfaLoginForm from "../_components/MfaLoginForm";
import { BRAND_ICONS, BRAND_NAME } from "@/lib/brand";
import "../[slug]/admin/login/login.css";

export const metadata: Metadata = { title: "Ingia · Msimamizi", robots: { index: false }, icons: BRAND_ICONS };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function IngiaPage({ searchParams }: Props) {
  const welcome = (await searchParams).welcome === "1";
  return (
    <main className="adl dk">
      <div className="adl-hero">
        <BrandMark tone="dk" size={32} withName />
        <div className="adl-ticket" aria-hidden="true">
          <b><Tr>Mpya</Tr></b>
          <i />
          <i />
        </div>
        <p className="adl-headline"><Tr>Oda za leo zinakusubiri.</Tr></p>
      </div>
      <div className="adl-panel">
        <LangToggle className="adl-lang" />
        <p className="adl-for">{BRAND_NAME}</p>
        <h1><Tr>Ingia · Msimamizi</Tr></h1>
        {welcome && (
          <div className="adl-note" role="status">
            <p><Tr>Email imethibitishwa. Ingia sasa na uanze kuongeza vyakula.</Tr></p>
          </div>
        )}
        <MfaLoginForm mode="restaurant" appName={BRAND_NAME} googleReturn="/login" />
        <div className="adl-note">
          <p>
            <Tr>Huna mgahawa bado?</Tr> <Link href="/signup"><Tr>Fungua mgahawa wako</Tr></Link>
          </p>
        </div>
      </div>
    </main>
  );
}
