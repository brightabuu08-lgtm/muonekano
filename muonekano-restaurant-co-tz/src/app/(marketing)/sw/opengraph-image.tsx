// (c) Bright Abuu. Haki zote zimehifadhiwa.
// Picha ya Open Graph ya "/sw" (Kiswahili). Mchoro uko kwenye og.tsx; ya "/" (Kiingereza) iko kwenye ../opengraph-image.tsx.
import { renderOgImage } from "../og";

export const alt = "Mfumo wa menu ya QR, oda na admin kwa migahawa Tanzania";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage("sw");
}
