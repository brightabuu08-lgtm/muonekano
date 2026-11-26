"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Brand 05b: kuhifadhi meza kwenye menyu ya Standard. Mantiki yote (ukaguzi, umbo la ombi, kutuma) ni ya lib/booking,
// ileile ya Zebra; hapa ni muonekano tu: siku 7 kama vitufe, saa kama vitufe, idadi ya watu kwa +/−.
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  BOOKING_TIMES,
  addDays,
  buildBookingPayload,
  postBooking,
  todayDar,
  validateBooking,
  type BookingErrors,
  type BookingForm,
} from "@/lib/booking";
import { getEnv } from "@/lib/env";
import { getDeviceId } from "@/lib/place-order";
import { useT } from "@/app/_components/Lang";
import { Turnstile } from "../shared/order/Turnstile";
import { useBackdropClose } from "../shared/order/backdrop";

const WEEKDAYS = ["Jumapili", "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi"] as const;
export const BOOKING_DAYS = 7;

/** Siku `BOOKING_DAYS` kuanzia leo: tarehe (YYYY-MM-DD) na jina la kuonyesha (Leo, Kesho, kisha jina la siku). */
export function bookingDays(today: string): { date: string; label: string; day: string }[] {
  const out: { date: string; label: string; day: string }[] = [];
  for (let i = 0; i < BOOKING_DAYS; i++) {
    const date = addDays(today, i);
    if (!date) break;
    const weekday = WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()] ?? "";
    out.push({ date, label: i === 0 ? "Leo" : i === 1 ? "Kesho" : weekday, day: date.slice(8, 10) });
  }
  return out;
}

