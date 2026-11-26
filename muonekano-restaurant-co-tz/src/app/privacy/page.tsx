// © Bright Abuu. Haki zote zimehifadhiwa.
// restaurant.co.tz/privacy: Sera ya Faragha (Kiingereza na Kiswahili). Maandishi yanabadilishwa na mmiliki kwenye /hq.
import type { Metadata } from "next";
import LegalView from "../_components/LegalView";
import { BRAND_ICONS } from "@/lib/brand";
import { loadLegal } from "@/lib/legal-server";
import "../_components/legal.css";

// Badiliko la mmiliki linaonekana ndani ya dakika moja.
export const revalidate = 60;

export const metadata: Metadata = { title: "Privacy Policy · restaurant.co.tz", icons: BRAND_ICONS, alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const pages = await loadLegal("privacy");
  return <LegalView pages={pages} other={{ href: "/terms", en: "Terms of Service", sw: "Masharti ya Matumizi" }} />;
}
