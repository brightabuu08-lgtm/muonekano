// © Bright Abuu. Haki zote zimehifadhiwa.
"use client";
// Arifa kwa mteja hali ya oda yake ikibadilika: sauti na mtetemo ukurasa ukiwa wazi, na Web Push ukurasa ukiwa umefungwa.
// Arifa ni za kiotomatiki: ruhusa ya kivinjari inaombwa ndani ya kubonyeza "Tuma oda" (begin, kabla ya kutuma), mara moja tu kwa
// kifaa; oda ikifanikiwa na ruhusa ikiwa imetolewa, kifaa kinasajiliwa kwa oda hiyo kimya kimya (save_order_push), na kila oda
// mpya inasajiliwa vilevile. Ombi la ruhusa halichelewesha wala kuzuia oda. Kitufe cha arifa ni cha KUZIMA, au cha aliyefunga
// ombi. Usajili wa push ni wa oda moja; oda ikifikia hali ya mwisho, seva inaufuta. Ukurasa ukifunguliwa, hali ya sasa haipigi
// kengele: ni mabadiliko yanayofuata tu. Hakuna jina wala simu ya mteja kwenye arifa.
import { useCallback, useEffect, useRef, useState } from "react";
import { alertView, type AlertNote, type AlertView, type PushOutcome } from "@/lib/alert-ask";
import { playChime, unlockAudio, vibrateNow } from "@/app/_components/alertsBrowser";
import { VAPID, askOnClick } from "@/app/_components/askAlerts";
import { useLang } from "@/app/_components/Lang";
import { ensurePush } from "@/app/_components/pushClient";
import { useAlertEnv } from "@/app/_components/useAlertEnv";
import { shouldAlert } from "@/lib/order-alerts";
import { isFinalStatus } from "@/lib/order-status";
import type { Tracked } from "@/lib/place-order";
import { staffPagePath, type PushKeys } from "@/lib/push";
import { getBrowserClient } from "@/lib/supabase-browser";
import { orderPref } from "./alertPref";

export type OrderAlerts = {
  view: AlertView;
  note: AlertNote;
  busy: boolean;
  /** Ita PAPO HAPO ndani ya kubonyeza "Tuma oda", kabla ya await yoyote. Inaomba ruhusa kama inafaa; haisubiriwi na haitupi kosa. */
  begin: () => void;
  /** Kwa aliyezima au aliyefunga ombi: inaomba ruhusa (ndani ya kubonyeza) na kuwasha. */
  enable: () => Promise<void>;
  disable: () => Promise<void>;
};

/** Anwani ya usajili wa push wa kivinjari hiki, bila kuuondoa (usajili ni wa kivinjari chote, unaweza kuwa wa matumizi mengine). */
async function currentEndpoint(): Promise<string | null> {
  try {
    if (!("serviceWorker" in navigator)) return null;
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    return sub?.endpoint ?? null;
  } catch {
    return null;
  }
}

/** `tracked` ni hali ya oda ya mwisho ya kifaa hiki (useOrderStatus); null mpaka jibu la kwanza. */
export function useOrderAlerts(orderId: string | null, tracked: Tracked | null): OrderAlerts {
  const lang = useLang();
  const env = useAlertEnv(orderPref);
  // Arifa ni za kiotomatiki: zimezimwa tu mteja akizima mwenyewe.
  const enabled = env.choice !== "off";
  const { permission } = env.input;
  const [push, setPush] = useState<PushOutcome>("idle");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const seen = useRef<{ id: string; status: string } | null>(null);

  const status = tracked?.status ?? null;
  // Arifa zinahitajika tu wakati oda haijafikia hali ya mwisho.
  const open = orderId !== null && status !== null && !isFinalStatus(status);

  const save = useCallback(
    async (k: PushKeys) => {
      if (!orderId) return false;
      const b = getBrowserClient();
      if ("error" in b) return false;
      const { error } = await b.client.rpc("save_order_push", {
        p_order: orderId,
        p_endpoint: k.endpoint,
        p_p256dh: k.p256dh,
        p_auth: k.auth,
        p_lang: lang,
        p_page: staffPagePath(window.location.pathname), // njia ya ukurasa huu ("/zebra"); jina la kazi ni la zamani
      });
      return !error;
    },
    [orderId, lang],
  );

  // Hali ikibadilika (si ukurasa kufunguliwa): sauti na mtetemo. Ukurasa ukiwa nyuma, uchunguzi unasimama; mteja akirudi,
  // hali mpya inapatikana mara moja na kengele inapigwa wakati huo (arifa ya simu iliyofungwa ilishamfikia kama ilikuwa imewashwa).
  useEffect(() => {
    if (!orderId || !status) return;
    const before = seen.current;
    seen.current = { id: orderId, status };
    if (!enabled || !before || before.id !== orderId || !shouldAlert(before.status, status)) return;
    void playChime();
    vibrateNow();
  }, [orderId, status, enabled]);

  // Sauti inahitaji kitendo cha mtumiaji: "Tuma oda" ilishaifungua kwenye ukurasa huu; baada ya ukurasa kufunguliwa upya, mguso
  // wa kwanza unairuhusu.
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => unlockAudio();
    document.addEventListener("pointerdown", unlock, { once: true });
    return () => document.removeEventListener("pointerdown", unlock);
  }, [enabled]);

  // Oda iko wazi na ruhusa imetolewa: kifaa kinasajiliwa kwa oda hii kimya kimya (bila kuuliza ruhusa). Inarudiwa oda mpya
  // ikija (save inabadilika), lugha ikibadilika, na ruhusa ikijibiwa baadaye (ombi la "Tuma oda" bado liko wazi: `permission`
  // inabadilika).
  useEffect(() => {
    if (!enabled || !open || busyRef.current) return;
    let stop = false;
    void ensurePush(VAPID, save, false).then((o) => {
      if (!stop) setPush(o);
    });
    return () => {
      stop = true;
    };
  }, [enabled, open, save, permission]);

  // Ndani ya kubonyeza "Tuma oda". Hakuna await hapa, na hakuna anayesubiri jibu la ombi: oda inatumwa kawaida, ruhusa ikikataliwa
  // au ikishindwa. Ruhusa ikijibiwa, effect hapo juu inasajili kifaa.
  const begin = useCallback(() => {
    if (orderPref.readChoice() === "off") return;
    unlockAudio();
    void askOnClick(orderPref);
  }, []);

  const enable = useCallback(async () => {
    busyRef.current = true;
    setBusy(true);
    // Mambo haya lazima yatokee ndani ya kubonyeza kitufe, kabla ya await yoyote.
    unlockAudio();
    orderPref.markAsked();
    const ask = ensurePush(VAPID, save, true);
    orderPref.writeChoice(true);
    void playChime();
    vibrateNow();
    setPush(await ask);
    busyRef.current = false;
    setBusy(false);
  }, [save]);

  const disable = useCallback(async () => {
    busyRef.current = true;
    setBusy(true);
    orderPref.writeChoice(false);
    const endpoint = await currentEndpoint();
    const b = getBrowserClient();
    if (endpoint && orderId && !("error" in b)) {
      await b.client.rpc("remove_order_push", { p_order: orderId, p_endpoint: endpoint });
    }
    setPush("idle");
    busyRef.current = false;
    setBusy(false);
  }, [orderId]);

  const { view, note } = alertView(env.input, { push, asking: env.asking });
  return { view, note, busy, begin, enable, disable };
}
