// © Bright Abuu. Haki zote zimehifadhiwa.
// restaurant.co.tz/signup: mgahawa wa Standard unajifungulia nafasi yake (muonekano, jina, nembo, email ya admin, nenosiri).
// Muonekano ni wa ingia ya admin (.adl dk). Kazi yote inafanywa na Edge Function signup-restaurant.
import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../_components/BrandMark";
import { LangToggle } from "../_components/Lang";
import { Tr } from "../_components/Tr";
import { BRAND_ICONS } from "@/lib/brand";
import JiungeForm from "./JiungeForm";
import "../[slug]/admin/login/login.css";
import "./signup.css";

export const metadata: Metadata = { title: "Fungua mgahawa wako", icons: BRAND_ICONS };

export default function JiungePage() {
  return (
    <main className="adl dk">
      <div className="adl-hero">
        <BrandMark tone="dk" size={32} withName />
        <div className="adl-ticket" aria-hidden="true">
          <b><Tr>Mpya</Tr></b>
          <i />
          <i />
        </div>
        <p className="adl-headline"><Tr>Menyu yako mtandaoni leo.</Tr></p>
      </div>
      <div className="adl-panel">
        <LangToggle className="adl-lang" />
        <p className="adl-for">Standard</p>
        <h1><Tr>Fungua mgahawa wako</Tr></h1>
        <JiungeForm />
        <div className="adl-note">
          <p>
            <Tr>Una mgahawa tayari?</Tr> <Link href="/login"><Tr>Ingia</Tr></Link>
          </p>
        </div>
      </div>
    </main>
  );
}
