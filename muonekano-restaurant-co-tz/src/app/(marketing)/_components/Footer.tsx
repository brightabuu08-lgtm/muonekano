// © Bright Abuu. Haki zote zimehifadhiwa.
// Chini ya ukurasa (mwanga): nembo ya brand, viungo vya sehemu, kitufe cha lugha, mitandao ya kijamii (nafasi za kujazwa) na haki miliki.
import { BrandMark } from "@/app/_components/BrandMark";
import { copy } from "../copy";
import { LangSwitch, Loc, Tr } from "../mk-lang";
import { isFilled, siteConfig } from "../site-config";

const LINKS = [
  { href: "#how", label: copy.nav.how },
  { href: "#features", label: copy.nav.features },
  { href: "#plans", label: copy.nav.plans },
  { href: "#premium", label: copy.nav.showcase },
  { href: "#faq", label: copy.nav.faq },
] as const;

export function Footer() {
  const f = copy.footer;
  return (
    <footer className="mk-footer">
      <div className="mk-wrap mk-footer-in">
        <div className="mk-footer-brand">
          <BrandMark tone="lt" withName />
          <p>
            <Tr>{f.tagline}</Tr>
          </p>
        </div>
        <nav aria-labelledby="footer-nav-title" className="mk-footer-nav">
          <h2 id="footer-nav-title" className="mk-sr">
            <Tr>{copy.ui.footerNavLabel}</Tr>
          </h2>
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>
                  <Tr>{l.label}</Tr>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mk-footer-side">
          <LangSwitch className="mk-lang mk-lang-footer" />
          <h2 id="footer-social-title" className="mk-sr">
            <Tr>{f.social}</Tr>
          </h2>
          <ul className="mk-social" aria-labelledby="footer-social-title">
            {/* Mitandao isiyo na anwani bado haionyeshwi kabisa (mgeni asione jina lisilofunguka). */}
            {siteConfig.social
              .filter((s) => isFilled(s.url))
              .map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="mk-wrap">
        <p className="mk-copy">
          <Loc value={{ sw: siteConfig.copyright, en: siteConfig.copyrightEn }} />
        </p>
      </div>
    </footer>
  );
}
