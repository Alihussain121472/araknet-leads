import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Araknet | Business Lead Discovery",
  description: "Autonomous AI Lead Discovery & Digital Presence Audit Dashboard for Agencies & Developers",
};

import { ThemeProvider } from "./theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
