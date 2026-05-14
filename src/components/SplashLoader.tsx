"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function SplashLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");
    if (hasShownSplash) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("hasShownSplash", "true");
    }, 2800); // Duration of the full sequence

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 0.8, ease: [0.87, 0, 0.13, 1] }
          }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          <div className="relative flex flex-col items-center">
            {/* Main Logo Reveal */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: "1em", filter: "blur(10px)" }}
              animate={{ 
                opacity: 1, 
                letterSpacing: "0.2em", 
                filter: "blur(0px)",
                transition: { duration: 1.2, ease: "easeOut" }
              }}
              className="relative"
            >
              <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-widest">
                RCV<span className="text-zinc-700">.</span>MEDIA
              </h1>
              
              {/* Scan Line Animation */}
              <motion.div 
                initial={{ left: "-10%", opacity: 0 }}
                animate={{ 
                  left: "110%", 
                  opacity: [0, 1, 0],
                  transition: { delay: 1, duration: 1, ease: "easeInOut" }
                }}
                className="absolute top-0 bottom-0 w-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
              />
            </motion.div>

            {/* Subtext Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 1.4, duration: 0.8 }
              }}
              className="mt-6 overflow-hidden"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
                Visual Agency <span className="mx-2 text-zinc-800">/</span> Production House
              </p>
            </motion.div>
          </div>

          {/* Background Textures */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
