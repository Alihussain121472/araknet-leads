import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Araknet | Business Lead Discovery",
  description: "Autonomous AI Lead Discovery & Digital Presence Audit Dashboard for Agencies & Developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
