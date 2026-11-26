// © Bright Abuu. Haki zote zimehifadhiwa.
// Ganda la tovuti ya masoko: metadataBase na mtindo wa tovuti tu. Muundo wa ukurasa (kichwa, sehemu, footer) uko kwenye
// _components/MarketingPage.tsx kwa sababu lugha inategemea URL: "/" ni Kiingereza (lugha kuu) na "/sw" ni Kiswahili.
// Muonekano ni wa brand "Tiketi + Ubao": tokens na fonti (Funnel Display/Sans, JetBrains Mono) zinatoka src/styles/brand.css
// kupitia class .lt kwenye mzizi wa ukurasa (MarketingPage.tsx); marketing.css haina rangi wala jina la fonti lililoandikwa.
import type { Metadata } from "next";
import { siteOrigin } from "./seo";
import "./marketing.css";

// metadataBase iko hapa (ngazi ya layout) ili URL ya picha ya OG (opengraph-image.tsx) nayo itumie domain kuu,
// si localhost wala URL ya Vercel. Metadata nyingine ya kila ukurasa iko kwenye page.tsx, en/page.tsx na seo.ts.
export const metadata: Metadata = { metadataBase: new URL(siteOrigin()) };

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
