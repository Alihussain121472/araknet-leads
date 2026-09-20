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
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-50 dark:bg-slate-950 dark:text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-blue-500 selection:text-slate-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
