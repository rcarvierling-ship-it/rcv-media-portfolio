"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: "/portfolio", label: "Portfolio" },
  { path: "/albums", label: "Albums" },
  { path: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 w-full z-[200] transition-all duration-500",
          scrolled ? "premium-glass py-4 border-b border-white/5 shadow-2xl" : "bg-transparent py-8"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-white hover:text-zinc-300 transition-colors z-50">
            RCV<span className="text-zinc-500">.</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10 bg-black/40 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full shadow-2xl">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative text-[11px] font-black tracking-[0.2em] uppercase transition-colors hover:text-white",
                    isActive ? "text-white" : "text-zinc-500"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center">
            <Link 
              href="/book"
              className="px-6 py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all hover:scale-105 transform duration-300 rounded-sm"
            >
              Book a Shoot
            </Link>
          </div>

          <button 
            className="md:hidden z-50 text-[11px] font-black uppercase tracking-[0.2em] text-white px-5 py-2.5 border border-white/20 rounded-sm premium-glass"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[150] bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-center pt-20"
          >
            <div className="flex flex-col items-center gap-12">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black uppercase tracking-tighter text-white hover:text-zinc-500 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link 
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-8 px-12 py-5 bg-white text-black text-sm font-black uppercase tracking-[0.2em] rounded-sm"
              >
                Book a Shoot
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
