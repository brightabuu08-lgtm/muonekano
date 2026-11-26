// © Bright Abuu. Haki zote zimehifadhiwa.
// Mfano wa Premium: Zebra Restaurant (kiungo hai /zebra) na picha zilizo tayari kwenye public/fotos/zebra.
// Hakuna ushuhuda wala takwimu zilizobuniwa. Kadi ya mteja inaonyesha nembo halisi ya Zebra (public/logo-zebra.png) na kiungo cha menu yao hai.
import Link from "next/link";
import { copy } from "../copy";
import { Tr } from "../mk-lang";
import { demoPath, siteConfig } from "../site-config";
import { Icon } from "./Icons";
import { Photo } from "./Photo";

const PHOTOS = ["/fotos/zebra/choma1.jpg", "/fotos/zebra/kaukau1.jpg", "/fotos/zebra/goat1.jpg", "/fotos/zebra/arabic-2.jpg"] as const;

export function Showcase() {
  const c = copy.showcase;
  return (
    <section id="premium" className="mk-sec mk-sec-alt" aria-labelledby="showcase-title">
      <div className="mk-wrap mk-showcase">
        <div className="mk-showcase-text">
          <h2 id="showcase-title" className="mk-h2">
            <Tr>{c.title}</Tr>
          </h2>
          <p className="mk-lead">
            <Tr>{c.text}</Tr>
          </p>
          <ul className="mk-checks mk-checks-list">
            {c.points.map((p) => (
              <li key={p}>
                <Icon name="check" size={20} />
                <Tr>{p}</Tr>
              </li>
            ))}
          </ul>
          <Link className="mk-client" href={demoPath()} prefetch={false}>
            {/* eslint-disable-next-line @next/next/no-img-element -- nembo ndogo ya PNG iliyo tayari kwenye public/ */}
            <img className="mk-client-logo" src="/logo-zebra.png" alt="" width={64} height={64} loading="lazy" decoding="async" />
            <span className="mk-client-text">
              <small>
                <Tr>{c.client.label}</Tr>
              </small>
              <b>Zebra Restaurant</b>
              <span>
                <Tr>{c.client.meta}</Tr>
              </span>
            </span>
            <span className="mk-client-go">
              <span className="mk-client-url">
                {siteConfig.domain}
                {demoPath()}
              </span>
              <span className="mk-client-link">
                <Tr>{c.cta}</Tr>
                <Icon name="arrow" size={18} />
              </span>
            </span>
          </Link>
        </div>
        <figure className="mk-showcase-photos">
          <div className="mk-photo-grid">
            {PHOTOS.map((src, i) => (
              <div key={src} className="mk-photo">
                <Photo src={src} alt={c.alts[i] ?? ""} sizes="(min-width: 900px) 280px, 45vw" />
              </div>
            ))}
          </div>
          <figcaption>
            <Tr>{c.photosCaption}</Tr>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
