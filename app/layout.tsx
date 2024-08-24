import type { Metadata } from "next";
import "./globals.css";
import Footer from "./ui/footer/footer";
import Header from "./ui/header/header";

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
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
