"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Ukurasa wa kisheria (/privacy, /terms) kwa lugha iliyochaguliwa. Maandishi yanaonyeshwa kama maandishi tu (si HTML).
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LangToggle, useLang } from "./Lang";
import { legalDate, parseLegalBody, type LegalPage } from "@/lib/legal";
import { siteConfig } from "@/app/(marketing)/site-config";

type Props = { pages: LegalPage[]; other: { href: string; en: string; sw: string } };

export default function LegalView({ pages, other }: Props) {
  const lang = useLang();
  const page = pages.find((p) => p.lang === lang) ?? pages[0];
  const sw = lang === "sw";

  return (
    <main className="lgl lt">
      <header className="lgl-top">
        <Link href={sw ? "/sw" : "/"} className="lgl-home" aria-label={sw ? "Ukurasa wa mwanzo" : "Home"}>
          <BrandMark tone="lt" size={28} withName />
        </Link>
        <LangToggle className="lgl-lang" />
      </header>
      <article className="lgl-doc">
        {page ? (
          <>
            <h1>{page.title}</h1>
            <p className="lgl-date">
              {sw ? "Imesasishwa: " : "Last updated: "}
              {legalDate(page.updatedAt, page.lang)}
            </p>
            {parseLegalBody(page.body).map((b, i) =>
              b.kind === "h" ? (
                <h2 key={i}>{b.text}</h2>
              ) : b.kind === "p" ? (
                <p key={i}>{b.text}</p>
              ) : (
                <ul key={i}>
                  {b.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              ),
            )}
          </>
        ) : (
          <p>{sw ? "Ukurasa huu haupatikani kwa sasa. Jaribu tena baadaye." : "This page is not available right now. Please try again later."}</p>
        )}
      </article>
      <footer className="lgl-foot">
        <Link href={other.href}>{sw ? other.sw : other.en}</Link>
        <span aria-hidden="true">·</span>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </footer>
    </main>
  );
}
