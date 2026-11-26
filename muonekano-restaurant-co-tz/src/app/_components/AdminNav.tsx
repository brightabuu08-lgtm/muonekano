"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Menyu ya upande ya admin: kuhamia kati ya sehemu. Ukurasa wa sasa unaonyeshwa kwa aria-current na nukta ya signal,
// na kila sehemu yenye kitu kipya inaonyesha idadi yake. "Mipangilio" inashikilia kurasa za QR, Kifurushi na Usalama.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FeedCounts } from "@/lib/admin-feed";
import { useAdminData } from "./AdminData";
import AdminIcon, { type AdminIconName } from "./AdminIcons";
import { useT } from "./Lang";

type Section = { path: string; label: string; icon: AdminIconName; count?: keyof FeedCounts; also?: string[] };

const SECTIONS: Section[] = [
  { path: "", label: "Muhtasari", icon: "home" },
  { path: "/menu", label: "Menu", icon: "menu" },
  { path: "/oda", label: "Oda za mezani", icon: "orders", count: "dineIn" },
  { path: "/booking", label: "Booking za meza", icon: "booking", count: "bookings" },
  { path: "/delivery", label: "Delivery", icon: "delivery", count: "delivery" },
  { path: "/ofa", label: "Ofa ya leo", icon: "offer" },
  { path: "/maoni", label: "Rating na maoni", icon: "reviews" },
  { path: "/mauzo", label: "Mauzo", icon: "sales" },
  { path: "/wafanyakazi", label: "Wafanyakazi", icon: "staff" },
  { path: "/qr", label: "Mipangilio", icon: "settings", also: ["/kifurushi", "/usalama"] },
];

export default function AdminNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const t = useT();
  const { counts } = useAdminData();
  const base = `/${slug}/admin`;
  return (
    <nav className="adm-sbnav" aria-label={t("Sehemu za admin")}>
      {SECTIONS.map((s) => {
        const href = `${base}${s.path}`;
        const n = s.count ? counts[s.count] : 0;
        const current = [s.path, ...(s.also ?? [])].some((p) => pathname === `${base}${p}`);
        return (
          <Link key={s.path} href={href} className="adm-nv" aria-current={current ? "page" : undefined}>
            <AdminIcon name={s.icon} />
            <span className="adm-nv-t">{t(s.label)}</span>
            {n > 0 && <em className="adm-badge" aria-label={t("{n} mpya", { n })}>{n}</em>}
            {current && <i className="adm-nv-dot" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}
