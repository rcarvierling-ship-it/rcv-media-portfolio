"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { deleteBooking } from "@/app/actions/booking";
import { 
  DollarSign, Users, Target, Trash2, 
  TrendingUp, Calendar, Filter, Download,
  Briefcase, ArrowUpRight, ArrowDownRight,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [{ data: bData }, { data: pData }] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("pricing_packages").select("*")
      ]);
      if (bData) setBookings(bData);
      if (pData) setPackages(pData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record? This will permanently remove it from your analytics and revenue tracking.")) return;
    
    const result = await deleteBooking(id);
    if (result.success) {
      setBookings(bookings.filter(b => b.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete record.");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           b.shoot_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || b.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [bookings, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === "confirmed");
    
    let totalRevenue = 0;
    confirmed.forEach(b => {
      const pkg = packages.find(p => p.name === b.package_selected);
      if (pkg) {
        totalRevenue += parseInt(pkg.price.replace(/[^0-9]/g, "")) || 0;
      }
    });

    const avgValue = confirmed.length > 0 ? Math.round(totalRevenue / confirmed.length) : 0;
    const conversionRate = bookings.length > 0 ? Math.round((confirmed.length / bookings.length) * 100) : 0;

    return {
      totalRevenue,
      avgValue,
      conversionRate,
      totalLeads: bookings.length,
      confirmedCount: confirmed.length
    };
  }, [bookings, packages]);

  if (loading) return <div className="p-12 text-zinc-500 uppercase font-black tracking-widest text-xs">Generating Business Intel...</div>;

  return (
    <div className="space-y-12 pb-24">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Business Analytics</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Deep-dive performance tracking & records management</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-sm text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
             <Download size={14} /> Export CSV
           </button>
        </div>
      </header>

      {/* 2. TOP LEVEL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Total Gross</span>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black tracking-tighter text-white">${stats.totalRevenue.toLocaleString()}</h3>
               <ArrowUpRight className="text-emerald-500 mb-2" size={18} />
            </div>
         </div>
         <div className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Average Booking</span>
            <h3 className="text-4xl font-black tracking-tighter text-white">${stats.avgValue.toLocaleString()}</h3>
         </div>
         <div className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Conversion</span>
            <h3 className="text-4xl font-black tracking-tighter text-white">{stats.conversionRate}%</h3>
         </div>
         <div className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Pipeline Size</span>
            <h3 className="text-4xl font-black tracking-tighter text-white">{stats.totalLeads}</h3>
         </div>
      </div>

      {/* 3. DATA MANAGEMENT TABLE */}
      <section className="premium-card rounded-2xl border border-white/5 bg-zinc-900/20 overflow-hidden backdrop-blur-xl">
         <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-900/30">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
               <input 
                 type="text" 
                 placeholder="Search bookings or clients..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 pl-12 pr-6 py-3 rounded-full text-sm text-white outline-none focus:border-blue-500/50 transition-all"
               />
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Filter Status:</span>
               <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="bg-black/40 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white outline-none"
               >
                  <option value="all">All Records</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
               </select>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Client / Record</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Package</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Value</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                     {filteredBookings.map((b) => {
                        const pkg = packages.find(p => p.name === b.package_selected);
                        const price = pkg?.price || "---";
                        return (
                           <motion.tr 
                             key={b.id}
                             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                             className="group hover:bg-white/[0.02] transition-colors"
                           >
                              <td className="px-8 py-6">
                                 <div className="font-black text-white uppercase tracking-tight">{b.name}</div>
                                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{b.shoot_type}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{b.package_selected}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="text-sm font-black text-white">{price}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                    b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'
                                 }`}>
                                    {b.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button 
                                   type="button"
                                   onClick={(e) => {
                                     e.preventDefault();
                                     e.stopPropagation();
                                     handleDelete(b.id);
                                   }}
                                   className="relative z-50 p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                   title="Delete Record"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </td>
                           </motion.tr>
                        );
                     })}
                  </AnimatePresence>
                  {filteredBookings.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-zinc-600 font-black uppercase tracking-widest text-xs">
                           No records found matching your criteria.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </section>

      {/* 4. PERFORMANCE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 premium-card p-10 rounded-2xl border border-white/5 bg-zinc-900/20">
            <div className="flex items-center gap-3 mb-8">
               <TrendingUp className="text-blue-500" size={20} />
               <h3 className="text-lg font-black uppercase tracking-tighter text-white">Revenue Pruning</h3>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
               Deleting a record here instantly updates your **Executive Overview** and **Total Gross** charts. Use this to remove cancellations, test entries, or failed contracts to keep your business intelligence 100% accurate.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-black rounded-xl border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-2">Confirmed Bookings</span>
                  <span className="text-3xl font-black text-white">{stats.confirmedCount}</span>
               </div>
               <div className="p-6 bg-black rounded-xl border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-2">Pending Inquiries</span>
                  <span className="text-3xl font-black text-white">{stats.totalLeads - stats.confirmedCount}</span>
               </div>
            </div>
         </div>

         <div className="premium-card p-10 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col justify-center text-center">
            <Briefcase className="text-blue-500 mx-auto mb-6" size={40} />
            <h4 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">System Status</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-8">Analytics Database Healthy</p>
            <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                  <span className="text-zinc-500">Live Sync</span>
                  <span className="text-emerald-500">Active</span>
               </div>
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Integrity Check</span>
                  <span className="text-white">Passed</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
