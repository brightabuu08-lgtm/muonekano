// © Bright Abuu. Haki zote zimehifadhiwa.
// Sehemu tatu za maelezo: tatizo na suluhisho, jinsi inavyofanya kazi (hatua 4), na vipengele (vya kweli tu).
import { Tr } from "../mk-lang";
import { copy } from "../copy";
import { Icon, type IconName } from "./Icons";

export function Problem() {
  const c = copy.problem;
  return (
    <section className="mk-sec mk-sec-alt" aria-labelledby="problem-title">
      <div className="mk-wrap">
        <h2 id="problem-title" className="mk-h2">
          <Tr>{c.title}</Tr>
        </h2>
        <ul className="mk-problems">
          {c.items.map((it) => (
            <li key={it.title} className="mk-card mk-pcard">
              <h3 className="mk-h3">
                <Tr>{it.title}</Tr>
              </h3>
              <p className="mk-bad">
                <strong>
                  <Tr>{c.problem}</Tr>
                </strong>
                <Tr>{it.problem}</Tr>
              </p>
              <p className="mk-good">
                <strong>
                  <Tr>{c.solution}</Tr>
                </strong>
                <Tr>{it.solution}</Tr>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function How() {
  const c = copy.how;
  return (
    <section id="how" className="mk-sec" aria-labelledby="how-title">
      <div className="mk-wrap">
        <h2 id="how-title" className="mk-h2">
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

export function Features() {
  const c = copy.features;
  return (
    <section id="features" className="mk-sec mk-sec-alt" aria-labelledby="features-title">
      <div className="mk-wrap">
        <h2 id="features-title" className="mk-h2">
          <Tr>{c.title}</Tr>
        </h2>
        <ul className="mk-features">
          {c.items.map((f) => (
            <li key={f.title} className="mk-feature">
              <span className="mk-ico">
                <Icon name={f.icon as IconName} />
              </span>
              <h3 className="mk-h3">
                <Tr>{f.title}</Tr>
              </h3>
              <p>
                <Tr>{f.text}</Tr>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
