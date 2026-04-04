"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", username: "", email: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (isLogin) {
        const result = await signIn("credentials", { redirect: false, email: formData.email, password: formData.password });
        if (result?.error) setError(result.error);
        else router.push("/");
      } else {
        const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Signup failed");
        } else {
          await signIn("credentials", { redirect: false, email: formData.email, password: formData.password });
          router.push("/");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050e1c] flex items-center justify-center">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-c6a4d142104d?q=80&w=2000&auto=format&fit=crop"
          alt="Login Background"
          className="w-full h-full object-cover scale-105 mix-blend-luminosity opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050e1c] via-[#050e1c]/90 to-purple-900/50" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <span
            className="material-symbols-outlined text-4xl text-[#EAED41] group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            explore
          </span>
          <span className="font-headline font-black text-3xl text-white tracking-tight drop-shadow-sm">
            TravelFlow
          </span>
        </Link>

        {/* Card */}
        <div className="glass-nav rounded-[2.5rem] p-8 shadow-2xl border border-white/10 flex flex-col w-full relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D30C5C]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="text-center mb-8">
            <h1 className="font-headline font-bold text-2xl text-white mb-2">
              {isLogin ? "Welcome Back" : "Start Journey"}
            </h1>
            <p className="text-white/50 text-sm font-medium">Capture your cinematic moments.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailPasswordAuth} className="flex flex-col gap-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">person</span>
                  <input
                    type="text" name="name" placeholder="Full Name"
                    value={formData.name} onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                    required
                  />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">alternate_email</span>
                  <input
                    type="text" name="username" placeholder="Choose Username"
                    value={formData.username} onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                    required
                  />
                </div>
              </>
            )}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">mail</span>
              <input
                type="email" name="email" placeholder="Email Address"
                value={formData.email} onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                required
              />
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">lock</span>
              <input
                type="password" name="password" placeholder="Password"
                value={formData.password} onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                required
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full h-[3.5rem] bg-gradient-to-r from-[#D30C5C] to-[#DF33DF] text-white font-headline font-bold rounded-2xl text-[15px] transition-all shadow-lg hover:opacity-90 active:scale-[0.98] mt-2 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : (isLogin ? "Sign In" : "Create Account")
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-[1px] flex-1 bg-white opacity-10" />
            <span className="text-white text-[10px] uppercase font-bold tracking-widest opacity-40">OR</span>
            <div className="h-[1px] flex-1 bg-white opacity-10" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full h-[3.5rem] bg-white text-[#050e1c] font-headline font-bold rounded-2xl text-[15px] transition-all hover:opacity-90 flex items-center justify-center gap-4 group"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[20px] h-[20px]" />
            <span>Continue with Google</span>
          </button>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
