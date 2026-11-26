"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Maswali yanayoulizwa mara nyingi: accordion ya <details>/<summary> (kibodi na visomaji vya skrini vinafanya kazi bila JavaScript).
// Ni client component kwa sababu jibu la muda wa kuweka linajazwa kutoka site-config.ts na maandishi yanafuata lugha.
import { copy } from "../copy";
import { useLang, useT } from "../mk-lang";
import { isFilled, siteConfig } from "../site-config";
import { Icon } from "./Icons";

type Item = (typeof copy.faq.items)[number];

/** Jibu la swali. Muda wa kuweka ukiwa bado haujajazwa kwenye site-config, jibu lisilo na muda linatumika (mgeni asione "[...]"). */
function answer(it: Item, time: string, t: ReturnType<typeof useT>): string {
  if ("aNoTime" in it && !isFilled(time)) return t(it.aNoTime);
  return t(it.a, { time });
}

export function Faq() {
  const t = useT();
  const lang = useLang();
  const c = copy.faq;
  return (
    <section id="faq" className="mk-sec" aria-labelledby="faq-title">
      <div className="mk-wrap mk-split">
        <h2 id="faq-title" className="mk-h2">
          {t(c.title)}
        </h2>
        <div className="mk-faq">
          {c.items.map((it) => (
            <details key={it.q} className="mk-qa">
              <summary>
                <span>{t(it.q)}</span>
                <Icon name="plus" size={22} />
              </summary>
              <p>{answer(it, siteConfig.setupTime[lang], t)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
