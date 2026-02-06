import type { Metadata } from "next";
import { Inter, Lexend, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import SessionProviders from "@/app/session-provider";
import { NavBar } from "@/components/common";

export const lexend = Lexend({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "600", "700", "800", "900"],
  variable: "--font-lexend",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "VinaCarbon",
  description: "Turn Your Fields Into Green Income.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.variable} ${inter.variable} ${playfair.variable} bg-ưhite text-charcoal antialiased min-h-screen flex flex-col`}
      >
        <SessionProviders>
          <NavBar />
          {children}
        </SessionProviders>
      </body>
    </html>
  );
}
