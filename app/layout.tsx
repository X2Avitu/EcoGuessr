import ChatWidget from "@/components/ChatWidget";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Platz - Civic Cleanup Movement",
  description: "Turn neighborhood trash cleanup into a competitive, social, AI-powered civic movement.",
};

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebas.variable} ${dmSans.variable} dark`} suppressHydrationWarning>
      <body className="antialiased font-dmsans bg-background text-foreground">
          <main>{children}</main>
          <ChatWidget />
      </body>
    </html>
  );
}