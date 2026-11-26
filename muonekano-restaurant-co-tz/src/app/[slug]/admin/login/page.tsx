// © Bright Abuu. Haki zote zimehifadhiwa.
// Ingia ya admin: brand "Tiketi + Ubao" kwa giza (.dk), sawa kwa kila mgahawa (Standard na Premium). Mantiki ya 2FA iko AdminLoginForm.
import type { Metadata } from "next";
import { BrandMark } from "../../../_components/BrandMark";
import { LangToggle } from "../../../_components/Lang";
import { Tr } from "../../../_components/Tr";
import { BRAND_ICONS } from "@/lib/brand";
import { pageRestaurant, type SlugParams } from "../../_restaurant";
import AdminLoginForm from "./AdminLoginForm";
import "./login.css";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const r = await pageRestaurant(params);
  return { title: `Ingia · Msimamizi — ${r.displayName}`, robots: { index: false }, icons: BRAND_ICONS };
}

export default async function AdminLoginPage({ params }: SlugParams) {
  const restaurant = await pageRestaurant(params);
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
        <p className="adl-for">{restaurant.displayName}</p>
        <h1><Tr>Ingia · Msimamizi</Tr></h1>
        <AdminLoginForm slug={restaurant.slug} restaurantId={restaurant.id} appName={restaurant.displayName} />
        <div className="adl-note">
          <p><Tr>Ukurasa huu ni wa msimamizi peke yake. Ukiwasha 2FA, utaulizwa pia namba kutoka kwenye programu yako.</Tr></p>
        </div>
      </div>
    </main>
  );
}
