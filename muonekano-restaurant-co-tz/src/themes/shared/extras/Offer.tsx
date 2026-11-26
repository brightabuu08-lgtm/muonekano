// © Bright Abuu. Haki zote zimehifadhiwa.
// Bei yenye ofa ya leo: bei ya ofa, bei ya kawaida imekatwa na "-20%". Bila ofa: bei ya kawaida tu.
import { formatTZS } from "@/lib/money";
import { offerPercent } from "@/lib/menu-extras";
import { useT } from "@/app/_components/Lang";
import "./extras.css";

export function OfferPrice({ price, offer, showPercent = false }: { price: number; offer?: number | null; showPercent?: boolean }) {
  const t = useT();
  if (offer === null || offer === undefined) return <>{formatTZS(price)}</>;
  return (
    <>
      <span className="x-now">{formatTZS(offer)}</span>
      <s className="x-was" aria-label={t("Bei ya kawaida {price}", { price: formatTZS(price) })}>{formatTZS(price)}</s>
      {showPercent && <span className="x-off"> -{offerPercent(price, offer)}%</span>}
    </>
  );
}

/** Alama ndogo ya "Ofa" kwa kadi ya chakula. */
export function OfferTag({ className = "" }: { className?: string }) {
  const t = useT();
  return <span className={`x-off ${className}`.trim()}>{t("Ofa ya leo")}</span>;
}
