import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Safe Streets Bernal — Cortland Ave Safety Map",
  description:
    "Interactive map of pedestrian safety improvements, proposals, and incident data along Cortland Avenue in Bernal Heights, San Francisco.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden flex flex-col">
        <SiteNav />
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
