import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "LUVU — Jouw cultuurapp",
  description: "Ontdek culturele events in jouw buurt. Concerts, theater, comedy, dans en meer — gepersonaliseerd voor jou.",
  openGraph: {
    title: "LUVU — Jouw cultuurapp",
    description: "Ontdek culturele events in jouw buurt.",
    siteName: "LUVU",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={geist.variable}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
