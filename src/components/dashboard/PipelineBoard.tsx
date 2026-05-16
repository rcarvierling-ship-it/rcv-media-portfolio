"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  CheckCircle2, 
  Camera, 
  Edit3, 
  Send,
  Loader2,
  Calendar
} from "lucide-react";

const STAGES = [
  { id: 'lead', label: 'Leads', icon: Clock, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  { id: 'confirmed', label: 'Booked', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'shooting', label: 'Shooting', icon: Camera, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  { id: 'editing', label: 'Editing', icon: Edit3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'delivered', label: 'Delivered', icon: Send, color: 'text-zinc-400', bg: 'bg-zinc-400/10' }
];

interface PipelineBoardProps {
  bookings: any[];
  onMoveStage: (id: string, nextStage: string) => Promise<void>;
  movingId: string | null;
}

export default function PipelineBoard({ bookings, onMoveStage, movingId }: PipelineBoardProps) {
  
  const handleMove = (bookingId: string, currentStage: string, direction: 'next' | 'prev') => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex < 0 || nextIndex >= STAGES.length) return;
    onMoveStage(bookingId, STAGES[nextIndex].id);
  };

  const getBookingsByStage = (stageId: string) => {
    return bookings.filter(b => (b.pipeline_stage || 'lead') === stageId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full items-start overflow-x-auto pb-8 scrollbar-hide">
      {STAGES.map((stage) => (
        <div key={stage.id} className="flex flex-col h-full min-w-[260px] flex-1">
          {/* Stage Header */}
          <div className={`flex items-center justify-between mb-4 p-4 rounded-sm ${stage.bg} border border-white/5`}>
            <div className="flex items-center gap-3">
              <stage.icon size={16} className={stage.color} />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{stage.label}</h3>
            </div>
            <span className="text-[9px] font-black text-zinc-500 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
              {getBookingsByStage(stage.id).length}
            </span>
          </div>

          {/* List Area */}
          <div className="space-y-3 min-h-[200px]">
            <AnimatePresence mode="popLayout">
              {getBookingsByStage(stage.id).map((booking) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={booking.id}
                  className="bg-card backdrop-blur-md border border-white/5 p-4 rounded-sm hover:border-white/20 transition-all group relative"
                >
                  {movingId === booking.id && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-sm">
                      <Loader2 className="animate-spin text-brand-accent" size={20} />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white truncate pr-2">{booking.name}</h4>
                    <span className="text-[8px] font-bold text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded-sm border border-white/5 whitespace-nowrap">
                      {booking.shoot_type}
                    </span>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-black">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                           <Clock size={10} />
                           <span>{booking.event_date}</span>
                        </div>
                        <span className={booking.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>
                           {booking.payment_status === 'paid' ? 'PAID' : 'DUE'}
                        </span>
                     </div>

                     {booking.total_amount > 0 && (
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                           <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Value</span>
                           <span className="text-sm font-black text-white">${booking.total_amount.toLocaleString()}</span>
                        </div>
                     )}
                  </div>

                  {/* Stage Advancement Controls */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex gap-1.5">
                     <button 
                       disabled={stage.id === 'lead' || movingId === booking.id}
                       onClick={() => handleMove(booking.id, stage.id, 'prev')}
                       className="flex-1 py-2 bg-secondary hover:bg-zinc-800 disabled:opacity-20 text-white rounded-sm flex items-center justify-center transition-colors"
                     >
                        <ChevronLeft size={14} />
                     </button>
                     <button 
                       disabled={stage.id === 'delivered' || movingId === booking.id}
                       onClick={() => handleMove(booking.id, stage.id, 'next')}
                       className="flex-1 py-2 bg-brand-accent text-black hover:brightness-110 disabled:opacity-20 rounded-sm flex items-center justify-center transition-colors"
                     >
                        <ChevronRight size={14} />
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {getBookingsByStage(stage.id).length === 0 && (
              <div className="border border-dashed border-zinc-900 rounded-sm py-8 text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-800">Empty</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
