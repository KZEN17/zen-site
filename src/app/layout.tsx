import type { Metadata } from "next";
import { Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "ZEN House Calayo | Beach Accommodation in Nasugbu, Batangas",
  description:
    "Experience tranquility at ZEN House Calayo. Your perfect beach getaway in Nasugbu, Batangas, Philippines. Beachfront rooms, snorkeling, island hopping, and more.",
  keywords:
    "beach resort, Calayo, Nasugbu, Batangas, Philippines, beach accommodation, snorkeling, island hopping, vacation rental",
  openGraph: {
    title: "ZEN House Calayo | Beach Accommodation",
    description:
      "Your peaceful escape in Calayo, Nasugbu, Batangas, Philippines",
    type: "website",
    locale: "en_PH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${greatVibes.variable} antialiased font-sans`}
      >
        <Navigation />
        <Analytics />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
