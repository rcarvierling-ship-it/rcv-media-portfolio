import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center safe-padding">
      <h1 className="text-8xl font-black uppercase tracking-tighter mb-4 text-white">404</h1>
      <p className="text-xl text-zinc-400 mb-8 uppercase tracking-widest">Page Not Found</p>
      <Link 
        href="/"
        className="px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
