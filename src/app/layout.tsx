import type { Metadata } from "next";
import { Manrope, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EMI Dental Lab — Porosi digjitale",
  description:
    "Laboratoriumi i teknikës dentare. Plotësoni porosinë online dhe dërgoni PDF automatikisht me email.",
  metadataBase: new URL("https://emidental.lab"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" className={`${outfit.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-[var(--ink)] antialiased">{children}</body>
    </html>
  );
}
