"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Picha yenye maelezo (alt) yanayofuata lugha iliyochaguliwa. Inapakiwa taratibu (lazy) na next/image.
import Image from "next/image";
import { useT } from "../mk-lang";

export function Photo({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const t = useT();
  return <Image src={src} alt={t(alt)} fill sizes={sizes} />;
}