export default function BookingSheet({ slug, onClose }: { slug: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdrop = useBackdropClose(dialog);
  const t = useT();
  const [today] = useState(() => todayDar());
  const appEnv = getEnv();
  const siteKey = appEnv.success ? (appEnv.data.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null) : null;

  const [form, setForm] = useState<BookingForm>(() => ({ name: "", phone: "", date: todayDar(), time: "19:00", party: "2", notes: "" }));
  const [errors, setErrors] = useState<BookingErrors>({});
  const [token, setToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaProblem, setCaptchaProblem] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState<BookingForm | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  const set = <K extends keyof BookingForm>(k: K, v: BookingForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const party = Number(form.party) || 1;
  const fieldProps = (k: keyof BookingErrors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `dbk-err-${k}` : undefined,
  });
  const fieldError = (k: keyof BookingErrors) =>
    errors[k] ? (
      <p id={`dbk-err-${k}`} className="ord-err" role="alert">
        {t(String(errors[k]))}
      </p>
    ) : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setFailure(null);
    const errs = validateBooking(form, today);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!token) {
      setFailure(t("Subiri uthibitisho wa usalama ukamilike kisha ubonyeze tena."));
      return;
    }
    const env = getEnv();
    if (!env.success) {
      setFailure(t("Mipangilio ya mfumo haijakamilika. Wasiliana na mgahawa."));
      return;
    }
    setSending(true);
    const res = await postBooking(
      { url: env.data.NEXT_PUBLIC_SUPABASE_URL, anonKey: env.data.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      buildBookingPayload({ slug, device: getDeviceId(), captcha: token, form }),
    );
    setSending(false);
    // Tokeni ya Turnstile inatumika mara moja: kisanduku kijengwe upya kila baada ya jaribio.
    setToken(null);
    setCaptchaKey((k) => k + 1);
    if (!res.ok) {
      setFailure(t(res.message));
      return;
    }
    setDone(form);
  }

  return (
    <dialog ref={dialog} className="dm-sheet" aria-labelledby="dbk-title" onClose={onClose} {...backdrop}>
      <div className="dm-sheet-body ord">
        <header className="dm-sheet-head">
          <h2 id="dbk-title">{t("Hifadhi meza")}</h2>
          <button type="button" className="dm-btn dm-close" onClick={() => dialog.current?.close()} aria-label={t("Funga dirisha")}>
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        {done ? (
          <div className="dbk-done" role="status">
            <p>
              <strong>{t("Asante, {name}!", { name: done.name.trim() })}</strong>
            </p>
            <p>{t("Booking yako imepokelewa: {date}, saa {time}, watu {party}. Tutakupigia kuthibitisha.", { date: done.date, time: done.time, party: done.party })}</p>
            <button type="button" className="dm-btn dm-primary dm-wide" onClick={() => dialog.current?.close()}>
              {t("Sawa")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <fieldset className="dbk-group" aria-describedby={errors.date ? "dbk-err-date" : undefined}>
              <legend>{t("Siku")}</legend>
              <div className="dbk-days">
                {bookingDays(today).map((d) => (
                  <button key={d.date} type="button" className="dbk-chip" aria-pressed={form.date === d.date} onClick={() => set("date", d.date)}>
                    <span>{t(d.label)}</span>
                    <b>{d.day}</b>
                  </button>
                ))}
              </div>
              {fieldError("date")}
            </fieldset>

            <fieldset className="dbk-group">
              <legend>{t("Saa")}</legend>
              <div className="dbk-times">
                {BOOKING_TIMES.map((tm) => (
                  <button key={tm} type="button" className="dbk-chip" aria-pressed={form.time === tm} onClick={() => set("time", tm)}>
                    <b>{tm}</b>
                  </button>
                ))}
              </div>
              {fieldError("time")}
            </fieldset>

            <div className="dbk-party">
              <span id="dbk-party-label">{t("Idadi ya watu")}</span>
              <span className="ord-step" role="group" aria-labelledby="dbk-party-label">
                <button type="button" className="ord-btn step" disabled={party <= 1} onClick={() => set("party", String(party - 1))} aria-label={t("Punguza")}>
                  −
                </button>
                <output aria-live="polite">{party}</output>
                <button type="button" className="ord-btn step" disabled={party >= 50} onClick={() => set("party", String(party + 1))} aria-label={t("Ongeza idadi")}>
                  +
                </button>
              </span>
            </div>
            {fieldError("party")}

            <div className="ord-field">
              <label htmlFor="dbk-name">{t("Jina")}</label>
              <input id="dbk-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} autoComplete="name" {...fieldProps("name")} />
              {fieldError("name")}
            </div>
            <div className="ord-field">
              <label htmlFor="dbk-phone">{t("Namba ya simu")}</label>
              <input id="dbk-phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={25} autoComplete="tel" placeholder="0712345678" {...fieldProps("phone")} />
              {fieldError("phone")}
            </div>
            <div className="ord-field">
              <label htmlFor="dbk-notes">{t("Maelezo, mfano sherehe ya kuzaliwa (si lazima)")}</label>
              <textarea id="dbk-notes" rows={2} maxLength={300} value={form.notes} onChange={(e) => set("notes", e.target.value)} {...fieldProps("notes")} />
              {fieldError("notes")}
            </div>

            {siteKey ? (
              <Turnstile key={captchaKey} siteKey={siteKey} onToken={setToken} onProblem={() => setCaptchaProblem(true)} />
            ) : (
              <p className="ord-err" role="alert">
                {t("Uthibitisho wa usalama haujawekwa, kwa hiyo booking haziwezi kutumwa sasa. Tupigie simu.")}
              </p>
            )}
            {captchaProblem && siteKey && (
              <p className="ord-err" role="alert">
                {t("Uthibitisho wa usalama haukupakia. Angalia mtandao wako, pakia ukurasa upya kisha ujaribu tena.")}
              </p>
            )}
            {failure && (
              <p className="ord-err" role="alert">
                {failure}
              </p>
            )}

            <button type="submit" className="ord-btn wide" disabled={sending || !siteKey}>
              {sending ? t("Inatuma…") : t("Tuma booking")}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
