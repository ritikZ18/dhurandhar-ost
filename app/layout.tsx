import type { Metadata } from "next";
import { Bebas_Neue, Share_Tech_Mono, Cormorant_Garamond, Rajdhani } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const mono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DHURANDHAR — THE REVENGE · OST",
  description: "Official Original Soundtrack for Dhurandhar: The Revenge. Music by Shashwat Sachdev.",
  keywords: ["Dhurandhar", "The Revenge", "OST", "Shashwat Sachdev", "Ranveer Singh"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${mono.variable} ${cormorant.variable} ${rajdhani.variable}`}>
      <body>{children}</body>
    </html>
  );
}
