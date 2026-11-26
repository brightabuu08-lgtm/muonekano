// © Bright Abuu. Haki zote zimehifadhiwa.
"use client";
import { useEffect, useRef } from "react";

type Api = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Api;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<Api | null> | null = null;

function loadApi(): Promise<Api | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<Api | null>((resolve) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve(window.turnstile ?? null);
    s.onerror = () => {
      loading = null; // jaribio lijalo lijaribu tena
      resolve(null);
    };
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Uthibitisho wa "si roboti" wa Cloudflare. Tokeni inatumika mara moja tu: baada ya kutuma oda,
 * mzazi anabadilisha `key` ili kisanduku kijengwe upya na tokeni mpya.
 */
export function Turnstile({ siteKey, onToken, onProblem }: {
  siteKey: string;
  onToken: (token: string | null) => void;
  onProblem: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const cb = useRef({ onToken, onProblem });
  useEffect(() => {
    cb.current = { onToken, onProblem };
  });

  useEffect(() => {
    let widget: string | null = null;
    let gone = false;
    void loadApi().then((api) => {
      if (gone) return;
      const el = host.current;
      if (!api || !el) {
        cb.current.onProblem();
        return;
      }
      widget = api.render(el, {
        sitekey: siteKey,
        callback: (t) => cb.current.onToken(t),
        "expired-callback": () => cb.current.onToken(null),
        "error-callback": () => {
          cb.current.onToken(null);
          cb.current.onProblem();
        },
      });
    });
    return () => {
      gone = true;
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, [siteKey]);

  return <div ref={host} className="ord-captcha" />;
}
