// © Bright Abuu. Haki zote zimehifadhiwa.
// Rating ya chakula kwa wateja: nyota, wastani na idadi ("★ 4.6 (12)"), na orodha ya maoni. Kwa muonekano wote;
// rangi zinatoka kwa vigezo vya extras.css (--x-*), ambavyo kila muonekano unaweza kubadilisha.
import { useT } from "@/app/_components/Lang";
import { filledStars, ratingText, reviewDate, type ItemRating } from "@/lib/menu-extras";
import "./extras.css";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d={STAR} />
    </svg>
  );
}

export function StarRow({ value, className = "" }: { value: number; className?: string }) {
  const n = filledStars(value);
  return (
    <span className={`x-stars ${className}`.trim()} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} className={i <= n ? "on" : undefined} />
      ))}
    </span>
  );
}

/** Muhtasari mfupi wa rating (kwa kadi ya chakula). Hakuna kitu kama chakula hakina rating bado. */
export function RatingBadge({ rating, className = "" }: { rating?: ItemRating | null; className?: string }) {
  const t = useT();
  if (!rating) return null;
  return (
    <span className={`x-badge ${className}`.trim()} role="img" aria-label={t("Nyota {avg} kati ya 5, rating {n}", { avg: ratingText(rating.avg), n: rating.count })}>
      <StarIcon />
      <b>{ratingText(rating.avg)}</b>
      <small>({rating.count})</small>
    </span>
  );
}

/** Rating na maoni ya wateja (kwa dirisha la chakula). */
export function ReviewList({ rating, className = "" }: { rating?: ItemRating | null; className?: string }) {
  const t = useT();
  if (!rating) {
    return <p className={`x-none ${className}`.trim()}>{t("Bado hakuna rating ya chakula hiki.")}</p>;
  }
  return (
    <section className={`x-reviews ${className}`.trim()} aria-label={t("Rating za wateja")}>
      <div className="x-sum">
        <b>{ratingText(rating.avg)}</b>
        <StarRow value={rating.avg} />
        <span>{rating.count === 1 ? t("rating 1") : t("rating {n}", { n: rating.count })}</span>
      </div>
      {rating.reviews.length > 0 && (
        <ul className="x-list">
          {rating.reviews.map((r, i) => (
            <li key={i}>
              <span className="x-meta">
                <StarRow value={r.rating} />
                <time dateTime={r.at}>{reviewDate(r.at)}</time>
              </span>
              <p>{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
