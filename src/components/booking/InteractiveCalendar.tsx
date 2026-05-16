"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InteractiveCalendarProps {
  onDateSelect: (date: string) => void;
  blockedDates: string[];
  minDays: number;
  maxDays: number;
  selectedDate: string;
}

export function InteractiveCalendar({
  onDateSelect,
  blockedDates,
  minDays,
  maxDays,
  selectedDate,
}: InteractiveCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minBookingDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + minDays);
    return d;
  }, [today, minDays]);

  const maxBookingDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + maxDays);
    return d;
  }, [today, maxDays]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = useMemo(() => {
    const count = daysInMonth(year, month);
    const start = firstDayOfMonth(year, month);
    const result = [];

    // Padding for start of week
    for (let i = 0; i < start; i++) {
      result.push({ day: null, key: `pad-${i}` });
    }

    for (let d = 1; d <= count; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split("T")[0];
      
      const isPast = date < today;
      const isTooSoon = date < minBookingDate;
      const isTooFar = date > maxBookingDate;
      const isBlocked = blockedDates.includes(dateStr);
      const isSelected = selectedDate === dateStr;
      
      const isDisabled = isPast || isTooSoon || isTooFar || isBlocked;

      result.push({
        day: d,
        dateStr,
        isDisabled,
        isBlocked,
        isTooSoon,
        isSelected,
        key: dateStr,
      });
    }

    return result;
  }, [year, month, today, minBookingDate, maxBookingDate, blockedDates, selectedDate]);

  return (
    <div className="premium-card p-4 md:p-8 rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black uppercase tracking-widest text-white">
          {monthName} <span className="text-zinc-600">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={prevMonth}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            type="button"
            onClick={nextMonth}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-600 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div key={d.key} className="aspect-square">
            {d.day && (
              <button
                type="button"
                disabled={d.isDisabled}
                onClick={() => onDateSelect(d.dateStr!)}
                className={`w-full h-full flex flex-col items-center justify-center rounded-sm text-sm font-bold transition-all relative group
                  ${d.isDisabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-brand-accent/20 hover:scale-105'}
                  ${d.isSelected ? 'bg-brand-accent text-black border border-brand-accent' : 'text-zinc-400'}
                `}
              >
                <span className="relative z-10">{d.day}</span>
                {d.isSelected && (
                  <motion.div 
                    layoutId="selectedDay"
                    className="absolute inset-0 border-2 border-brand-accent rounded-sm"
                  />
                )}
                {d.isToday && !d.isSelected && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand-accent rounded-sm" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-zinc-800 rounded-sm opacity-20" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Unavailable / Too Soon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-zinc-900 border border-zinc-800 rounded-sm" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Available</span>
        </div>
      </div>

      <style jsx>{`
        .diagonal-strike {
          position: relative;
        }
        .diagonal-strike::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 10%;
          right: 10%;
          height: 1px;
          background: currentColor;
          transform: rotate(-45deg);
        }
      `}</style>
    </div>
  );
}
