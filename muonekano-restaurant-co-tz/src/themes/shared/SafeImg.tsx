"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
/* eslint-disable @next/next/no-img-element */
// Picha ya menu yenye mbadala: picha isipopatikana (haijapakiwa bado, au kiungo kimeharibika) inaonyeshwa herufi ya
// kwanza ya jina badala ya ikoni ya picha iliyovunjika. Mpokeaji anapaswa kutumia `key={src}` ili hali ya kosa ianze upya.
// Kosa linaweza kutokea kabla React haijaunganisha onError (picha huanza kupakiwa na HTML ya seva), kwa hiyo baada ya
// kuonyeshwa tunakagua pia `complete` na `naturalWidth`.
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string | undefined;
  letter: string;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
  /** Darasa la herufi mbadala. Kila muonekano una lake (zm-ph-l kwa Zebra, nm-ph-l kwa Nino). */
  fallbackClass?: string;
};

export default function SafeImg({ src, letter, alt = "", className, loading = "lazy", fallbackClass = "zm-ph-l" }: Props) {
  const [bad, setBad] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBad(true);
  }, []);
  if (!src || bad) {
    return (
      <span className={`${fallbackClass}${className ? ` ${className}` : ""}`} aria-hidden="true">
        {letter.slice(0, 1)}
      </span>
    );
  }
  return <img ref={ref} src={src} alt={alt} className={className} loading={loading} onError={() => setBad(true)} />;
}
