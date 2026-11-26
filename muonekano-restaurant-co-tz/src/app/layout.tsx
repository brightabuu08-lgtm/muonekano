// © Bright Abuu. Haki zote zimehifadhiwa.
import type { Metadata, Viewport } from "next";
import "@fontsource/gloock/400.css";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/600.css";
// Brand ya jukwaa (Tiketi + Ubao): fonti na tokens. Fonti zinapakuliwa na kivinjari tu ukurasa ukizitumia,
// kwa hiyo kurasa za Zebra (Gloock/Archivo) haziongezewi uzito.
import "@fontsource/funnel-display/600.css";
import "@fontsource/funnel-display/700.css";
import "@fontsource/funnel-sans/400.css";
import "@fontsource/funnel-sans/500.css";
import "@fontsource/funnel-sans/600.css";
import "@fontsource/funnel-sans/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import { LangHtml } from "./_components/Lang";
import "./globals.css";
import "../styles/brand.css";

export const metadata: Metadata = {
  title: "Menu ya mgahawa",
  description: "Menu ya kidijitali na oda za mgahawa.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#121110" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangHtml />
        {children}
      </body>
    </html>
  );
}
