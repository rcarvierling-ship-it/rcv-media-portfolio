"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Camera, 
  Edit3, 
  Send,
  MoreVertical,
  Link as LinkIcon
} from "lucide-react";
import { updateBookingStatus } from "@/app/actions/booking";

const STAGES = [
  { id: 'lead', label: 'Leads', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'shooting', label: 'Shooting', icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'editing', label: 'Editing', icon: Edit3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'delivered', label: 'Delivered', icon: Send, color: 'text-zinc-400', bg: 'bg-zinc-400/10' }
];

export default function PipelineBoard({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings);

  const getBookingsByStage = (stageId: string) => {
    return bookings.filter(b => (b.pipeline_stage || 'lead') === stageId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-full items-start">
      {STAGES.map((stage) => (
        <div key={stage.id} className="flex flex-col h-full min-w-[280px]">
          {/* Stage Header */}
          <div className={`flex items-center justify-between mb-4 p-4 rounded-lg ${stage.bg} border border-white/5`}>
            <div className="flex items-center gap-3">
              <stage.icon size={16} className={stage.color} />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">{stage.label}</h3>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 bg-black/40 px-2 py-0.5 rounded-full">
              {getBookingsByStage(stage.id).length}
            </span>
          </div>

          {/* Draggable/List Area */}
          <div className="space-y-4">
            {getBookingsByStage(stage.id).map((booking) => (
              <motion.div
                layoutId={booking.id}
                key={booking.id}
                className="bg-zinc-900 border border-white/5 p-5 rounded-sm hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-bold text-white truncate pr-4">{booking.name}</h4>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-black">
                      <span className="text-zinc-500">{booking.shoot_type}</span>
                      <span className={booking.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                         {booking.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                      </span>
                   </div>

                   <div className="flex items-center gap-2 text-xs text-zinc-400 font-light">
                      <Clock size={12} className="text-zinc-600" />
                      <span>{booking.event_date}</span>
                   </div>

                   {booking.total_amount > 0 && (
                      <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Revenue</span>
                         <span className="text-sm font-black text-white">${booking.total_amount}</span>
                      </div>
                   )}
                </div>

                {/* Quick Actions (Appear on hover) */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-[9px] font-black uppercase tracking-widest p-2 bg-white text-black hover:bg-zinc-200 rounded-sm text-center">
                      Edit
                   </button>
                   <button className="text-[9px] font-black uppercase tracking-widest p-2 bg-zinc-800 text-white hover:bg-zinc-700 rounded-sm text-center">
                      Move
                   </button>
                </div>
              </motion.div>
            ))}

            {getBookingsByStage(stage.id).length === 0 && (
              <div className="border border-dashed border-zinc-800 rounded-lg p-8 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Empty Stage</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
