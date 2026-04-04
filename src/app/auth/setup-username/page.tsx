"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SetupUsername() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If user already has a username, no need to be here
    // @ts-ignore
    if (session?.user?.username) {
      router.push("/");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/setup-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to set username");
      } else {
        // Update session so the new username is picked up everywhere
        await update({ username });
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050e1c] flex items-center justify-center">
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop" 
          alt="Setup Background" 
          className="w-full h-full object-cover mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass-nav rounded-[2.5rem] p-10 shadow-2xl border border-white/10 flex flex-col gap-8 w-full">
          <div className="text-center">
            <h1 className="font-headline font-bold text-3xl text-white mb-2 leading-tight">Last Step!</h1>
            <p className="text-white/60 text-sm font-medium">Choose a unique username to complete your profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">alternate_email</span>
              <input
                type="text"
                placeholder="Unique Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-base focus:outline-none focus:ring-2 focus:ring-[#EAED41]/50 transition-all placeholder:text-white/20"
                required
                minLength={3}
                pattern="^[a-zA-Z0-9_]+$"
                title="Username can only consist of letters, numbers, and underscores."
              />
              {error && <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{error}</p>}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-[3.5rem] bg-[#EAED41] text-[#050e1c] font-headline font-bold rounded-2xl text-[15px] transition-all shadow-lg hover:shadow-[#EAED41]/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#050e1c]/30 border-t-[#050e1c] rounded-full animate-spin"></div>
              ) : (
                "Finish Setup"
              )}
            </button>
          </form>
          
          <div className="text-center opacity-40">
            <p className="text-[10px] text-white tracking-widest uppercase font-bold">Authenticated as {session.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
