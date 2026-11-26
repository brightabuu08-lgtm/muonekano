// © Bright Abuu. Haki zote zimehifadhiwa.
"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { isFinalStatus } from "@/lib/order-status";
import { parseTracked, type Tracked } from "@/lib/place-order";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getServerSnapshot, getSnapshot, subscribe, type OrderState } from "./store";

export function useOrderState(slug: string): OrderState {
  return useSyncExternalStore((l) => subscribe(slug, l), getSnapshot, getServerSnapshot);
}

const POLL_MS = 10_000;

/** Hali ya oda ya mteja kwa kuuliza server kila sekunde 10 (na tab ikirudi mbele), hadi iwe ya mwisho. */
export function useOrderStatus(orderId: string | null): Tracked | null {
  const [tracked, setTracked] = useState<{ id: string; value: Tracked } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (stop) return;
      if (document.visibilityState === "visible") {
        const c = getBrowserClient();
        if (!("error" in c)) {
          const { data, error } = await c.client.rpc("track_order", { p_order_id: orderId });
          const t = error ? null : parseTracked(data);
          if (stop) return;
          if (t) {
            setTracked({ id: orderId, value: t });
            if (isFinalStatus(t.status)) return;
          }
        }
      }
      timer = setTimeout(tick, POLL_MS);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        void tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    void tick();
    return () => {
      stop = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [orderId]);

  return orderId && tracked?.id === orderId ? tracked.value : null;
}
