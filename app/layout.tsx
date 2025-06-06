import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Pacifico } from "next/font/google";
import "./globals.css";
import Providers from "./provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: "Ticker",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bricolage.variable} ${pacifico.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
