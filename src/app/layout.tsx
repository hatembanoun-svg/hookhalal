import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HookHalal — 3×5s Video Hook Generator",
  description: "Open-source, halal-first video hook generator: no music, no faces.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
