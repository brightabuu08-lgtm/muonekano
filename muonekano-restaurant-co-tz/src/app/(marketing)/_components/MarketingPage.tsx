// © Bright Abuu. Haki zote zimehifadhiwa.
// Ukurasa mzima wa masoko kwa lugha moja: kiungo cha "ruka hadi maudhui", kichwa kinachobaki juu, sehemu zote, footer na kitufe cha chini cha simu.
// "/" unatumia lang="en" (lugha kuu) na "/sw" unatumia lang="sw"; muundo ni uleule, ni lugha tu inayobadilika (na inatoka seva).
// Mzizi una "mk lt": .lt ni tokens za mwanga za brand (src/styles/brand.css); sehemu za giza zinaweka .dk wenyewe.
import type { Lang } from "@/lib/i18n";
import { copy } from "../copy";
import { MkLang, Tr } from "../mk-lang";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { Footer } from "./Footer";
import { Header, StickyCta } from "./Header";
import { Hero } from "./Hero";
import { Plans, Setup } from "./Plans";
import { Showcase } from "./Showcase";
import { Features, How, Problem } from "./Story";
import { Views } from "./Views";

export function MarketingPage({ lang }: { lang: Lang }) {
  return (
    <MkLang lang={lang}>
      <div id="top" className="mk lt" lang={lang}>
        <a className="mk-skip" href="#main">
          <Tr>{copy.ui.skip}</Tr>
        </a>
        <Header />
        <main id="main" className="mk-main">
          <Hero />
          <Problem />
          <How />
          <Features />
          <Views />
          <Plans />
          <Setup />
          <Showcase />
          <Faq />
          <Contact />
        </main>
        <Footer />
        <StickyCta />
      </div>
    </MkLang>
  );
}
