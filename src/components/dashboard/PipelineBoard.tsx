"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft,
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Camera, 
  Edit3, 
  Send,
  MoreVertical,
  Link as LinkIcon,
  ArrowRightLeft,
  Loader2
} from "lucide-react";
import { updateBookingPipeline } from "@/app/actions/booking";
import { useRouter } from "next/navigation";

const STAGES = [
  { id: 'lead', label: 'Leads', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'shooting', label: 'Shooting', icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'editing', label: 'Editing', icon: Edit3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'delivered', label: 'Delivered', icon: Send, color: 'text-zinc-400', bg: 'bg-zinc-400/10' }
];

export default function PipelineBoard({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [movingId, setMovingId] = useState<string | null>(null);
  const router = useRouter();

  const handleMoveStage = async (bookingId: string, currentStage: string, direction: 'next' | 'prev') => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex < 0 || nextIndex >= STAGES.length) return;
    
    const nextStage = STAGES[nextIndex].id;
    setMovingId(bookingId);
    
    const result = await updateBookingPipeline(bookingId, { pipeline_stage: nextStage });
    if (result.success) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, pipeline_stage: nextStage } : b));
      router.refresh();
    }
    setMovingId(null);
  };

  const getBookingsByStage = (stageId: string) => {
    return bookings.filter(b => (b.pipeline_stage || 'lead') === stageId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full items-start overflow-x-auto pb-8 scrollbar-hide">
      {STAGES.map((stage) => (
        <div key={stage.id} className="flex flex-col h-full min-w-[320px] w-full lg:w-[320px]">
          {/* Stage Header */}
          <div className={`flex items-center justify-between mb-6 p-5 rounded-sm ${stage.bg} border border-white/5`}>
            <div className="flex items-center gap-3">
              <stage.icon size={18} className={stage.color} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{stage.label}</h3>
            </div>
            <span className="text-[10px] font-black text-zinc-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">
              {getBookingsByStage(stage.id).length}
            </span>
          </div>

          {/* List Area */}
          <div className="space-y-4 min-h-[200px]">
            <AnimatePresence mode="popLayout">
              {getBookingsByStage(stage.id).map((booking) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={booking.id}
                  className="bg-zinc-900 border border-white/5 p-6 rounded-sm hover:border-white/20 transition-all group relative"
                >
                  {movingId === booking.id && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-sm">
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-base font-black uppercase tracking-tight text-white truncate pr-4">{booking.name}</h4>
                    <span className="text-[9px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">
                      {booking.shoot_type}
                    </span>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black">
                        <div className="flex items-center gap-2 text-zinc-500">
                           <Clock size={12} />
                           <span>{booking.event_date}</span>
                        </div>
                        <span className={booking.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>
                           {booking.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                        </span>
                     </div>

                     {booking.total_amount > 0 && (
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                           <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Pipeline Value</span>
                           <span className="text-lg font-black text-white">${booking.total_amount.toLocaleString()}</span>
                        </div>
                     )}
                  </div>

                  {/* Stage Advancement Controls */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                     <button 
                       disabled={stage.id === 'lead' || movingId === booking.id}
                       onClick={() => handleMoveStage(booking.id, stage.id, 'prev')}
                       className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 text-white rounded-sm flex items-center justify-center transition-colors"
                     >
                        <ChevronLeft size={16} />
                     </button>
                     <button 
                       disabled={stage.id === 'delivered' || movingId === booking.id}
                       onClick={() => handleMoveStage(booking.id, stage.id, 'next')}
                       className="flex-1 py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-20 rounded-sm flex items-center justify-center transition-colors"
                     >
                        <ChevronRight size={16} />
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {getBookingsByStage(stage.id).length === 0 && (
              <div className="border border-dashed border-zinc-900 rounded-sm py-12 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-800">No Projects</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
