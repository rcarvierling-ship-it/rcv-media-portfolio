"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: "/portfolio", label: "Portfolio" },
  { path: "/services", label: "Services" },
  { path: "/pricing", label: "Pricing" },
  { path: "/book", label: "Booking" },
  { path: "/client-galleries", label: "Galleries" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 w-full z-[200] transition-all duration-500",
          scrolled || mobileMenuOpen ? "premium-glass py-4 border-b border-white/5 shadow-2xl" : "bg-transparent py-8"
        )}
      >
        <div className="container-premium flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-white hover:text-zinc-300 transition-colors z-[210]">
            RCV<span className="text-zinc-500">.</span>
          </Link>
          
          {/* Desktop Nav */}
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
                      className="absolute -bottom-2 left-0 right-0 h-[2px] bg-brand-accent rounded-full shadow-[0_0_10px_var(--accent-glow)]"
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

          {/* Mobile Toggle */}
          <button 
            className="md:hidden z-[210] p-2 text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex flex-col pt-32 px-10"
          >
            <div className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.path}
                    className={cn(
                      "text-4xl md:text-5xl font-black uppercase tracking-tighter transition-colors",
                      pathname === item.path ? "text-white" : "text-zinc-700 hover:text-white"
                    )}
                  >
                    {item.label === "Booking" ? "Book a Shoot" : item.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-10 border-t border-white/5"
              >
                <Link 
                  href="/book"
                  className="w-full py-6 bg-white text-black text-center block text-sm font-black uppercase tracking-[0.3em] rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                  Book a Shoot
                </Link>
              </motion.div>
            </div>

            {/* Bottom Accent */}
            <div className="mt-auto pb-20">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800">
                  RCV.Media Digital Agency
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
