"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import DeleteAccountModal from "@/components/DeleteAccountModal";

interface Itinerary {
  _id: string;
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalCost: number;
  routeLegs: { mode: string; origin: string; destination: string; price: string; }[];
  hotel: { name: string; price?: string } | null;
  guide: { name: string; price?: string } | null;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
}

const MODE_ICONS: Record<string, string> = {
  flight: "flight", train: "train", taxi: "directions_car", bus: "directions_bus", transit: "directions_subway",
};
const MODE_COLORS: Record<string, string> = {
  flight: "#DF33DF", train: "#0EBCDC", taxi: "#EAED41", bus: "#3B6FE8",
};
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  upcoming:  { bg: "bg-[#3B6FE8]/15", text: "text-[#3B6FE8]", border: "border-[#3B6FE8]/30", label: "Upcoming" },
  completed: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Completed" },
  cancelled: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Cancelled" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

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

  // Itinerary state
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [itinerariesLoading, setItinerariesLoading] = useState(true);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItineraries() {
      try {
        const res = await fetch("/api/itinerary");
        if (res.ok) {
          const data = await res.json();
          setItineraries(data.itineraries || []);
        }
      } catch (err) {
        console.error("Failed to fetch itineraries:", err);
      } finally {
        setItinerariesLoading(false);
      }
    }
    if (status === "authenticated") fetchItineraries();
  }, [status]);

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

  // Stats
  const totalTrips = itineraries.length;
  const uniqueDestinations = new Set(itineraries.map(it => it.destination)).size;

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

  const handleCancelTrip = async (id: string, createdAt: string) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

    if (diffHours > 48) {
      alert("Cannot cancel trip after 2 days of booking.");
      return;
    }

    if (!confirm("Are you sure you want to cancel this trip?")) return;

    try {
      const res = await fetch("/api/itinerary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setItineraries(prev => prev.filter(it => it._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel trip");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    }
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
              { icon: "flight_takeoff", label: "Trips Planned",  value: totalTrips > 0 ? String(totalTrips) : "—" },
              { icon: "location_on",    label: "Destinations",   value: uniqueDestinations > 0 ? String(uniqueDestinations) : "—" },
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

            {itinerariesLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-32 border border-white/5" />
                ))}
              </div>
            ) : itineraries.length === 0 ? (
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
            ) : (
              <div className="flex flex-col gap-4">
                {itineraries.map((trip) => {
                  const statusStyle = STATUS_STYLES[trip.status] || STATUS_STYLES.upcoming;
                  const primaryMode = trip.routeLegs?.[0]?.mode || "taxi";
                  const modeColor = MODE_COLORS[primaryMode] || "#3B6FE8";
                  const isExpanded = expandedTripId === trip._id;
                  const tripDays = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  const diffHours = (new Date().getTime() - new Date(trip.createdAt).getTime()) / (1000 * 60 * 60);

                  return (
                    <div
                      key={trip._id}
                      onClick={() => setExpandedTripId(isExpanded ? null : trip._id)}
                      className={`rounded-2xl border transition-all cursor-pointer ${
                        isExpanded
                          ? "bg-[#0d1825] border-white/15 shadow-2xl shadow-black/30"
                          : "bg-white/[0.03] border-white/5 hover:border-white/15"
                      }`}
                    >
                      {/* ── Card Header (always visible) ── */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${modeColor}20` }}
                            >
                              <span className="material-symbols-outlined text-lg" style={{ color: modeColor }}>
                                {MODE_ICONS[primaryMode] || "flight"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-headline font-bold text-lg text-white">
                                {trip.source} → {trip.destination}
                              </h3>
                              <p className="text-white/40 text-xs font-technical">
                                {formatDate(trip.startDate)} — {formatDate(trip.endDate)} • {trip.travelers} traveler{trip.travelers !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              {statusStyle.label}
                            </span>
                            <span className={`material-symbols-outlined text-white/30 text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                              expand_more
                            </span>
                          </div>
                        </div>

                        {/* Summary row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {trip.routeLegs?.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                              {trip.routeLegs.map((leg, i) => (
                                <span key={i} className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]" style={{ color: MODE_COLORS[leg.mode] || "#999" }}>
                                    {MODE_ICONS[leg.mode] || "route"}
                                  </span>
                                  {i < trip.routeLegs.length - 1 && (
                                    <span className="material-symbols-outlined text-[8px] text-white/15">chevron_right</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                          {trip.hotel && (
                            <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                              <span className="material-symbols-outlined text-[12px] text-[#D30C5C]">bed</span>
                              <span className="text-[10px] text-white/50 font-technical truncate max-w-[120px]">{trip.hotel.name}</span>
                            </div>
                          )}
                          {trip.guide && (
                            <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                              <span className="material-symbols-outlined text-[12px] text-[#0DF5E3]">person</span>
                              <span className="text-[10px] text-white/50 font-technical truncate max-w-[100px]">{trip.guide.name}</span>
                            </div>
                          )}
                          <div className="ml-auto text-right">
                            <span className="font-headline font-bold text-lg text-[#EAED41]">
                              ₹{trip.totalCost.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Expanded Details ── */}
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="px-5 pb-5 border-t border-white/5 pt-5 space-y-5">

                          {/* Trip Overview */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/5">
                              <span className="material-symbols-outlined text-[#EAED41] text-lg block mb-1">calendar_month</span>
                              <p className="font-headline font-bold text-white text-sm">{tripDays} Days</p>
                              <p className="text-[9px] text-white/30 font-technical uppercase tracking-widest">Duration</p>
                            </div>
                            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/5">
                              <span className="material-symbols-outlined text-[#0DF5E3] text-lg block mb-1">group</span>
                              <p className="font-headline font-bold text-white text-sm">{trip.travelers}</p>
                              <p className="text-[9px] text-white/30 font-technical uppercase tracking-widest">Travelers</p>
                            </div>
                            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/5">
                              <span className="material-symbols-outlined text-[#EAED41] text-lg block mb-1">payments</span>
                              <p className="font-headline font-bold text-[#EAED41] text-sm">₹{trip.totalCost.toLocaleString("en-IN")}</p>
                              <p className="text-[9px] text-white/30 font-technical uppercase tracking-widest">Total Cost</p>
                            </div>
                          </div>

                          {/* Route Legs Timeline */}
                          {trip.routeLegs?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-technical uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-[#3B6FE8]">route</span>
                                Route Details
                              </h4>
                              <div className="relative pl-6">
                                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15)_50%,transparent_50%)] bg-[length:1px_8px]" />
                                {trip.routeLegs.map((leg, i) => {
                                  const legColor = MODE_COLORS[leg.mode] || "#3B6FE8";
                                  return (
                                    <div key={i} className="relative mb-3 last:mb-0">
                                      <div
                                        className="absolute -left-[19px] top-3 w-3.5 h-3.5 rounded-full border-2 border-[#0d1825] z-10"
                                        style={{ background: legColor }}
                                      />
                                      <div className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between border border-white/5">
                                        <div className="flex items-center gap-3">
                                          <span className="material-symbols-outlined text-sm" style={{ color: legColor }}>
                                            {MODE_ICONS[leg.mode] || "route"}
                                          </span>
                                          <div>
                                            <p className="text-sm font-headline font-semibold text-white">
                                              {leg.origin.split(",")[0]} → {leg.destination.split(",")[0]}
                                            </p>
                                            <p className="text-[10px] text-white/35 font-technical">
                                              {leg.duration} • {leg.distanceKm} km • {leg.mode.toUpperCase()}
                                            </p>
                                          </div>
                                        </div>
                                        <span className="font-headline font-bold text-sm" style={{ color: legColor }}>{leg.price}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Hotel Details */}
                          {trip.hotel && (
                            <div>
                              <h4 className="text-xs font-technical uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-[#D30C5C]">bed</span>
                                Accommodation
                              </h4>
                              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-[#D30C5C]/15 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#D30C5C]">hotel</span>
                                  </div>
                                  <div>
                                    <p className="font-headline font-bold text-white text-sm">{trip.hotel.name}</p>
                                    {trip.hotel.price && (
                                      <p className="text-[10px] text-white/40 font-technical">Room: {trip.hotel.price}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  ✓ Reserved
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Guide Details */}
                          {trip.guide && (
                            <div>
                              <h4 className="text-xs font-technical uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-[#0DF5E3]">person</span>
                                Tour Guide
                              </h4>
                              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#0DF5E3]/15 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#0DF5E3]">support_agent</span>
                                  </div>
                                  <div>
                                    <p className="font-headline font-bold text-white text-sm">{trip.guide.name}</p>
                                    {trip.guide.price && (
                                      <p className="text-[10px] text-white/40 font-technical">Fee: {trip.guide.price}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  ✓ Hired
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Booked on */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <p className="text-[10px] text-white/25 font-technical uppercase tracking-widest">
                              Booked on {formatDate(trip.createdAt)}
                            </p>
                            <div className="flex items-center gap-4">
                              {trip.status === "upcoming" && diffHours <= 48 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCancelTrip(trip._id, trip.createdAt); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                                  Cancel Trip
                                </button>
                              )}
                              <Link
                                href={`/plan?source=${encodeURIComponent(trip.source)}&dest=${encodeURIComponent(trip.destination)}&tab=timeline`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-[#3B6FE8] text-xs font-bold hover:underline"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                View in Planner
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
