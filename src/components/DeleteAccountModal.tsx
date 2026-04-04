"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        await signOut({ redirect: false });
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md glass-nav rounded-[2rem] p-8 border border-red-500/30 overflow-hidden shadow-2xl shadow-[#D30C5C]/20">
        {/* Glowing danger line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        <div className="flex flex-col gap-6">
          {/* Icon & Heading */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
            </div>
            <h2 className="font-headline font-bold text-2xl text-white">Delete Account?</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              This action is <span className="text-red-400 font-bold">permanent and irreversible</span>. All your profile data will be wiped from our database forever.
            </p>
          </div>

          {/* Suggestion box */}
          <div className="bg-[#EAED41]/10 border border-[#EAED41]/25 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#EAED41] text-xl shrink-0 mt-0.5">lightbulb</span>
            <div>
              <p className="text-[10px] text-[#EAED41] font-bold uppercase tracking-wider mb-1">Suggestion</p>
              <p className="text-white/70 text-sm">
                If you're just taking a break, consider{" "}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-[#EAED41] font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  logging out
                </button>{" "}
                instead. Your data will be safe when you return.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full h-12 bg-red-500/90 hover:bg-red-500 text-white font-headline font-bold rounded-2xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">delete_forever</span>
                  Yes, Delete My Account
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full h-12 bg-white/5 border border-white/10 text-white/80 font-headline font-bold rounded-2xl text-sm transition-all active:scale-[0.98] hover:bg-white/10"
            >
              Cancel — Keep My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
