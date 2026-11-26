// © Bright Abuu. Haki zote zimehifadhiwa.
// Michoro ya mfano (CSS tu) ya paneli ya admin na ubao wa mhudumu. Ni ya kuonyesha tu; maandishi ya kila skrini yanaelezwa chini yake.
// Sehemu hii ni giza (.dk) kama skrini halisi za wafanyakazi; data ya michoro ni ya mfano.
import { Tr } from "../mk-lang";
import { copy } from "../copy";

function AdminMock() {
  const a = copy.views.admin;
  const nav = [a.overview, a.orders, a.bookings, a.menu, a.staff];
  const rows = [
    { no: "#12", place: a.rowTable, kind: a.rowDine, status: a.statusNew, tone: "new" },
    { no: "#11", place: a.rowName, kind: a.rowDelivery, status: a.statusWay, tone: "way" },
    { no: "#10", place: copy.views.board.cardTable2, kind: a.rowDine, status: a.statusPrep, tone: "prep" },
  ] as const;
  return (
    <div className="mk-mock mk-admin" aria-hidden="true">
      <div className="mk-adm-side">
        <span className="mk-adm-brand mk-disp">
          <Tr>{a.brand}</Tr>
        </span>
        {nav.map((n, i) => (
          <span key={n} className={`mk-adm-nav${i === 0 ? " is-on" : ""}`}>
            <Tr>{n}</Tr>
          </span>
        ))}
      </div>
      <div className="mk-adm-main">
        <div className="mk-adm-stats">
          <div>
            <b className="mk-disp">3</b>
            <span>
              <Tr>{a.statNew}</Tr>
            </span>
          </div>
          <div>
            <b className="mk-disp">5</b>
            <span>
              <Tr>{a.statProgress}</Tr>
            </span>
          </div>
          <div>
            <b className="mk-disp">2</b>
            <span>
              <Tr>{a.statBookings}</Tr>
            </span>
          </div>
        </div>
        <div className="mk-adm-list">
          <b>
            <Tr>{a.listTitle}</Tr>
          </b>
          {rows.map((r) => (
            <div key={r.no} className="mk-adm-row">
              <span className="mk-adm-no">{r.no}</span>
              <span className="mk-adm-what">
                <b>
                  <Tr>{r.place}</Tr>
                </b>
                <small>
                  <Tr>{r.kind}</Tr>
                </small>
              </span>
              <span className={`mk-status is-${r.tone}`}>
                <Tr>{r.status}</Tr>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardMock() {
  const b = copy.views.board;
  const cards = [
    { table: b.cardTable, line: b.cardLine1 },
    { table: b.cardTable2, line: b.cardLine2 },
  ];
  return (
    <div className="mk-mock mk-board" aria-hidden="true">
      <div className="mk-board-top">
        <span>
          <b className="mk-disp">
            <Tr>{b.hello}</Tr>
          </b>
          <small>
            <Tr>{b.role}</Tr>
          </small>
        </span>
        <span className="mk-dot" />
      </div>
      <div className="mk-tabs">
        <span className="is-on">
          <Tr>{b.tabWaiting}</Tr>
        </span>
        <span>
          <Tr>{b.tabMine}</Tr>
        </span>
        <span>
          <Tr>{b.tabBookings}</Tr>
        </span>
      </div>
      {cards.map((c, i) => (
        <div key={c.table} className={`mk-board-card${i === 0 ? " is-new" : ""}`}>
          <div className="mk-board-card-head">
            <b>
              <Tr>{c.table}</Tr>
            </b>
            <small>
              <Tr>{b.cardType}</Tr>
            </small>
          </div>
          <p>
            <Tr>{c.line}</Tr>
          </p>
          <span className="mk-mini-btn">
            <Tr>{b.action}</Tr>
          </span>
        </div>
      ))}
    </div>
  );
}

export function Views() {
  const v = copy.views;
  return (
    <section className="mk-sec mk-dark dk" aria-labelledby="views-title">
      <div className="mk-wrap">
        <h2 id="views-title" className="mk-h2">
          <Tr>{v.title}</Tr>
        </h2>
        <p className="mk-sub">
          <Tr>{v.sub}</Tr>
        </p>
        <div className="mk-views">
          <figure className="mk-view mk-view-admin">
            <AdminMock />
            <figcaption>
              <h3 className="mk-h3">
                <Tr>{v.adminTitle}</Tr>
              </h3>
              <p>
                <Tr>{v.adminText}</Tr>
              </p>
              <span className="mk-badge">
                <Tr>{copy.ui.illustrative}</Tr>
              </span>
            </figcaption>
          </figure>
          <figure className="mk-view mk-view-board">
            <BoardMock />
            <figcaption>
              <h3 className="mk-h3">
                <Tr>{v.staffTitle}</Tr>
              </h3>
              <p>
                <Tr>{v.staffText}</Tr>
              </p>
              <span className="mk-badge">
                <Tr>{copy.ui.illustrative}</Tr>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
