"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function PricingAdminClient({ initialPackages }: { initialPackages: any[] }) {
  const [packages, setPackages] = useState(initialPackages);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("pricing_packages").update({ is_active: !current }).eq("id", id);
    if (!error) {
      setPackages(packages.map(p => p.id === id ? { ...p, is_active: !current } : p));
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("pricing_packages").delete().eq("id", id);
    if (!error) {
      setPackages(packages.filter(p => p.id !== id));
      router.refresh();
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const featuresStr = formData.get("features") as string;
    const features = featuresStr.split("\n").filter(f => f.trim() !== "");

    const data = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      accent_color: formData.get("accent_color") as string,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
      features,
    };

    if (editingPackage?.id) {
      await supabase.from("pricing_packages").update(data).eq("id", editingPackage.id);
    } else {
      await supabase.from("pricing_packages").insert([data]);
    }

    setIsSaving(false);
    setEditingPackage(null);
    router.refresh();
    
    // Refresh local state (simplified)
    const { data: refreshed } = await supabase.from("pricing_packages").select("*").order("sort_order", { ascending: true });
    if (refreshed) setPackages(refreshed);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button 
          onClick={() => setEditingPackage({ name: "", price: "", features: [], accent_color: "brand-accent", sort_order: 0 })}
          className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200"
        >
          Add New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{pkg.name}</h3>
                  {!pkg.is_active && (
                    <span className="px-2 py-0.5 text-[8px] font-black bg-zinc-800 text-zinc-500 uppercase tracking-widest rounded-full">Inactive</span>
                  )}
                </div>
                <div className="text-3xl font-black text-white mb-4">{pkg.price}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingPackage(pkg)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <ul className="space-y-2 mb-8">
              {pkg.features?.map((f: string, i: number) => (
                <li key={i} className="text-zinc-500 text-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pkg.accent_color }} />
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleToggleActive(pkg.id, pkg.is_active)}
              className={`w-full py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                pkg.is_active ? 'border-zinc-800 text-zinc-500 hover:bg-zinc-800' : 'border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white'
              }`}
            >
              {pkg.is_active ? 'Set Inactive' : 'Set Active'}
            </button>
          </div>
        ))}
      </div>

      {editingPackage && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 p-10 w-full max-w-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                {editingPackage.id ? "Edit Package" : "New Package"}
              </h2>
              <button onClick={() => setEditingPackage(null)} className="text-zinc-500 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Package Name</label>
                  <input name="name" defaultValue={editingPackage.name} required className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Price Display</label>
                  <input name="price" defaultValue={editingPackage.price} placeholder="$450" required className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Accent Color (HEX)</label>
                  <input name="accent_color" defaultValue={editingPackage.accent_color} placeholder="#3b82f6" className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sort Order</label>
                  <input name="sort_order" type="number" defaultValue={editingPackage.sort_order} className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Features (One per line)</label>
                <textarea 
                  name="features" 
                  rows={6} 
                  defaultValue={editingPackage.features?.join("\n")}
                  className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500 resize-none"
                  placeholder="3 Hours Coverage&#10;50+ Edits&#10;48h Turnaround"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-zinc-200 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Package"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Minimal Framer Motion Mock if needed or just use simple div
import { motion } from "framer-motion";
