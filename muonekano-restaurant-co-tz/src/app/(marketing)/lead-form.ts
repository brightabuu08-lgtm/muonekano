// © Bright Abuu. Haki zote zimehifadhiwa.
// Fomu ya "Omba demo": uthibitisho wa upande wa mteja na ujenzi wa viungo vya WhatsApp / email.
// Hakuna seva wala hifadhi ya data: ombi linatoka moja kwa moja kwenye simu ya mteja kwenda WhatsApp (au email).
import { translate, type Lang } from "@/lib/i18n";
import { copy } from "./copy";

export type PlanChoice = "standard" | "premium" | "unsure";
export const PLAN_CHOICES: readonly PlanChoice[] = ["standard", "premium", "unsure"];

export type LeadValues = { name: string; restaurant: string; city: string; phone: string; plan: PlanChoice; message: string };
export type LeadField = "name" | "restaurant" | "city" | "phone" | "message";
/** Ufunguo wa ujumbe wa kosa (Kiswahili); mpokeaji anautafsiri kwa lugha iliyochaguliwa. */
export type LeadErrors = Partial<Record<LeadField, string>>;

export const LIMITS = { name: 80, restaurant: 100, city: 60, phone: 20, message: 500 } as const;
export const LEAD_FIELDS: readonly LeadField[] = ["name", "restaurant", "city", "phone", "message"];

export const EMPTY_LEAD: LeadValues = { name: "", restaurant: "", city: "", phone: "", plan: "unsure", message: "" };

/** Inaondoa herufi za kudhibiti (zinazoharibu viungo) na kubana nafasi; ujumbe unabaki na mistari. */
function clean(value: string, multiline = false): string {
  let out = "";
  for (const ch of value) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === 10 || c === 13) out += multiline ? "\n" : " ";
    else if (c < 32 || c === 127) out += " ";
    else out += ch;
  }
  if (multiline) return out.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ").trim();
  return out.replace(/\s+/g, " ").trim();
}

/** Namba ya simu: tarakimu 9 hadi 15, + mwanzoni si lazima. Inakubali 0712 345 678 na +255 712 345 678. */
export function cleanPhone(input: string): string | null {
  const compact = input.replace(/[\s\-().]/g, "");
  return /^\+?[0-9]{9,15}$/.test(compact) ? compact : null;
}

export function validateField(field: LeadField, raw: string): string | null {
  const v = clean(raw, field === "message");
  switch (field) {
    case "name":
      return v.length < 2 || v.length > LIMITS.name ? copy.contact.errName : null;
    case "restaurant":
      return v.length < 2 || v.length > LIMITS.restaurant ? copy.contact.errRestaurant : null;
    case "city":
      return v.length < 2 || v.length > LIMITS.city ? copy.contact.errCity : null;
    case "phone":
      return cleanPhone(raw) === null ? copy.contact.errPhone : null;
    case "message":
      return v.length > LIMITS.message ? copy.contact.errMessage : null;
  }
}

export type LeadResult = { ok: true; value: LeadValues } | { ok: false; errors: LeadErrors };

export function validateLead(values: LeadValues): LeadResult {
  const errors: LeadErrors = {};
  for (const f of LEAD_FIELDS) {
    const e = validateField(f, values[f]);
    if (e) errors[f] = e;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name: clean(values.name),
      restaurant: clean(values.restaurant),
      city: clean(values.city),
      phone: cleanPhone(values.phone) ?? "",
      plan: PLAN_CHOICES.includes(values.plan) ? values.plan : "unsure",
      message: clean(values.message, true),
    },
  };
}

const PLAN_KEY: Record<PlanChoice, string> = {
  standard: copy.contact.planStandard,
  premium: copy.contact.planPremium,
  unsure: copy.contact.planUnsure,
};

/** Ujumbe tayari kutumwa, kwa lugha iliyochaguliwa kwenye tovuti. */
export function buildLeadMessage(v: LeadValues, lang: Lang): string {
  const t = (sw: string) => translate(lang, sw);
  const lines = [
    t(copy.contact.msgIntro),
    `${t(copy.contact.msgName)}: ${v.name}`,
    `${t(copy.contact.msgRestaurant)}: ${v.restaurant}`,
    `${t(copy.contact.msgCity)}: ${v.city}`,
    `${t(copy.contact.msgPhone)}: ${v.phone}`,
    `${t(copy.contact.msgPlan)}: ${t(PLAN_KEY[v.plan])}`,
  ];
  if (v.message) lines.push(`${t(copy.contact.msgMessage)}: ${v.message}`);
  return lines.join("\n");
}

/** https://wa.me/<namba>?text=... ; null kama namba haijawekwa. Host ni wa kudumu (wa.me), ni namba na maandishi tu vinabadilika. */
export function whatsappUrl(digits: string | null, text: string): string | null {
  if (!digits || !/^[0-9]{9,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** mailto:<email>?subject=...&body=... ; null kama email haijawekwa au si sahihi. */
export function mailtoUrl(email: string, subject: string, body: string): string | null {
  const e = email.trim();
  if (!/^[^\s@[\]]+@[^\s@[\]]+\.[^\s@[\]]+$/.test(e)) return null;
  return `mailto:${e}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
