// © Bright Abuu. Haki zote zimehifadhiwa.
// restaurant.co.tz/hq: dashboard ya mmiliki wa jukwaa. Haionekani kwenye injini za utafutaji, haina kiungo popote.
// Ulinzi: nenosiri + 2FA, kisha database inakagua orodha ya wamiliki (app.platform_admins) kwa kila ombi.
// Asiye mmiliki anaona ujumbe uleule wa "email au nenosiri si sahihi".
import type { Metadata } from "next";
import { BRAND_ICONS } from "@/lib/brand";
import JukwaaApp from "./JukwaaApp";
import "../[slug]/admin/login/login.css";
import "../_components/admin-brand.css";
import "./hq.css";

export const metadata: Metadata = {
  title: "HQ",
  robots: { index: false, follow: false, nocache: true },
  icons: BRAND_ICONS,
  referrer: "no-referrer",
};

export default function JukwaaPage() {
  return <JukwaaApp />;
}
