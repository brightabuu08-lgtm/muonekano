"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Ganda la ukurasa wa admin: linahakikisha ameingia (2FA kamili) na ni admin wa mgahawa huu, kisha linaonyesha
// sidebar (nembo ya jukwaa, mgahawa, menyu), ukurasa wenyewe katikati na paneli ya "Zinazoingia sasa" kulia.
// Muonekano: brand "Tiketi + Ubao" kwa giza (.dk) kwa kila mgahawa; mgahawa wa Premium anaweza kuonyesha nembo yake juu ya menyu.
// Ulinzi halisi ni RLS ndani ya database; ukaguzi huu wa browser ni kwa urahisi wa mtumiaji tu.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient, type MyStaff } from "@/lib/supabase-browser";
import { AdminDataProvider } from "./AdminData";
import AdminNav from "./AdminNav";
import { BrandMark } from "./BrandMark";
import IncomingPanel from "./IncomingPanel";
import { LangToggle, useT } from "./Lang";
import { ToastProvider } from "./Toast";
import "./admin-brand.css";

type Props = { slug: string; restaurantId: string; displayName: string; logoUrl: string | null; children: React.ReactNode };

export default function AdminGuard({ slug, restaurantId, displayName, logoUrl, children }: Props) {
  const router = useRouter();
  const t = useT();
  const [me, setMe] = useState<MyStaff | null>(null);
  const loginPath = `/${slug}/admin/login`;

  useEffect(() => {
    const b = getBrowserClient();
    if ("error" in b) {
      router.replace(loginPath);
      return;
    }
    b.client.rpc("my_staff").then(({ data }) => {
      const row = (data as MyStaff[] | null)?.[0];
      if (!row || row.role !== "admin" || row.restaurant_id !== restaurantId) router.replace(loginPath);
      else setMe(row);
    });
  }, [router, loginPath, restaurantId]);

  async function signOut() {
    const b = getBrowserClient();
    if (!("error" in b)) await b.client.auth.signOut();
    router.replace(loginPath);
  }

  if (!me) {
    return (
      <div className="adm-page adm-dk dk">
        <p className="adm-loading" aria-live="polite">{t("Inapakia.")}</p>
      </div>
    );
  }

  return (
    <div className="adm-page adm-shell adm-dk dk">
      <ToastProvider>
        <AdminDataProvider restaurantId={restaurantId}>
          <aside className="adm-sb">
            <BrandMark tone="dk" size={28} withName className="adm-bm" />
            <div className="adm-biz">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" width={44} height={44} />
              ) : (
                <span className="adm-mark" aria-hidden="true">{displayName.trim().charAt(0).toUpperCase()}</span>
              )}
              <div>
                <small>{t("Mgahawa")}</small>
                <b>{displayName}</b>
                <span>{t("Msimamizi")} · {me.full_name}</span>
              </div>
            </div>
            <AdminNav slug={slug} />
            <span className="adm-sp" />
            <a className="adm-lnk" href={`/${slug}`} target="_blank" rel="noreferrer">{t("Fungua menu ya wateja")} ↗</a>
            <LangToggle className="adm-lang" />
            <button className="adm-signout" type="button" onClick={signOut}>{t("Toka")}</button>
          </aside>

          <main className="adm-content">{children}</main>

          <aside className="adm-rp" aria-label={t("Zinazoingia sasa")}>
            <IncomingPanel slug={slug} />
          </aside>
        </AdminDataProvider>
      </ToastProvider>
    </div>
  );
}
