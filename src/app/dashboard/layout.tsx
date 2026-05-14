import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="flex flex-col md:flex-row container-premium h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-zinc-900 p-6 flex flex-col gap-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Media Library</h2>
            <nav className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Overview
              </Link>
              <Link href="/dashboard/analytics" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Analytics
              </Link>
              <Link href="/dashboard/media" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Library
              </Link>
              <Link href="/dashboard/albums" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Albums
              </Link>
              <Link href="/dashboard/bookings" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Command Center
              </Link>
            </nav>
          </div>
          
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Site</h2>
            <nav className="flex flex-col gap-2">
              <Link href="/dashboard/editor" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Site Editor
              </Link>
              <Link href="/dashboard/bookings" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Bookings
              </Link>
              <Link href="/dashboard/pricing" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Pricing
              </Link>
              <Link href="/dashboard/about" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                About
              </Link>
              <Link href="/dashboard/settings" className="text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Settings
              </Link>
              <button className="text-left text-red-500 hover:text-red-400 transition-colors px-3 py-2 rounded-md hover:bg-zinc-900">
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
