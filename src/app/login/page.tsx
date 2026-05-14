"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center safe-padding">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">RCV.Media</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Admin Portal</p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500" htmlFor="email">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              required
              className="w-full bg-black border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500" htmlFor="password">Password</label>
            <input 
              id="password"
              name="password"
              type="password" 
              required
              className="w-full bg-black border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="text-red-500 text-sm font-semibold p-3 bg-red-500/10 border border-red-500/20">
              {state.error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isPending}
            className="w-full px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isPending ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
