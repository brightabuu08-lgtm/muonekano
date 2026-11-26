// (c) Bright Abuu. Haki zote zimehifadhiwa.
// Nembo ya jukwaa (tiketi yenye meno chini). Kwa kurasa za brand tu: masoko, Ingia, wahudumu, admin.
// Zebra na kurasa za mteja wa Premium hazitumii hii. Umbo na rangi zinatoka src/lib/brand.ts.
import { BRAND_NAME, LOGO_COLORS, LOGO_TICKET_PATH, LOGO_VIEWBOX, type BrandTone } from "@/lib/brand";

type Props = {
  /** "lt" kwenye mwanga, "dk" kwenye giza. */
  tone: BrandTone;
  /** Upana na urefu wa ikoni kwa px. */
  size?: number;
  /** Onyesha jina pembeni ya ikoni. Bila jina, ikoni inapata aria-label. */
  withName?: boolean;
  className?: string;
};

export function BrandMark({ tone, size = 32, withName = false, className }: Props) {
  const c = LOGO_COLORS[tone];
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      role={withName ? undefined : "img"}
      aria-label={withName ? undefined : BRAND_NAME}
      aria-hidden={withName ? true : undefined}
      focusable="false"
      className={withName ? undefined : className}
      style={{ flex: "none", display: "block" }}
    >
      <path d={LOGO_TICKET_PATH} fill={c.body} />
      <rect x="3" y="2" width="28" height="6" fill={c.stripe} />
      <rect x="8" y="13" width="18" height="2.6" rx="1.3" fill={c.line1} />
      <rect x="8" y="19" width="11" height="2.6" rx="1.3" fill={c.line2} opacity=".7" />
    </svg>
  );
  if (!withName) return icon;
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.22) }}>
      {icon}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: Math.round(size * 0.83),
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: "var(--fg)",
        }}
      >
        {BRAND_NAME}
      </span>
    </span>
  );
}
