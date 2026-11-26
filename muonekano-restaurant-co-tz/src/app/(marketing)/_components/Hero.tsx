// © Bright Abuu. Haki zote zimehifadhiwa.
// Sehemu ya juu: kichwa, "Omba demo" (kitendo kikuu, rangi ya nyanya), kiungo cha mfano wa Zebra, na rundo la tiketi tatu za oda (CSS tu).
// Tiketi ni umbo la brand; data yake ni ya mfano na inatoka copy.ts (kwa Kiswahili na Kiingereza). Namba za oda na bei ziko kwenye font ya mono.
import Link from "next/link";
import { Tr } from "../mk-lang";
import { copy } from "../copy";
import { demoPath } from "../site-config";

type Ticket = {
  key: string;
  tone: "new" | "prep" | "way";
  no: string;
  status: string;
  title: string;
  line: string;
  foot: string;
  price?: string;
};

function TicketStack() {
  const s = copy.tickets;
  const a = copy.views.admin;
  const b = copy.views.board;
  // Oda mpya juu; namba na hali zinalingana na orodha ya admin (Views).
  const tickets: Ticket[] = [
    { key: "new", tone: "new", no: "#12", status: a.statusNew, title: s.table, line: s.line, foot: s.customer, price: s.price1 },
    { key: "prep", tone: "prep", no: "#10", status: a.statusPrep, title: b.cardTable2, line: b.cardLine2, foot: a.rowDine, price: s.price2 },
    { key: "way", tone: "way", no: "#11", status: a.statusWay, title: a.rowName, line: s.dish, foot: a.rowDelivery },
  ];
  return (
    <figure className="mk-tickets">
      <div className="mk-tickets-stack" aria-hidden="true">
        {tickets.map((t) => (
          <div key={t.key} className={`mk-tkt mk-tkt-${t.tone}`}>
            <div className="mk-tkt-head">
              <span className="mk-tkt-no">{t.no}</span>
              <span className={`mk-tkt-tag${t.tone === "new" ? " is-new" : ""}`}>
                <Tr>{t.status}</Tr>
              </span>
            </div>
            <p className="mk-tkt-title mk-disp">
              <Tr>{t.title}</Tr>
            </p>
            <p className="mk-tkt-line">
              <Tr>{t.line}</Tr>
            </p>
            <p className="mk-tkt-foot">
              <span>
                <Tr>{t.foot}</Tr>
              </span>
              {t.price ? <span className="mk-tkt-price">{t.price}</span> : null}
            </p>
          </div>
        ))}
      </div>
      <figcaption className="mk-sr">
        <Tr>{copy.hero.figure}</Tr>
      </figcaption>
    </figure>
  );
}

export function Hero() {
  const h = copy.hero;
  return (
    <section className="mk-hero" aria-labelledby="hero-title">
      <div className="mk-wrap mk-hero-in">
        <div className="mk-hero-text">
          <h1 id="hero-title" className="mk-h1">
            <Tr>{h.title}</Tr>
          </h1>
          <p className="mk-lead">
            <Tr>{h.sub}</Tr>
          </p>
          <div className="mk-actions">
            <a className="mk-btn mk-btn-primary" href="#contact">
              <Tr>{h.primary}</Tr>
            </a>
            <Link className="mk-btn mk-btn-text" href={demoPath()} prefetch={false}>
              <Tr>{h.secondary}</Tr>
            </Link>
          </div>
          <p className="mk-note">
            <Tr>{h.note}</Tr>
          </p>
        </div>
        <TicketStack />
      </div>
    </section>
  );
}
