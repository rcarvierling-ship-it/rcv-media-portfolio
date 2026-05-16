"use client";

import { useState } from "react";
import { optimizeWorkflow } from "@/app/actions/booking";
import { Loader2, Zap } from "lucide-react";

export function OptimizeWorkflowButton() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const result = await optimizeWorkflow();
    if (result.success) {
      alert(result.message);
    } else {
      alert("Optimization encountered a tactical delay: " + result.error);
    }
    setIsOptimizing(false);
  };

  return (
    <button 
      onClick={handleOptimize}
      disabled={isOptimizing}
      className="w-full py-5 bg-brand-accent text-black font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50 rounded-full shadow-brand-glow"
    >
      {isOptimizing ? (
        <>
          <Loader2 className="animate-spin" size={14} /> Optimizing...
        </>
      ) : (
        <>
          Optimize Workflow
        </>
      )}
    </button>
  );
}
