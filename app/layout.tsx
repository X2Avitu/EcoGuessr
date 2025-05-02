// Import the ChatWidget component at the top
import ChatWidget from '@/components/ChatWidget'; // Ensure this path matches where you saved ChatWidget.tsx

// --- Keep all your existing imports ---
import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google"; // Corrected import name for font object
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { SidebarDemo } from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { Framer, Sidebar } from "lucide-react";
import Footer from "@/components/footer";
// --- End of existing imports ---

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

// --- Instantiate the font correctly ---
// Use the font object directly in className or through a variable
const geist = Geist({ // Renamed variable to lowercase 'geist' for convention
  display: "swap",
  subsets: ["latin"],
  // variable: '--font-geist-sans' // Optional: if you want to use it as a CSS variable
});
// --- End of font instantiation ---


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the font class to html or body
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body
        className="antialiased" // You can keep or merge other body classes
      >
        {/* Keep ThemeProvider if you are using it */}
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          {/* You might have other global layout components like Navbar, Sidebar here */}
          {/* e.g., <Navbar /> */}

          <main>{children}</main> {/* Render the specific page content */}

          {/* You might have other global layout components like Footer here */}
          {/* e.g., <Footer /> */}

          {/* Add the ChatWidget HERE, inside the body but outside the main content flow */}
          <ChatWidget />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}