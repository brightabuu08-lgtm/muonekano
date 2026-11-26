"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Kichwa kinachobaki juu (nav ya sehemu, SW | EN, "Omba demo") na kitufe cha "Omba demo" kinachobaki chini kwenye simu.
// Kitufe cha lugha ni cha mk-lang.tsx: muonekano uleule wa mfumo mzima, kinahamisha kati ya "/" (Kiingereza) na "/sw" na kuhifadhi chaguo kwa /zebra.
import { useEffect, useState } from "react";
import { BrandMark } from "@/app/_components/BrandMark";
import { copy } from "../copy";
import { LangSwitch, useT } from "../mk-lang";
import { Icon } from "./Icons";

const LINKS = [
  { href: "#how", label: copy.nav.how },
  { href: "#features", label: copy.nav.features },
  { href: "#plans", label: copy.nav.plans },
  { href: "#premium", label: copy.nav.showcase },
  { href: "#faq", label: copy.nav.faq },
] as const;

export function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="mk-header">
      <div className="mk-wrap mk-header-in">
        <a className="mk-brand" href="#top">
          <BrandMark tone="lt" withName />
        </a>
        <nav className="mk-nav" aria-label={t(copy.ui.navLabel)}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {t(l.label)}
            </a>
          ))}
        </nav>
        <div className="mk-header-end">
          <LangSwitch className="mk-lang" />
          <a className="mk-btn mk-btn-primary mk-btn-sm mk-only-wide" href="#contact">
            {t(copy.ui.demoCta)}
          </a>
          <button
            type="button"
            className="mk-iconbtn mk-only-narrow"
            aria-expanded={open}
            aria-controls="mk-drawer"
            aria-label={t(open ? copy.ui.closeNav : copy.ui.openNav)}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      <div id="mk-drawer" className="mk-drawer" hidden={!open}>
        <ul className="mk-wrap">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {t(l.label)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/** Kitufe cha "Omba demo" kinachobaki chini ya skrini ya simu; kinajificha fomu ikionekana. */
export function StickyCta() {
  const t = useT();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setHidden(Boolean(entry?.isIntersecting)), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`mk-sticky${hidden ? " is-hidden" : ""}`}>
      <a className="mk-btn mk-btn-primary mk-btn-block" href="#contact" tabIndex={hidden ? -1 : undefined}>
        {t(copy.ui.demoCta)}
      </a>
    </div>
  );
}
