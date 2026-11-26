"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// "Chakula kilikuwaje?": baada ya oda kuhudumiwa/kufikishwa/kuchukuliwa, mteja anaweka nyota 1-5 (na maoni, si lazima) kwa
// kila chakula cha oda. Database inahakikisha ni oda ya kifaa hiki, imekamilika, ndani ya siku 7 na mara moja tu.
import { useEffect, useState } from "react";
import { useT } from "@/app/_components/Lang";
import { parseReviewTargets, type ReviewTarget } from "@/lib/menu-extras";
import { getDeviceId } from "@/lib/place-order";
import { getBrowserClient } from "@/lib/supabase-browser";
import { StarIcon, StarRow } from "./Stars";
import "./extras.css";

type Draft = { rating: number; comment: string };

export function RateOrder({ orderId, className = "" }: { orderId: string; className?: string }) {
  const t = useT();
  const [targets, setTargets] = useState<ReviewTarget[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let stop = false;
    const b = getBrowserClient();
    if ("error" in b) return;
    void b.client.rpc("review_targets", { p_order: orderId, p_device: getDeviceId() }).then(({ data, error }) => {
      if (!stop) setTargets(error ? [] : parseReviewTargets(data));
    });
    return () => {
      stop = true;
    };
  }, [orderId]);

  if (!targets || targets.length === 0) return null;
  const open = targets.filter((x) => x.rating === null);
  const set = (id: string, d: Partial<Draft>) => setDrafts((all) => ({ ...all, [id]: { rating: 0, comment: "", ...all[id], ...d } }));
  const ready = open.filter((x) => (drafts[x.itemId]?.rating ?? 0) > 0);

  async function send() {
    if (sending || ready.length === 0) return;
    const b = getBrowserClient();
    if ("error" in b) return;
    setSending(true);
    setMsg(null);
    const body = ready.map((x) => {
      const d = drafts[x.itemId] ?? { rating: 0, comment: "" };
      const comment = d.comment.trim();
      return comment ? { item_id: x.itemId, rating: d.rating, comment } : { item_id: x.itemId, rating: d.rating };
    });
    const { error } = await b.client.rpc("submit_reviews", { p_order: orderId, p_device: getDeviceId(), p_reviews: body });
    setSending(false);
    if (error) return setMsg({ ok: false, text: t("Imeshindwa kutuma rating. Jaribu tena.") });
    setTargets((all) =>
      (all ?? []).map((x) => {
        const d = drafts[x.itemId];
        return x.rating === null && d?.rating ? { ...x, rating: d.rating, comment: d.comment.trim() || null } : x;
      }),
    );
    setMsg({ ok: true, text: t("Asante! Rating yako imehifadhiwa.") });
  }

  return (
    <section className={`x-rate ${className}`.trim()} aria-labelledby={`x-rate-${orderId}`}>
      <h3 id={`x-rate-${orderId}`}>{t("Chakula kilikuwaje?")}</h3>
      <ul className="x-rate-list">
        {targets.map((x) => {
          const d = drafts[x.itemId];
          return (
            <li key={x.itemId}>
              <span className="x-rate-name">{x.name}</span>
              {x.rating !== null ? (
                <span className="x-rate-done">
                  <StarRow value={x.rating} />
                  {x.comment && <small>{x.comment}</small>}
                </span>
              ) : (
                <>
                  <span className="x-pick" role="radiogroup" aria-label={t("Nyota za {name}", { name: x.name })}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={d?.rating === n}
                        aria-label={n === 1 ? t("Nyota 1") : t("Nyota {n}", { n })}
                        className={(d?.rating ?? 0) >= n ? "on" : undefined}
                        onClick={() => set(x.itemId, { rating: n })}
                      >
                        <StarIcon />
                      </button>
                    ))}
                  </span>
                  {(d?.rating ?? 0) > 0 && (
                    <textarea
                      className="x-rate-c"
                      rows={2}
                      maxLength={300}
                      value={d?.comment ?? ""}
                      onChange={(e) => set(x.itemId, { comment: e.target.value })}
                      placeholder={t("Maoni yako (si lazima)")}
                      aria-label={t("Maoni kuhusu {name} (si lazima)", { name: x.name })}
                    />
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      {open.length > 0 && (
        <button type="button" className="x-rate-send" disabled={sending || ready.length === 0} onClick={send}>
          {sending ? t("Inatuma…") : t("Tuma rating")}
        </button>
      )}
      {msg && (
        <p className={msg.ok ? "x-ok" : "x-err"} role={msg.ok ? "status" : "alert"}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
