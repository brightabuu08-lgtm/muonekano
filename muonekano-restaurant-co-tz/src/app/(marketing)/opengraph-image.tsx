// (c) Bright Abuu. Haki zote zimehifadhiwa.
// Picha ya Open Graph ya "/" (Kiingereza, lugha kuu). Mchoro uko kwenye og.tsx; ya "/sw" iko kwenye sw/opengraph-image.tsx.
import { renderOgImage } from "./og";

export const alt = "QR menu, orders and admin for restaurants in Tanzania";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage("en");
}
