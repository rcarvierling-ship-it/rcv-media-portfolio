import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black pt-20 overflow-x-hidden">
      <div className="flex flex-col md:flex-row container-premium min-h-[calc(100vh-80px)] overflow-hidden">
        {/* SIDEBAR / MOBILE NAV */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 p-4 md:p-6 flex flex-wrap md:flex-col gap-3 md:gap-8 sticky top-20 bg-black z-40">
          <div className="flex flex-wrap md:flex-col gap-4 md:gap-8 shrink-0">
            <div>
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 hidden md:block">Media Hub</h2>
              <nav className="flex flex-wrap md:flex-col gap-2">
                <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Overview
                </Link>
                <Link href="/dashboard/analytics" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Business Analytics
                </Link>
                <Link href="/dashboard/media" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Master Library
                </Link>
                <Link href="/dashboard/curated" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Curation Hub
                </Link>
                <Link href="/dashboard/albums" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Albums
                </Link>
              </nav>
            </div>
            
            <div>
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 hidden md:block">Agency Ops</h2>
              <nav className="flex flex-wrap md:flex-col gap-2">
                <Link href="/dashboard/visuals" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Visual Intelligence
                </Link>
                <Link href="/dashboard/pipeline" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Strategic Pipeline
                </Link>
                <Link href="/dashboard/contracts" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Contract Engine
                </Link>
                <Link href="/dashboard/pricing" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Pricing Engine
                </Link>
                <Link href="/dashboard/settings" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Vibe Settings
                </Link>
              </nav>
            </div>

            <div>
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 hidden md:block">Platform Design</h2>
              <nav className="flex flex-wrap md:flex-col gap-2">
                <Link href="/dashboard/editor" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Site Editor
                </Link>
                <Link href="/dashboard/about" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  About Mastery
                </Link>
                <button className="text-left text-red-500 hover:text-red-400 transition-colors px-3 py-2 rounded-sm hover:bg-zinc-900 text-xs font-bold whitespace-nowrap">
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
