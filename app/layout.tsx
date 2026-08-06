import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clay Carson — Family, Travel & Art Photography",
  description: "Natural, story-led photography of families, journeys, and the art found in between.",
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
