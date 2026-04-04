"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // @ts-ignore
  const username = session?.user?.username || session?.user?.name || "Traveller";
  const image = session?.user?.image || "";
  const getInitial = () => username.charAt(0).toUpperCase();

  const navLinks = [
    { href: "/destinations", label: "Destinations" },
    { href: "/experiences",  label: "Experiences"  },
    { href: "/journal",      label: "Journal"       },
    { href: "/about",        label: "About"         },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] z-50 glass-nav rounded-full px-8 py-3 flex items-center justify-between shadow-2xl shadow-[#D30C5C]/10 border border-white/10 text-white transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-[#EAED41] drop-shadow-md"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          explore
        </span>
        <Link href="/" className="font-headline font-black text-xl tracking-tight drop-shadow-sm">
          TravelFlow
        </Link>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-10">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors drop-shadow-sm ${
              pathname === href ? "text-[#EAED41]" : "hover:text-[#EAED41]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right side — Avatar / Login */}
      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
        ) : session ? (
          /* Logged in — show avatar linking to profile */
          <Link
            href="/profile"
            className="relative group"
            title={`Profile — ${username}`}
          >
            {image ? (
              <img
                src={image}
                alt={username}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/20 group-hover:border-[#EAED41]/60 transition-all shadow-lg"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D30C5C] to-[#DF33DF] flex items-center justify-center text-white font-headline font-black text-sm shadow-lg border-2 border-white/10 group-hover:border-[#EAED41]/60 transition-all">
                {getInitial()}
              </div>
            )}
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#050e1c] shadow" />
          </Link>
        ) : (
          /* Not logged in — show login button */
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-headline font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-base">login</span>
            Sign In
          </Link>
        )}

        {/* Mobile menu toggle */}
        <button
          className="material-symbols-outlined hover:text-[#EAED41] transition-colors md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? "close" : "menu"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-full mt-3 left-0 right-0 glass-nav rounded-3xl border border-white/10 px-6 py-5 flex flex-col gap-4 shadow-2xl md:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${
                pathname === href ? "text-[#EAED41]" : "text-white/80 hover:text-[#EAED41]"
              }`}
            >
              {label}
            </Link>
          ))}
          {session ? (
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-white/80 hover:text-[#EAED41] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">manage_accounts</span>
              My Profile
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-bold text-[#EAED41] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
