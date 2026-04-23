"use client";

import { useEffect, useState } from "react";

interface JLeg {
  mode: "flight" | "train" | "taxi" | "bus" | "transit";
  origin: string;
  destination: string;
  duration: string;
  durationMins: number;
  price: string;
  distanceKm: number;
}

export interface BookedHotel {
  name: string;
  address?: string;
  price?: string;
  roomType?: string;
}

interface Props {
  source?: string;
  destination?: string;
  bookedHotel?: BookedHotel | null;
  routesList?: JLeg[][];
  activeRouteIdx?: number;
  setActiveRouteIdx?: (idx: number) => void;
  loading?: boolean;
  error?: boolean;
}

// Mode → visual identity
const MODE_META: Record<string, { icon: string; color: string; label: string; bgClass: string }> = {
  flight:  { icon: "flight",            color: "#DF33DF", label: "Flight",  bgClass: "bg-[#DF33DF]" },
  train:   { icon: "train",             color: "#0EBCDC", label: "Train",   bgClass: "bg-[#0EBCDC]" },
  bus:     { icon: "directions_bus",    color: "#3B6FE8", label: "Bus",     bgClass: "bg-[#3B6FE8]" },
  taxi:    { icon: "directions_car",    color: "#EAED41", label: "Taxi",    bgClass: "bg-[#EAED41]" },
  transit: { icon: "directions_subway", color: "#22C55E", label: "Transit", bgClass: "bg-[#22C55E]" },
};

function ElevationSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const minE = Math.min(...data);
  const maxE = Math.max(...data);
  const range = maxE - minE || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - minE) / range) * 100}`).join(" ");
  
  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="flex justify-between text-[9px] font-technical uppercase tracking-widest text-white/40 mb-1">
        <span>Elevation Profile</span>
        <span>{minE}m — {maxE}m</span>
      </div>
      <div className="h-8 w-full bg-black/20 rounded overflow-hidden relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-60">
          <polyline fill="none" stroke="#EAED41" strokeWidth="3" vectorEffect="non-scaling-stroke" points={pts} />
          <polygon fill="url(#grad)" points={`0,100 ${pts} 100,100`} />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAED41" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EAED41" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// Accumulate departure time from start (21:30 on Day 1)
function computeTimes(legs: JLeg[]) {
  let mins = 21 * 60 + 30; // 21:30
  return legs.map(leg => {
    const hh = Math.floor(mins / 60) % 24;
    const mm = mins % 60;
    const label = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    mins += leg.durationMins + 15; // 15 min buffer between legs
    return label;
  });
}

export default function TimelineTab({ 
  source = "New Delhi", 
  destination = "Destination", 
  bookedHotel,
  routesList = [],
  activeRouteIdx = 0,
  setActiveRouteIdx,
  loading = false,
  error = false
}: Props) {
  
  const legs = routesList[activeRouteIdx] || [];

  const times = computeTimes(legs);

  if (loading) {
    return (
      <div className="fade-in flex flex-col gap-5">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse bg-[#16202f] rounded-2xl h-28 border border-white/5" />
        ))}
      </div>
    );
  }

  if (error || legs.length === 0) {
    return (
      <div className="fade-in flex flex-col items-center justify-center gap-4 py-16 text-white/40">
        <span className="material-symbols-outlined text-5xl">route</span>
        <p className="text-sm font-medium">Could not load route for {source} → {destination}</p>
        <p className="text-xs">Check your internet connection or try a different source city.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 fade-in mt-4">
      {/* ── Alternate Routes Switcher ── */}
      {routesList.length > 1 && (
        <div className="absolute top-0 right-0 -translate-y-12 flex gap-2">
          {routesList.map((route, idx) => {
            const mainMode = route.find(l => l.mode === "flight")?.mode 
                          || route.find(l => l.mode === "train")?.mode 
                          || "bus";
            const meta = MODE_META[mainMode];
            return (
              <button
                key={`route-opt-${idx}`}
                onClick={() => setActiveRouteIdx && setActiveRouteIdx(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                  activeRouteIdx === idx
                    ? 'border-[#3B6FE8] text-[#3B6FE8] bg-[#3B6FE8]/10 shadow-[0_0_15px_rgba(59,111,232,0.3)]'
                    : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{meta?.icon}</span>
                Option {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Vertical dashed line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[linear-gradient(to_bottom,rgba(255,255,255,0.2)_50%,transparent_50%)] bg-[length:1px_12px]" />

      {/* ── Transport legs ── */}
      {legs.map((leg, idx) => {
        const meta = MODE_META[leg.mode] ?? MODE_META.taxi;
        return (
          <div className="relative mb-8 group" key={`leg-${idx}`}>
            {/* Timeline dot */}
            <div
              className={`absolute -left-[28px] top-6 w-5 h-5 rounded-full border-4 border-[#0a1422] z-10 ${meta.bgClass}`}
              style={{ boxShadow: `0 0 14px ${meta.color}60` }}
            />
            <div className="bg-[#16202f] rounded-2xl p-6 flex gap-6 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 hover:border-white/20">
              {/* Color sidebar */}
              <div className="w-2 rounded-full shrink-0" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}50` }} />
              <div className="flex-1 text-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-sm" style={{ color: meta.color }}>{meta.icon}</span>
                      <span className="font-technical text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                        {meta.label} · Leg {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-headline font-bold text-white leading-tight">
                      {leg.origin.split(",")[0]} → {leg.destination.split(",")[0]}
                    </h3>
                    <p className="text-sm text-white/50 mt-0.5">{leg.distanceKm} km · {leg.duration}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#EAED41] font-technical">{(leg as any).departureTime || times[idx]}</p>
                    <p className="text-xs text-white/50 font-technical mt-0.5">Oct {12 + idx}</p>
                    <p className="text-sm font-bold text-white mt-1">{leg.price}</p>
                  </div>
                </div>
                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                  {leg.mode === "flight" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DF33DF]/10 text-[#DF33DF] border border-[#DF33DF]/20">Direct Flight</span>
                  )}
                  {leg.mode === "bus" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3B6FE8]/10 text-[#3B6FE8] border border-[#3B6FE8]/20">AC Sleeper</span>
                  )}
                  {leg.mode === "taxi" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAED41]/10 text-[#EAED41] border border-[#EAED41]/20">Private Cab</span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                    {leg.distanceKm} km
                  </span>
                </div>
                {(leg as any).elevationProfile && (leg as any).elevationProfile.length > 0 && (
                  <ElevationSparkline data={(leg as any).elevationProfile} />
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Hotel (only if user has booked one) ── */}
      {bookedHotel ? (
        <div className="relative mb-8 group">
          <div className="absolute -left-[28px] top-6 w-5 h-5 rounded-full bg-[#D30C5C] border-4 border-[#0a1422] z-10 shadow-[0_0_15px_rgba(211,12,92,0.5)]" />
          <div className="bg-[#16202f] rounded-2xl p-6 flex gap-6 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 hover:border-white/20">
            <div className="w-2 bg-[#D30C5C] rounded-full shadow-[0_0_10px_rgba(211,12,92,0.5)] shrink-0" />
            <div className="flex-1 text-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-[#D30C5C]">bed</span>
                    <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#D30C5C]">Stay</span>
                  </div>
                  <h3 className="text-lg font-headline font-bold text-white">{bookedHotel.name}</h3>
                  {bookedHotel.roomType && (
                    <p className="text-sm text-white/50 mt-0.5">{bookedHotel.roomType}</p>
                  )}
                  {bookedHotel.address && (
                    <p className="text-xs text-white/40 mt-0.5">{bookedHotel.address}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold font-technical text-white">Check-in</p>
                  <p className="text-xs text-white/50 font-technical mt-0.5">Oct 13, 11:00</p>
                  {bookedHotel.price && (
                    <p className="text-sm font-bold text-[#EAED41] mt-1">{bookedHotel.price}</p>
                  )}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✓ Reserved
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Prompt for hotel booking */
        <div className="relative mb-8">
          <div className="absolute -left-[28px] top-6 w-5 h-5 rounded-full bg-white/10 border-4 border-[#0a1422] z-10 border-dashed border-white/30" />
          <div className="bg-[#16202f]/50 rounded-2xl p-5 border border-dashed border-white/10 flex items-center gap-4">
            <span className="material-symbols-outlined text-white/30 text-3xl">bed</span>
            <div>
              <p className="text-sm font-bold text-white/40">No hotel selected</p>
              <p className="text-xs text-white/25 mt-0.5">Go to Hotels tab → Reserve a room to add it here</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Arrival ── */}
      <div className="relative mb-4">
        <div className="absolute -left-[28px] top-3 w-5 h-5 rounded-full bg-emerald-500 border-4 border-[#0a1422] z-10 shadow-[0_0_14px_rgba(34,197,94,0.5)]" />
        <div className="bg-[#16202f] rounded-2xl p-5 flex items-center gap-4 shadow-xl border border-emerald-500/10">
          <span className="material-symbols-outlined text-emerald-400 text-2xl">flag</span>
          <div>
            <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">Arrival</p>
            <p className="font-headline font-bold text-white text-lg">{destination}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-technical font-bold text-emerald-400">
              {/* Total journey time */}
              {formatDuration(legs.reduce((s, l) => s + l.durationMins, 0))} total
            </p>
            <p className="text-xs text-white/50 font-technical mt-0.5">Oct {12 + legs.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
