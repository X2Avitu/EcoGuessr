"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 z-[100] flex w-full justify-center transition-all duration-300"
      style={{ padding: scrolled ? "1rem" : "0" }}
    >
      <nav
        className="w-full bg-[#0a0a0a]/80 backdrop-blur-md transition-all duration-300"
        style={{
          maxWidth: scrolled ? "64rem" : "100%",
          borderRadius: scrolled ? "1rem" : "0",
          borderBottom: scrolled ? "1px solid #333" : "none",
          boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 transition-all duration-300">
          <Link href="/" className="flex items-center">
            <span className="font-bebas text-4xl tracking-widest leading-none text-white">PLATZ</span>
            <span className="mb-2 ml-1 h-2 w-2 rounded-full bg-primary" />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/protected/map"
              className="font-dmsans text-xs font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white"
            >
              Live Map
            </Link>
            <Link
              href="/protected/squads"
              className="font-dmsans text-xs font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white"
            >
              Squads
            </Link>
            <Link
              href="/protected/profile"
              className="font-dmsans text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:text-white"
            >
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sign-in"
              className="font-dmsans text-xs font-bold uppercase tracking-[0.15em] text-gray-300 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 font-dmsans text-xs font-bold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-black"
            >
              Sign up
            </Link>
            <Link
              href="/protected/map"
              className="hidden items-center gap-2 rounded-lg bg-white px-4 py-2 font-bebas text-lg text-black transition-colors hover:scale-105 hover:bg-primary sm:flex"
            >
              DROP PIN
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
