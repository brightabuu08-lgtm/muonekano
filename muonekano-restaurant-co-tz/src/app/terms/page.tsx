// © Bright Abuu. Haki zote zimehifadhiwa.
// restaurant.co.tz/terms: Masharti ya Matumizi (Kiingereza na Kiswahili). Maandishi yanabadilishwa na mmiliki kwenye /hq.
import type { Metadata } from "next";
import LegalView from "../_components/LegalView";
import { BRAND_ICONS } from "@/lib/brand";
import { loadLegal } from "@/lib/legal-server";
import "../_components/legal.css";

// Badiliko la mmiliki linaonekana ndani ya dakika moja.
export const revalidate = 60;

export const metadata: Metadata = { title: "Terms of Service · restaurant.co.tz", icons: BRAND_ICONS, alternates: { canonical: "/terms" } };

export default async function TermsPage() {
  const pages = await loadLegal("terms");
  return <LegalView pages={pages} other={{ href: "/privacy", en: "Privacy Policy", sw: "Sera ya Faragha" }} />;
}
