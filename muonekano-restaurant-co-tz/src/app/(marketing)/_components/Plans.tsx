// © Bright Abuu. Haki zote zimehifadhiwa.
// Vifurushi viwili (Standard na Premium), maelezo ya Premium, na hatua 4 za kuanza. Bei na jina la chapa vinatoka site-config.ts.
// Bei ziko kwenye font ya mono. Kadi ya Premium ni .dk; vitufe vya vifurushi si vya nyanya (nyanya ni la "Omba demo" tu).
import { copy } from "../copy";
import { Loc, Tr } from "../mk-lang";
import { siteConfig } from "../site-config";
import { Icon } from "./Icons";

export function Plans() {
  const c = copy.plans;
  const { standard, premium } = siteConfig.plans;
  return (
    <section id="plans" className="mk-sec mk-sec-alt" aria-labelledby="plans-title">
      <div className="mk-wrap">
        <h2 id="plans-title" className="mk-h2">
          <Tr>{c.title}</Tr>
        </h2>
        <p className="mk-sub">
          <Tr>{c.sub}</Tr>
        </p>
        <div className="mk-plans">
          <article className="mk-card mk-plan" aria-labelledby="plan-standard">
            <h3 id="plan-standard" className="mk-plan-name mk-disp">
              {standard.name}
            </h3>
            <p className="mk-plan-tag">
              <Tr>{c.standard.tagline}</Tr>
            </p>
            <p className="mk-price">
              <span>{standard.price}</span>
              <small>
                <Loc value={standard.period} />
              </small>
            </p>
            <p className="mk-addr">
              <span>
                <Tr>{c.addressLabel}</Tr>
              </span>
              <code>
                {siteConfig.domain}/<Tr>{c.addressExample}</Tr>
              </code>
            </p>
            <ul className="mk-checks">
              {c.standard.items.map((t) => (
                <li key={t}>
                  <Icon name="check" size={20} />
                  <Tr>{t}</Tr>
                </li>
              ))}
              {c.standard.locked.map((t) => (
                <li key={t} className="is-locked">
                  <Icon name="lock" size={20} />
                  <span>
                    <Tr>{t}</Tr> <em><Tr>{c.premiumOnly}</Tr></em>
                  </span>
                </li>
              ))}
            </ul>
            <a className="mk-btn mk-btn-ghost mk-btn-block" href="#contact">
              <Tr>{c.cta}</Tr>
            </a>
          </article>

          <article className="mk-card mk-plan mk-plan-premium dk" aria-labelledby="plan-premium">
            <h3 id="plan-premium" className="mk-plan-name mk-disp">
              {premium.name}
            </h3>
            <p className="mk-plan-tag">
              <Tr>{c.premium.tagline}</Tr>
            </p>
            <p className="mk-price">
              <span>{premium.price}</span>
              <small>
                <Loc value={premium.period} />
              </small>
            </p>
            <p className="mk-addr">
              <span>
                <Tr>{c.addressLabel}</Tr>
              </span>
              <code>
                <Tr>{c.addressOwn}</Tr>
              </code>
            </p>
            <ul className="mk-checks">
              {c.premium.items.map((t) => (
                <li key={t}>
                  <Icon name="check" size={20} />
                  <Tr>{t}</Tr>
                </li>
              ))}
            </ul>
            <a className="mk-btn mk-btn-solid mk-btn-block" href="#contact">
              <Tr>{c.cta}</Tr>
            </a>
          </article>
        </div>

        <div className="mk-explain">
          <h3 className="mk-h3">
            <Tr>{c.explain.title}</Tr>
          </h3>
          <div className="mk-explain-grid">
            <div>
              <h4>
                <Tr>{c.explain.domainTitle}</Tr>
              </h4>
              <p>
                <Tr>{c.explain.domainText}</Tr>
              </p>
            </div>
            <div>
              <h4>
                <Tr>{c.explain.designTitle}</Tr>
              </h4>
              <p>
                <Tr>{c.explain.designText}</Tr>
              </p>
            </div>
          </div>
          <p className="mk-explain-note">
            <Tr>{c.explain.note}</Tr>
          </p>
        </div>

        <p className="mk-more">
          <Tr>{c.more}</Tr>{" "}
          <a href="#faq">
            <Tr>{c.moreFaq}</Tr>
          </a>{" "}
          <Tr>{c.moreOr}</Tr>{" "}
          <a href="#contact">
            <Tr>{c.moreContact}</Tr>
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function Setup() {
  const c = copy.setup;
  return (
    <section id="setup" className="mk-sec" aria-labelledby="setup-title">
      <div className="mk-wrap">
        <h2 id="setup-title" className="mk-h2">
          <Tr>{c.title}</Tr>
        </h2>
        <ol className="mk-steps">
          {c.steps.map((s) => (
            <li key={s.title}>
              <h3 className="mk-h3">
                <Tr>{s.title}</Tr>
              </h3>
              <p>
                <Tr>{s.text}</Tr>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
