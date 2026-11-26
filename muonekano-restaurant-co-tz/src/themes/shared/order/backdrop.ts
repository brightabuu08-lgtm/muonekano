"use client";
// Ac Bright Abuu. Haki zote zimehifadhiwa.
// Kugusa eneo lenye blur nje ya dirisha kunafunga dirisha. Kunafunga tu kama mguso ulianzia nje ya dirisha pia
// (mtu akichagua maandishi ndani kisha akaachia nje, dirisha halifungwi).
import { useRef, type MouseEvent, type PointerEvent, type RefObject } from "react";

export function useBackdropClose(dialog: RefObject<HTMLDialogElement | null>) {
  const started = useRef(false);
  return {
    onPointerDown: (e: PointerEvent<HTMLDialogElement>) => {
      started.current = e.target === dialog.current;
    },
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      if (started.current && e.target === dialog.current) dialog.current?.close();
      started.current = false;
    },
  };
}
