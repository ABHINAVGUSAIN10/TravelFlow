"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import DeleteAccountModal from "@/components/DeleteAccountModal";

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingImage, setEditingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="h-screen bg-[#050e1c] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // @ts-ignore
  const username = session?.user?.username || session?.user?.name || "Traveller";
  const email    = session?.user?.email || "";
  const image    = session?.user?.image || "";
  // @ts-ignore
  const role     = session?.user?.role || "user";
  const getInitial = () => username.charAt(0).toUpperCase();

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess("");

    const payload: Record<string, string> = {};
    if (editingUsername && newUsername) payload.username = newUsername;
    if (editingImage && imageUrl)       payload.image    = imageUrl;

    if (Object.keys(payload).length === 0) { setSaveLoading(false); return; }

    try {
      const res  = await fetch("/api/user/update", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to update profile");
      } else {
        if (payload.username) await update({ username: payload.username });
        setSaveSuccess("Profile updated successfully!");
        setEditingUsername(false); setEditingImage(false); setNewUsername(""); setImageUrl("");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch { setSaveError("An unexpected error occurred."); }
    finally   { setSaveLoading(false); }
  };

  return (
    <>
      <Navigation />
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}

      <div className="min-h-screen bg-[#050e1c] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* ── Profile Header Card ── */}
          <div className="glass-nav rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl border border-white/10">
            {/* Top accent banner */}
            <div className="absolute top-0 left-0 right-0 h-36 pointer-events-none rounded-t-[2.5rem] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#D30C5C]/20 to-[#DF33DF]/10" />
            </div>

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover shadow-2xl border-4 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D30C5C] to-[#DF33DF] flex items-center justify-center text-white font-headline font-black text-4xl shadow-2xl border-4 border-white/20">
                    {getInitial()}
                  </div>
                )}
                <button
                  onClick={() => { setEditingImage(!editingImage); setSaveError(""); }}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#EAED41] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  title="Change Photo"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#050e1c]">edit</span>
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <h1 className="font-headline font-black text-3xl text-white">{username}</h1>
                  {role === "admin" && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#D30C5C]/60 text-white px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
                <p className="text-white/50 text-sm mt-1 font-medium">{email}</p>
                <p className="text-white/30 text-xs mt-2 font-technical uppercase tracking-widest">
                  Member since {new Date(session?.user as any).getFullYear?.() ?? "2024"}
                </p>
              </div>

              {/* Edit Username Button */}
              <button
                onClick={() => { setEditingUsername(!editingUsername); setSaveError(""); }}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-headline transition-colors hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit Profile
              </button>
            </div>

            {/* ── Inline Edit Forms ── */}
            {(editingUsername || editingImage) && (
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4">
                {editingUsername && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#EAED41]">New Username</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">alternate_email</span>
                      <input
                        type="text"
                        placeholder="e.g. explorer_abhi"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#EAED41]/30 transition-all placeholder:text-white/20"
                      />
                    </div>
                  </div>
                )}
                {editingImage && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#EAED41]">Profile Image URL</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">image</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#EAED41]/30 transition-all placeholder:text-white/20"
                      />
                    </div>
                    {imageUrl && (
                      <img src={imageUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover mt-1 border border-white/10" onError={(e) => (e.currentTarget.style.display = "none")} />
                    )}
                  </div>
                )}

                {saveError   && <p className="text-red-400 text-xs font-medium">{saveError}</p>}
                {saveSuccess && <p className="text-green-400 text-xs font-medium">{saveSuccess}</p>}

                <button
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="self-start flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#D30C5C] to-[#DF33DF] text-white font-headline font-bold rounded-full text-sm transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {saveLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><span className="material-symbols-outlined text-base">save</span>Save Changes</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "flight_takeoff", label: "Trips Planned",  value: "—" },
              { icon: "location_on",    label: "Destinations",   value: "—" },
              { icon: "star",           label: "Member Tier",    value: role === "admin" ? "Admin" : "Explorer" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-nav rounded-2xl p-5 flex flex-col items-center gap-2 text-center border border-white/10"
              >
                <span className="material-symbols-outlined text-xl text-[#EAED41]">{stat.icon}</span>
                <span className="font-headline font-black text-2xl text-white">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── Trip History ── */}
          <div className="glass-nav rounded-[2rem] p-8 border border-white/10">
            <h2 className="font-headline font-bold text-xl text-white mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#EAED41]">luggage</span>
              Trip History
            </h2>
            <div className="flex flex-col items-center justify-center py-14 gap-4 rounded-2xl border border-dashed border-white/10">
              <span className="material-symbols-outlined text-5xl text-white/20">map</span>
              <p className="text-sm font-medium text-white/40 text-center max-w-xs">
                Your planned adventures will appear here. Start exploring and plan your first trip!
              </p>
              <Link
                href="/destinations"
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-[#D30C5C] to-[#DF33DF] text-white font-headline font-bold rounded-full text-sm transition-all hover:opacity-90 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">explore</span>
                Explore Destinations
              </Link>
            </div>
          </div>

          {/* ── Account Management ── */}
          <div className="glass-nav rounded-[2rem] p-8 flex flex-col gap-4 border border-white/10">
            <h2 className="font-headline font-bold text-xl text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-white/50">manage_accounts</span>
              Account
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-headline font-bold transition-all hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Log Out
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-headline font-bold transition-all hover:bg-red-500/20"
              >
                <span className="material-symbols-outlined text-base">delete_forever</span>
                Delete Account
              </button>
            </div>

            <p className="text-white/25 text-xs font-medium pt-2 border-t border-white/10">
              Deleting your account is permanent. All data associated with this account will be erased and cannot be recovered.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
