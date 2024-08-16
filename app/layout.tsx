import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Branchy",
  description: "An interactive and hands-on way to learn git",
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
