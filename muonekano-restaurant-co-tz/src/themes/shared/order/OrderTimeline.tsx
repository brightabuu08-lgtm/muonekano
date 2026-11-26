"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Hali ya oda kwa mteja (artboard 04): kichwa cha habari na hatua za oda. Hatua zinatoka kwenye hali halisi ya oda
// (new, preparing, on_the_way, delivered); oda ya mezani haina "iko njiani". Alama ni zilezile kwa kila theme; muonekano
// unaamuliwa na CSS: .dm (Standard, order-timeline.css) na .zm (Zebra, order-timeline-zebra.css). Theme nyingine: imefichwa.
import { useT } from "@/app/_components/Lang";
import { customerSteps, orderHeadline, orderStatusLabel } from "@/lib/order-status";
import "./order-timeline.css";
import "./order-timeline-zebra.css";

export function OrderTimeline({ status, type }: { status: string; type: string }) {
  const t = useT();
  const head = orderHeadline(status, type);
  if (!head) return null;
  const steps = customerSteps(type);
  const cancelled = status === "cancelled";
  const final = cancelled || status === "delivered";
  // Hatua ya sasa; oda iliyokamilika ina hatua zote zimekamilika.
  const at = status === "delivered" ? steps.length : Math.max(steps.indexOf(status), 0);

  return (
    <div className="ord-tl-wrap">
      <p className={cancelled ? "ord-hero is-cancel" : "ord-hero"}>{t(head)}</p>
      {!final && <p className="ord-hero-sub">{t("Ukurasa huu unajisasisha wenyewe.")}</p>}
      <span className="ord-orn" aria-hidden="true">
        <i />
      </span>
      {!cancelled && (
        <ol className="ord-tl" aria-label={t("Hatua za oda")}>
          {steps.map((s, i) => {
            const state = i < at ? "done" : i === at ? "now" : "next";
            return (
              <li key={s} className={`ord-tl-${state}`} aria-current={state === "now" ? "step" : undefined}>
                <span className="ord-tl-dot" aria-hidden="true">
                  {state === "done" && (
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span>{t(orderStatusLabel(s, type))}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
