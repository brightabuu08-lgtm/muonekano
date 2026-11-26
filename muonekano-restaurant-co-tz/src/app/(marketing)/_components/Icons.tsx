// © Bright Abuu. Haki zote zimehifadhiwa.
// Ikoni rahisi za SVG (mstari mmoja, 24x24). Ni mapambo tu: zimefichwa kwa visomaji vya skrini, maandishi yanabeba maana.
import type { ReactNode } from "react";

export type IconName = "qr" | "order" | "calendar" | "live" | "dashboard" | "edit" | "staff" | "lang" | "shield" | "check" | "lock" | "whatsapp" | "mail" | "menu" | "close" | "plus" | "arrow";

const PATHS: Record<IconName, ReactNode> = {
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2.5v2.5M20.5 14.5v.01M14.5 20.5h.01M17.5 20.5h3v-3" />
    </>
  ),
  order: (
    <>
      <path d="M6 3.5h12v17l-2.2-1.5-1.9 1.5-1.9-1.5-1.9 1.5L8.2 19 6 20.5z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8 14h2.5M13.5 14H16M8 17h2.5" />
    </>
  ),
  live: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="9" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="5.5" rx="1.5" />
      <rect x="13" y="11" width="7.5" height="9.5" rx="1.5" />
      <rect x="3.5" y="14.5" width="7.5" height="6" rx="1.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z" />
      <path d="M13.5 7.5l3 3M12 20h8" />
    </>
  ),
  staff: (
    <>
      <circle cx="9" cy="8.5" r="3.3" />
      <path d="M3 20c.4-3.6 2.9-5.6 6-5.6s5.6 2 6 5.6" />
      <path d="M16.5 5.6a3.1 3.1 0 0 1 0 5.8M18 14.7c1.6.7 2.7 2.4 3 5.3" />
    </>
  ),
  lang: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 2.7v5.6c0 4.5-3 8.2-7.5 9.7-4.5-1.5-7.5-5.2-7.5-9.7V5.7z" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.2-4.1A8.2 8.2 0 1 1 8.2 19z" />
      <path d="M9.2 8.8c.2 2.8 2.6 5.2 5.8 6l1.3-1.3-2-1-1 .7c-.9-.4-1.7-1.2-2.1-2.1l.7-1-1-2z" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
