// © Bright Abuu. Haki zote zimehifadhiwa.
import type { Metadata } from "next";
import { getTheme } from "@/themes";
import { pageRestaurant, type SlugParams } from "../../_restaurant";
import StaffLoginForm from "./StaffLoginForm";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const r = await pageRestaurant(params);
  return { title: `Ingia · Mfanyakazi — ${r.displayName}`, robots: { index: false } };
}

export default async function StaffLoginPage({ params }: SlugParams) {
  const restaurant = await pageRestaurant(params);
  const { Gate, LockNote } = getTheme(restaurant.theme);
  return (
    <Gate restaurant={restaurant} title="Ingia · Mfanyakazi">
      <StaffLoginForm slug={restaurant.slug} />
      <LockNote>
        Kila mfanyakazi anaona oda zake na kazi za jukumu lake tu. Hawezi kuingia kwenye ukurasa wa mtu mwingine wala wa
        admin.
      </LockNote>
    </Gate>
  );
}
