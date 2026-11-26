"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Ingia ya admin wa mgahawa mmoja: email + nenosiri au Google, kisha namba ya 2FA kama ameiwasha (2FA ni ya hiari).
// Mantiki yote iko kwenye MfaLoginForm (ileile ya restaurant.co.tz/login), ikizuiwa kwa mgahawa huu tu.
import MfaLoginForm from "@/app/_components/MfaLoginForm";

type Props = { slug: string; restaurantId: string; appName: string };

export default function AdminLoginForm({ slug, restaurantId, appName }: Props) {
  return (
    <MfaLoginForm
      mode="restaurant"
      appName={appName}
      only={{ slug, restaurantId }}
      googleReturn={`/${slug}/admin/login`}
    />
  );
}
