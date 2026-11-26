// (c) Bright Abuu. Haki zote zimehifadhiwa.
// Ukurasa mkuu "/" wa tovuti ya masoko, kwa Kiingereza (lugha kuu ya mfumo). Toleo la Kiswahili liko /sw (sw/page.tsx).
// Mgahawa wa mfano unabaki kwenye /zebra.
import type { Metadata } from "next";
import { MarketingPage } from "./_components/MarketingPage";
import { marketingMetadata, siteOrigin } from "./seo";
import { siteConfig } from "./site-config";

// Metadata ya Kiingereza, pamoja na canonical na hreflang (en, sw, x-default). Maelezo kamili yako kwenye seo.ts.
export const metadata: Metadata = marketingMetadata(siteOrigin(), siteConfig, "en");

export default function MarketingHome() {
  return <MarketingPage lang="en" />;
}
