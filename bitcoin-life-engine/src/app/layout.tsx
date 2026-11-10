import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Bitcoin Life Engine — Personalized Bitcoin Strategy Generator",
  description:
    "Create your personalized Bitcoin wealth-building roadmap. Educational tool that generates custom DCA strategies, allocation models, and 12-month action plans based on your life situation.",
  keywords: [
    "bitcoin",
    "DCA",
    "dollar cost averaging",
    "bitcoin strategy",
    "cryptocurrency education",
    "bitcoin calculator",
    "wealth building",
  ],
  openGraph: {
    title: "Bitcoin Life Engine — Personalized Bitcoin Strategy",
    description:
      "Get your free personalized Bitcoin strategy report. Educational tool with custom allocation models and action plans.",
    type: "website",
    siteName: "Bitcoin Life Engine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin Life Engine — Personalized Bitcoin Strategy",
    description:
      "Get your free personalized Bitcoin strategy report. Educational tool only.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} antialiased bg-[#0A0A0A] text-zinc-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
