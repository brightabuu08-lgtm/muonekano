// (c) Bright Abuu. Haki zote zimehifadhiwa.
// Ukurasa wa Kiswahili "/sw" wa tovuti ya masoko: muundo uleule wa "/" (Kiingereza, lugha kuu), maandishi na metadata kwa Kiswahili.
// Slug "sw" imezuiwa kwa migahawa (migration 20), kwa hiyo /sw haigongani na /[slug].
import type { Metadata } from "next";
import { MarketingPage } from "../_components/MarketingPage";
import { marketingMetadata, siteOrigin } from "../seo";
import { siteConfig } from "../site-config";

export const metadata: Metadata = marketingMetadata(siteOrigin(), siteConfig, "sw");

export default function MarketingHomeSw() {
  return <MarketingPage lang="sw" />;
}
