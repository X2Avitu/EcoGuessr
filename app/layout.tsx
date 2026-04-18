import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoGuesser — The Biodiversity Game",
  description: "Guess the species. Learn the science. Help the planet. A daily Wordle-style biodiversity challenge.",
  keywords: ["biodiversity", "ecology", "nature", "guessing game", "conservation", "environment"],
  openGraph: {
    title: "EcoGuesser — The Biodiversity Game",
    description: "Guess the species. Learn the science. Help the planet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-emerald-200 selection:text-emerald-900`}>
        {children}
      </body>
    </html>
  );
}