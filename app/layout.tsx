import type { Metadata } from "next";
import { Patrick_Hand, Short_Stack } from "next/font/google";
import "./globals.css";

const bodyFont = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-body",
  weight: "400",
});

const displayFont = Short_Stack({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Dumb Doodle Machine",
  description: "A stupid little website that turns prompts into low-effort doodles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}

