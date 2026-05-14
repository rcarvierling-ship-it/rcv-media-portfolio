"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { deleteBooking } from "@/app/actions/booking";
import { 
  DollarSign, Users, Target, Trash2, 
  TrendingUp, Calendar, Filter, Download,
  Briefcase, ArrowUpRight, ArrowDownRight,
  Search, BarChart3, Activity, PieChart, Info,
  AlertTriangle, X, Clock, CheckCircle2, Camera, Edit3, Send, Loader2,
  Image as ImageIcon, HardDrive, Album
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [photosStats, setPhotosStats] = useState({ total: 0, masters: 0, albums: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [{ data: bData }, { count: pCount }, { count: rCount }, { count: aCount }] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("photos").select("*", { count: 'exact', head: true }),
        supabase.from("photos").select("*", { count: 'exact', head: true }).not("raw_image_url", "is", null),
        supabase.from("albums").select("*", { count: 'exact', head: true })
      ]);
      
      if (bData) setBookings(bData);
      setPhotosStats({ total: pCount || 0, masters: rCount || 0, albums: aCount || 0 });
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    const result = await deleteBooking(deletingId);
    if (result.success) {
      setBookings(bookings.filter(b => b.id !== deletingId));
      setDeletingId(null);
      router.refresh();
    }
  };

  const stats = useMemo(() => {
    // Stage-based categorization
    const leads = bookings.filter(b => (b.pipeline_stage || 'lead') === 'lead' && b.status !== 'canceled');
    const activePipeline = bookings.filter(b => (b.pipeline_stage !== 'lead' && b.pipeline_stage !== 'delivered') && b.status !== 'canceled');
    const delivered = bookings.filter(b => b.pipeline_stage === 'delivered');
    
    let realizedRevenue = 0; // Delivered + Paid
    let projectedPipeline = 0; // Lead + Confirmed + Shooting + Editing
    
    const revenueByMonth: Record<string, number> = {};
    const revenueByType: Record<string, number> = {};
    const countByStage: Record<string, number> = {};

    bookings.forEach(b => {
      if (b.status === 'canceled') return;
      
      const val = b.total_amount || 0;
      const stage = b.pipeline_stage || 'lead';
      
      countByStage[stage] = (countByStage[stage] || 0) + 1;

      if (['delivered', 'paid'].includes(stage)) {
        realizedRevenue += val;
        
        const month = new Date(b.created_at).toLocaleString('default', { month: 'short' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + val;
        revenueByType[b.shoot_type] = (revenueByType[b.shoot_type] || 0) + val;
      } else {
        projectedPipeline += val;
      }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const last6Months = [];
    for(let i = 5; i >= 0; i--) {
       const m = months[(currentMonthIdx - i + 12) % 12];
       last6Months.push({ month: m, amount: revenueByMonth[m] || 0 });
    }

    return {
      grossRevenue: realizedRevenue,
      projectedRevenue: projectedPipeline,
      activePipelineValue: projectedPipeline - (bookings.filter(b => b.pipeline_stage === 'lead').reduce((acc, curr) => acc + (curr.total_amount || 0), 0)),
      totalProjects: bookings.filter(b => b.status !== 'canceled').length,
      conversionRate: bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100) : 0,
      revenueByMonth: last6Months,
      revenueByType: Object.entries(revenueByType).sort((a, b) => b[1] - a[1]),
      countByStage
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.shoot_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || b.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [bookings, searchTerm, filterStatus]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
       <Loader2 className="animate-spin text-blue-500" size={40} />
       <p className="text-zinc-500 uppercase font-black tracking-[0.3em] text-[10px]">Generating Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
        <div>
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Intelligence.Hub</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">Business <br/><span className="text-zinc-800">Analytics.</span></h1>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-4 bg-white text-black rounded-sm text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2">
             <Download size={14} /> Export Dataset
           </button>
        </div>
      </header>

      {/* 2. LIVE PIPELINE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block flex items-center gap-2">Realized Revenue <Info size={10} className="opacity-30" /></span>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black tracking-tighter text-white">${stats.grossRevenue.toLocaleString()}</h3>
               <TrendingUp className="text-emerald-500 mb-2" size={18} />
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
               Delivered & Paid Projects
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Total Pipeline</span>
            <h3 className="text-4xl font-black tracking-tighter text-blue-500">${stats.projectedRevenue.toLocaleString()}</h3>
            <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
               Inquiries to Editing
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">In Fulfillment</span>
            <h3 className="text-4xl font-black tracking-tighter text-white">${stats.activePipelineValue.toLocaleString()}</h3>
            <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
               Confirmed projects
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Conversion</span>
            <h3 className="text-4xl font-black tracking-tighter text-white">{stats.conversionRate}%</h3>
            <div className="w-full h-1 bg-zinc-800 mt-6 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${stats.conversionRate}%` }} className="h-full bg-white" />
            </div>
         </motion.div>
      </div>
      
      {/* 2.5 MEDIA INTELLIGENCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/20 backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <ImageIcon size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Total Assets</span>
            </div>
            <h4 className="text-3xl font-black text-white mb-2">{photosStats.total}</h4>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Managed frames in library</p>
         </motion.div>

         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="premium-card p-8 rounded-sm border border-brand-accent/20 bg-brand-accent/5 backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-brand-accent/10 rounded-lg text-brand-accent">
                  <HardDrive size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Master Collection</span>
            </div>
            <h4 className="text-3xl font-black text-white mb-2">{photosStats.masters}</h4>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">High-resolution uncompressed masters</p>
         </motion.div>

         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/20 backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                  <Album size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Active Albums</span>
            </div>
            <h4 className="text-3xl font-black text-white mb-2">{photosStats.albums}</h4>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Client galleries & collections</p>
         </motion.div>
      </div>

      {/* 3. VISUAL INTELLIGENCE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* REVENUE CHART */}
         <section className="premium-card p-10 rounded-sm border border-white/5 bg-zinc-900/20 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                  <BarChart3 className="text-blue-500" size={18} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Revenue Growth</h3>
               </div>
               <span className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest">Confirmed & Delivered</span>
            </div>
            <div className="h-64 flex items-end gap-4 w-full px-4">
               {stats.revenueByMonth.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                     <div className="relative w-full flex flex-col justify-end h-full">
                        <motion.div 
                           initial={{ height: 0 }} 
                           animate={{ height: stats.grossRevenue > 0 ? `${(m.amount / stats.grossRevenue) * 100}%` : '4px' }}
                           className={`w-full ${m.amount > 0 ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-zinc-800/50'} rounded-t-sm group-hover:bg-blue-500 transition-all`}
                        >
                           {m.amount > 0 && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black px-3 py-1 rounded-sm font-black text-[10px] whitespace-nowrap">
                                 ${m.amount.toLocaleString()}
                              </div>
                           )}
                        </motion.div>
                     </div>
                     <span className="text-[10px] font-black uppercase text-zinc-600 group-hover:text-white transition-colors">{m.month}</span>
                  </div>
               ))}
            </div>
         </section>

         {/* PIPELINE DISTRIBUTION */}
         <section className="premium-card p-10 rounded-sm border border-white/5 bg-zinc-900/20 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                  <Activity className="text-emerald-500" size={18} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Pipeline Velocity</h3>
               </div>
               <span className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest">Projects by Stage</span>
            </div>
            <div className="space-y-6">
               {[
                 { id: 'lead', label: 'Leads', icon: Clock, color: 'bg-blue-500' },
                 { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'bg-emerald-500' },
                 { id: 'shooting', label: 'Shooting', icon: Camera, color: 'bg-purple-500' },
                 { id: 'editing', label: 'Editing', icon: Edit3, color: 'bg-amber-500' },
                 { id: 'delivered', label: 'Delivered', icon: Send, color: 'bg-zinc-500' }
               ].map((stage) => {
                 const count = stats.countByStage[stage.id] || 0;
                 const percentage = stats.totalProjects > 0 ? (count / stats.totalProjects) * 100 : 0;
                 return (
                    <div key={stage.id} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-2 text-white">
                             <stage.icon size={12} className="text-zinc-600" />
                             {stage.label}
                          </div>
                          <span className="text-zinc-500">{count} Active</span>
                       </div>
                       <div className="w-full h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${percentage}%` }}
                             className={`h-full ${stage.color}`}
                          />
                       </div>
                    </div>
                 );
               })}
            </div>
         </section>
      </div>

      {/* 4. MASTER RECORD LEDGER */}
      <section className="premium-card rounded-sm border border-white/5 bg-zinc-900/10 overflow-hidden">
         <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-900/40">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
               <input 
                 type="text" 
                 placeholder="Search ledger..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 pl-12 pr-6 py-3 rounded-sm text-xs text-white outline-none focus:border-blue-500/50 transition-all"
               />
            </div>
            <div className="flex items-center gap-4">
               <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="bg-black/40 border border-white/10 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest text-white outline-none"
               >
                  <option value="all">All Records</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
               </select>
            </div>
         </div>

          {/* RESPONSIVE TABLE / LIST */}
          <div className="overflow-hidden">
             {/* Desktop Table View */}
             <div className="hidden md:block">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/5 bg-zinc-900/20">
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Client / Shoot</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tier</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Value</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Stage</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Delete</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      <AnimatePresence>
                         {filteredBookings.map((b) => (
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
                                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{b.package_selected}</span>
                               </td>
                               <td className="px-8 py-6 text-white font-black text-sm">${(b.total_amount || 0).toLocaleString()}</td>
                               <td className="px-8 py-6">
                                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                     b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'
                                  }`}>
                                     {b.pipeline_stage || b.status}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingId(b.id); }}
                                    className="relative z-50 p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                               </td>
                            </motion.tr>
                         ))}
                      </AnimatePresence>
                   </tbody>
                </table>
             </div>

             {/* Mobile Card List View */}
             <div className="md:hidden space-y-4 p-4">
                <AnimatePresence>
                   {filteredBookings.map((b) => (
                      <motion.div 
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="premium-card p-6 border border-white/5 bg-zinc-900/40"
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <div className="font-black text-white uppercase tracking-tight text-lg">{b.name}</div>
                               <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">{b.shoot_type}</div>
                            </div>
                            <button onClick={() => setDeletingId(b.id)} className="text-zinc-700 hover:text-red-500"><Trash2 size={16} /></button>
                         </div>
                         <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-4">
                            <div>
                               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Tier</span>
                               <span className="text-[10px] text-zinc-400 font-bold uppercase">{b.package_selected}</span>
                            </div>
                            <div>
                               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Value</span>
                               <span className="text-sm text-white font-black">${(b.total_amount || 0).toLocaleString()}</span>
                            </div>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                               b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                               {b.pipeline_stage || b.status}
                            </span>
                         </div>
                      </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </div>
      </section>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-black/90 z-[700] flex items-center justify-center p-4 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
               className="bg-zinc-950 border border-red-500/20 p-10 w-full max-w-sm rounded-sm text-center"
             >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                   <AlertTriangle size={32} />
                 </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Confirm Delete</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">This will permanently remove this record from your analytics ledger.</p>
                <div className="flex gap-4">
                   <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-colors">Delete</button>
                   <button onClick={() => setDeletingId(null)} className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-colors">Cancel</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
