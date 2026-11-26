// © Bright Abuu. Haki zote zimehifadhiwa.
import type { CSSProperties } from "react";
import { readableOn } from "@/lib/color";
import { LangToggle } from "@/app/_components/Lang";
import { Tr } from "@/app/_components/Tr";
import type { GateProps } from "../types";
import "./default.css";

export const DEFAULT_ACCENT = "#1f2937";

/** Rangi kuu ya mgahawa (iliyothibitishwa kuwa #rrggbb) na rangi ya maandishi juu yake, kama vigezo vya CSS. */
export function accentStyle(brandColor: string | null): CSSProperties {
  const accent = brandColor ?? DEFAULT_ACCENT;
  return { "--g-accent": accent, "--g-on": readableOn(accent) } as CSSProperties;
}

/** Muonekano wa pamoja kwa migahawa ya kawaida: safi na rahisi, ukitumia jina na rangi kuu ya mgahawa tu. */
export function Gate({ restaurant, title, children }: GateProps) {
  return (
    <div className="gate-page" data-theme="default" style={accentStyle(restaurant.brandColor)}>
      <header className="dgate-hero">
        <LangToggle className="gate-lang" />
        <span className="dgate-mark" aria-hidden="true">{restaurant.displayName.trim().charAt(0).toUpperCase()}</span>
        <p className="dgate-eyebrow">{restaurant.displayName}</p>
        <h1><Tr>{title}</Tr></h1>
      </header>
      <main className="gate-body">{children}</main>
    </div>
  );
}
