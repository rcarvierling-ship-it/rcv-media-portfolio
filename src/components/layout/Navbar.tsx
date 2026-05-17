"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

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

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 w-full z-[200] transition-all duration-500 pt-6 px-6",
        )}
      >
        <div className="max-w-[3200px] mx-auto flex items-center justify-between bg-card/80 backdrop-blur-2xl border border-white/5 px-6 py-2.5 rounded-full shadow-premium">
          <Link href="/" className="flex items-center gap-4 group z-[210]">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
               <span className="text-primary-foreground font-black text-xl">R</span>
            </div>
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] text-foreground">RCV.Media</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative px-6 py-2.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase transition-all hover:text-foreground",
                    isActive ? "bg-primary text-primary-foreground shadow-xl" : "text-zinc-500 hover:bg-secondary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/book"
              onClick={() => trackEvent('book_click', { location: 'navbar' })}
              className="px-8 py-3 bg-brand-accent text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent/90 transition-all hover:scale-105 transform duration-300 rounded-full shadow-brand-glow"
            >
              Book Session
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden z-[210] p-3 bg-secondary rounded-full text-foreground transition-colors border border-border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="fixed inset-0 z-[150] bg-background/95 backdrop-blur-3xl flex flex-col pt-32 px-10"
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
                      pathname === item.path ? "text-foreground" : "text-zinc-300 hover:text-foreground"
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
                  onClick={() => trackEvent('book_click', { location: 'mobile_nav' })}
                  className="w-full py-6 bg-primary text-primary-foreground text-center block text-sm font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-black/10"
                >
                  Book a Shoot
                </Link>
              </motion.div>
            </div>

            {/* Bottom Accent */}
            <div className="mt-auto pb-20">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">
                  RCV.Media Photography
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
