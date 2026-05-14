"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, Calendar, DollarSign, 
  ArrowRight, Mail, Phone, Trash2,
  RefreshCw, Check, Clock
} from "lucide-react";
import { updateBookingStage, deleteBooking } from "@/app/actions/crm";
import { createContractFromBooking } from "@/app/actions/contracts";
import { useRouter } from "next/navigation";

export function PipelineClient({ initialPipeline }: { initialPipeline: any[] }) {
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creatingContractId, setCreatingContractId] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateContract = async (bookingId: string) => {
    setCreatingContractId(bookingId);
    const res = await createContractFromBooking(bookingId);
    if (res.success) {
      router.push('/dashboard/contracts');
    }
    setCreatingContractId(null);
  };

  const handleMove = async (id: string, currentStage: string) => {
    const stages = pipeline.map(s => s.id);
    const currentIndex = stages.indexOf(currentStage);
    const nextStage = stages[currentIndex + 1];

    if (!nextStage) return;

    setUpdatingId(id);
    const result = await updateBookingStage(id, nextStage);
    
    if (result.success) {
      // Optimistic update
      setPipeline(prev => prev.map(stage => {
        if (stage.id === currentStage) {
          return { ...stage, items: stage.items.filter((i: any) => i.id !== id) };
        }
        if (stage.id === nextStage) {
          const item = prev.find(s => s.id === currentStage)?.items.find((i: any) => i.id === id);
          return { ...stage, items: [item, ...stage.items] };
        }
        return stage;
      }));
      router.refresh();
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this lead from the pipeline?")) return;
    const result = await deleteBooking(id);
    if (result.success) {
      setPipeline(prev => prev.map(stage => ({
        ...stage,
        items: stage.items.filter((i: any) => i.id !== id)
      })));
    }
  };

  return (
    <div className="flex-1 overflow-x-auto pb-6 -mx-8 px-8 flex gap-6 scrollbar-hide">
      {pipeline.map((stage) => (
        <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col h-full">
          {/* Stage Header */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stage.bg}`}>
                <stage.icon size={16} className={stage.color} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">{stage.label}</h3>
              <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
                {stage.items.length}
              </span>
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 bg-zinc-900/20 border border-white/5 rounded-2xl p-4 space-y-4 overflow-y-auto min-h-[500px]">
             <AnimatePresence mode="popLayout">
                {stage.items.map((item: any) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="premium-card bg-zinc-950 border border-white/5 p-5 rounded-xl group relative overflow-hidden"
                  >
                     {/* Progress Accent */}
                     <div className={`absolute top-0 left-0 w-1 h-full ${stage.color.replace('text-', 'bg-')}`} />
                     
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h4 className="text-white font-black uppercase tracking-tight text-sm mb-1">{item.name}</h4>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.shoot_type}</p>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-500 transition-all">
                           <Trash2 size={14} />
                        </button>
                     </div>

                     <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                           <Calendar size={12} className="text-zinc-600" />
                           {new Date(item.event_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-brand-accent uppercase tracking-widest">
                           <DollarSign size={12} />
                           ${Number(item.total_amount).toLocaleString()}
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                           <a href={`mailto:${item.email}`} className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                              <Mail size={12} />
                           </a>
                           {stage.id === 'lead' || stage.id === 'confirmed' ? (
                             <button 
                               onClick={() => handleCreateContract(item.id)}
                               disabled={creatingContractId === item.id}
                               className="p-2 bg-brand-accent/10 border border-brand-accent/20 rounded-lg text-brand-accent hover:bg-brand-accent hover:text-white transition-all flex items-center gap-2 px-3"
                             >
                                {creatingContractId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                <span className="text-[8px] font-black uppercase tracking-widest">Contract</span>
                             </button>
                           ) : null}
                        </div>
                        
                        {stage.id !== 'delivered' && (
                          <button
                            onClick={() => handleMove(item.id, stage.id)}
                            disabled={updatingId === item.id}
                            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white hover:text-brand-accent transition-all group/btn"
                          >
                             {updatingId === item.id ? (
                               <RefreshCw size={12} className="animate-spin text-brand-accent" />
                             ) : (
                               <>
                                 Next Stage <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                               </>
                             )}
                          </button>
                        )}
                        {stage.id === 'delivered' && (
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                             <Check size={12} /> Mission Complete
                          </div>
                        )}
                     </div>
                  </motion.div>
                ))}
             </AnimatePresence>

             {stage.items.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 border-2 border-dashed border-white/5 rounded-xl">
                  <Clock size={32} className="text-zinc-500 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No leads in queue</p>
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
}
