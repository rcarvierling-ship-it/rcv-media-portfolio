"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  LayoutDashboard, BarChart3, Library, 
  Image as ImageIcon, Inbox, GitPullRequest, 
  FileText, Tag, Settings, Layout, 
  User, LogOut, ArrowUpRight, LayoutGrid
} from "lucide-react";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Bookings", href: "/dashboard/bookings" },
  { label: "Media", href: "/dashboard/media" },
  { label: "Galleries", href: "/dashboard/galleries" },
  { label: "Contracts", href: "/dashboard/contracts" },
  { label: "Pricing", href: "/dashboard/pricing" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Site Editor", href: "/dashboard/site" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      {/* Concept Top Navigation (Pill Style) */}
      <div className="pt-8 px-8 fixed top-0 left-0 right-0 z-50">
        <header className="max-w-[3200px] mx-auto bg-dark-panel text-white rounded-full py-3 px-6 flex items-center justify-between shadow-premium backdrop-blur-xl border border-white/5">
          <div className="flex items-center gap-10">
             <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center shadow-brand-glow">
                   <span className="text-black font-black text-xl italic">R</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] hidden xl:block">RCV.Media Dashboard</span>
             </Link>
             
             <nav className="hidden lg:flex items-center gap-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={cn(
                        "px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap",
                        isActive ? "bg-brand-accent text-black shadow-xl" : "text-zinc-400 hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
             </nav>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden xl:flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-2">
                <LayoutGrid size={16} className="text-brand-accent" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white w-40 placeholder:text-zinc-700" 
                />
             </div>
             
             <div className="relative group">
                <button className="w-12 h-12 rounded-full bg-zinc-800 p-0.5 border border-white/10 relative group-hover:border-brand-accent transition-all">
                   <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                      <User size={24} className="text-zinc-500" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-accent rounded-full border-2 border-dark-panel flex items-center justify-center shadow-brand-glow">
                      <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                   </div>
                </button>
                
                <div className="absolute top-[calc(100%+1rem)] right-0 w-64 bg-dark-panel border border-white/5 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all p-4 z-[100] backdrop-blur-xl">
                   <div className="p-6 border-b border-white/5 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Admin Profile</p>
                      <p className="text-sm font-black text-white italic">REESE VIERLING</p>
                   </div>
                   <div className="space-y-1">
                      <Link href="/dashboard/site" className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-full text-zinc-400 hover:text-brand-accent transition-all group/item">
                          <Settings size={16} className="group-hover/item:rotate-90 transition-transform" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Site Editor</span>
                      </Link>
                      <button 
                        onClick={async () => {
                          const { logout } = await import("@/app/actions/auth");
                          await logout();
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-full text-zinc-400 hover:text-red-500 transition-all"
                      >
                         <LogOut size={16} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Logout</span>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </header>
      </div>

      <div className="pt-32 px-8 max-w-[3200px] mx-auto">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
