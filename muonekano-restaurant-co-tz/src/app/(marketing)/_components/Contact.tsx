"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Fomu ya "Omba demo". Hakuna seva wala hifadhi: tunathibitisha kwenye kifaa cha mteja, kisha tunafungua WhatsApp (wa.me) na ujumbe
// ulioandaliwa; email (mailto:) ni mbadala. Makosa yanaonekana kwa lugha iliyochaguliwa.
import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { copy } from "../copy";
import {
  EMPTY_LEAD,
  LEAD_FIELDS,
  LIMITS,
  buildLeadMessage,
  mailtoUrl,
  validateField,
  validateLead,
  whatsappUrl,
  type LeadErrors,
  type LeadField,
  type LeadValues,
  type PlanChoice,
} from "../lead-form";
import { useLang, useT } from "../mk-lang";
import { isFilled, siteConfig, whatsappDigits } from "../site-config";
import { Icon } from "./Icons";

type Done = { wa: string | null; mail: string | null };

export function Contact() {
  const t = useT();
  const lang = useLang();
  const uid = useId();
  const [values, setValues] = useState<LeadValues>(EMPTY_LEAD);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const c = copy.contact;
  const id = (f: string) => `${uid}-${f}`;

  const setField = (f: LeadField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [f]: v }));
    // Kosa linaondoka mara tu sehemu inapokuwa sahihi (hatuonyeshi kosa jipya wakati mtu bado anaandika).
    if (errors[f] && !validateField(f, v)) {
      setErrors((s) => {
        const next = { ...s };
        delete next[f];
        return next;
      });
    }
  };

  const blur = (f: LeadField) => () => {
    const e = validateField(f, values[f]);
    setErrors((s) => {
      const next = { ...s };
      if (e) next[f] = e;
      else delete next[f];
      return next;
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = validateLead(values);
    if (!r.ok) {
      setErrors(r.errors);
      setShowSummary(true);
      const first = LEAD_FIELDS.find((f) => r.errors[f]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    setShowSummary(false);
    const text = buildLeadMessage(r.value, lang);
    const wa = whatsappUrl(whatsappDigits(), text);
    const mail = mailtoUrl(siteConfig.email, t(c.msgSubject), text);
    setDone({ wa, mail });
    if (wa) window.open(wa, "_blank", "noopener,noreferrer");
    else if (mail) window.location.href = mail;
  };

  const field = (f: LeadField, label: string, props: { type?: string; autoComplete?: string; inputMode?: "tel"; hint?: string; list?: string }) => {
    const err = errors[f];
    const describedBy = [err ? `${id(f)}-err` : null, props.hint ? `${id(f)}-hint` : null].filter(Boolean).join(" ") || undefined;
    return (
      <div className="mk-field">
        <label htmlFor={id(f)}>{t(label)}</label>
        <input
          id={id(f)}
          name={f}
          type={props.type ?? "text"}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          list={props.list}
          maxLength={LIMITS[f] + (f === "phone" ? 8 : 20)}
          value={values[f]}
          onChange={setField(f)}
          onBlur={blur(f)}
          aria-required="true"
          aria-invalid={err ? true : undefined}
          aria-describedby={describedBy}
        />
        {props.hint && (
          <p id={`${id(f)}-hint`} className="mk-hint">
            {t(props.hint)}
          </p>
        )}
        {err && (
          <p id={`${id(f)}-err`} className="mk-err">
            {t(err)}
          </p>
        )}
      </div>
    );
  };

  const waDigits = whatsappDigits();
  const directWa = waDigits ? `https://wa.me/${waDigits}` : null;
  const directMail = mailtoUrl(siteConfig.email, t(c.msgSubject), "");

  return (
    <section id="contact" className="mk-sec mk-dark dk" aria-labelledby="contact-title">
      <div className="mk-wrap mk-contact">
        <div className="mk-contact-text">
          <h2 id="contact-title" className="mk-h2">
            {t(c.title)}
          </h2>
          <p className="mk-lead">{t(c.sub)}</p>
          <p className="mk-direct-lab">{t(c.direct)}</p>
          <ul className="mk-direct">
            <li>
              <Icon name="whatsapp" size={20} />
              {directWa ? (
                <a href={directWa} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              ) : (
                <span>{siteConfig.whatsappNumber}</span>
              )}
            </li>
            <li>
              <Icon name="mail" size={20} />
              {isFilled(siteConfig.email) && directMail ? <a href={directMail}>{siteConfig.email}</a> : <span>{siteConfig.email}</span>}
            </li>
          </ul>
        </div>

        <div className="mk-card mk-form-card">
          {done ? (
            <div className="mk-done" role="status">
              <h3 className="mk-h3">{t(done.wa || done.mail ? c.doneTitle : c.notReadyTitle)}</h3>
              <p>{t(done.wa || done.mail ? c.doneText : c.notReady)}</p>
              <div className="mk-actions">
                {done.wa && (
                  <a className="mk-btn mk-btn-primary" href={done.wa} target="_blank" rel="noopener noreferrer">
                    <Icon name="whatsapp" size={20} />
                    {t(c.openWhatsapp)}
                  </a>
                )}
                {done.mail && (
                  <a className="mk-btn mk-btn-ghost" href={done.mail}>
                    <Icon name="mail" size={20} />
                    {t(c.sendEmail)}
                  </a>
                )}
                <button type="button" className="mk-btn mk-btn-text" onClick={() => setDone(null)}>
                  {t(c.edit)}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              {showSummary && Object.keys(errors).length > 0 && (
                <p className="mk-summary" role="alert">
                  {t(c.errorsTitle)}
                </p>
              )}
              {field("name", c.name, { autoComplete: "name" })}
              {field("restaurant", c.restaurant, { autoComplete: "organization" })}
              <div className="mk-row2">
                {field("city", c.city, { autoComplete: "address-level2", list: `${uid}-cities` })}
                {field("phone", c.phone, { type: "tel", autoComplete: "tel", inputMode: "tel", hint: c.phoneHint })}
              </div>
              <datalist id={`${uid}-cities`}>
                {siteConfig.cities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
              <div className="mk-field">
                <label htmlFor={id("plan")}>{t(c.plan)}</label>
                <select id={id("plan")} name="plan" value={values.plan} onChange={(e) => setValues((s) => ({ ...s, plan: e.target.value as PlanChoice }))}>
                  <option value="standard">{t(c.planStandard)}</option>
                  <option value="premium">{t(c.planPremium)}</option>
                  <option value="unsure">{t(c.planUnsure)}</option>
                </select>
              </div>
              <div className="mk-field">
                <label htmlFor={id("message")}>{t(c.message)}</label>
                <textarea
                  id={id("message")}
                  name="message"
                  rows={3}
                  value={values.message}
                  onChange={setField("message")}
                  onBlur={blur("message")}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={errors.message ? `${id("message")}-err` : undefined}
                />
                {errors.message && (
                  <p id={`${id("message")}-err`} className="mk-err">
                    {t(errors.message)}
                  </p>
                )}
              </div>
              <button type="submit" className="mk-btn mk-btn-primary mk-btn-block">
                <Icon name="whatsapp" size={20} />
                {t(c.submit)}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
