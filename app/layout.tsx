import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carson & Muller Family Photos",
  description: "Family photos, organized and shared for everyone to enjoy.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
