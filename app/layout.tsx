import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: "Araknet | Business Lead Discovery",
  description: "Find local businesses that need your services. Araknet audits their digital presence and generates outreach proposals automatically.",
  openGraph: {
    title: "Araknet — AI Lead Discovery",
    description: "Find, audit, and pitch local businesses in minutes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
  }
};

export const viewport = {
  themeColor: "#0A0F1E",
};

import { ThemeProvider } from "./theme-provider";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
