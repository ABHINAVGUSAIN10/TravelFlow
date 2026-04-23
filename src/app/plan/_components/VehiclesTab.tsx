"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { JourneyLeg } from "@/app/api/routes/route";
import BusSeatMap from "./BusSeatMap";
import FlightClassSelector from "./FlightClassSelector";

interface Props {
  source?: string;
  destination?: string;
  routesList?: JourneyLeg[][];
  activeRouteIdx?: number;
  setActiveRouteIdx?: (idx: number) => void;
  loading?: boolean;
  error?: boolean;
  onBookRoute?: (routeIdx: number, price: number) => void;
  bookedRouteIdx?: number | null;
}

const MODE_ICONS: Record<string, string> = {
  flight: "flight",
  train: "train",
  taxi: "directions_car",
  bus: "directions_bus",
  transit: "directions_subway",
};

const MODE_COLORS: Record<string, string> = {
  flight: "#DF33DF",
  train: "#0EBCDC",
  taxi: "#EAED41",
  bus: "#3B6FE8",
  transit: "#22C55E",
};

/** Human-readable label for a route option */
function routeLabel(legs: JourneyLeg[]): string {
  const modes = legs.map((l) => l.mode);
  const primary = modes.find((m) => m !== "taxi") ?? "taxi";
  const labels: Record<string, string> = {
    flight: "✈️ Flight Route",
    train: "🚆 Train Route",
    bus: "🚌 Bus Route",
    taxi: "🚕 Direct Road",
    transit: "🚇 Transit Route",
  };
  return labels[primary] || "Route";
}

/** Primary mode colour for the card header */
function routePrimaryColor(legs: JourneyLeg[]): string {
  const primary = legs.find((l) => l.mode !== "taxi")?.mode ?? "taxi";
  return MODE_COLORS[primary] || "#3B6FE8";
}

/** Total time */
function totalTime(legs: JourneyLeg[]): string {
  const mins = legs.reduce((a, l) => a + l.durationMins, 0);
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function VehiclesTab({
  source = "New Delhi",
  destination = "Destination",
  routesList = [],
  activeRouteIdx = 0,
  setActiveRouteIdx,
  loading = false,
  error = false,
  onBookRoute,
  bookedRouteIdx = null,
}: Props) {
  // Leg configurators: mapping routeIdx -> legIdx -> priceModifier
  const [legPriceModifiers, setLegPriceModifiers] = useState<Record<number, Record<number, number>>>({});
  
  // Modal state
  const [activeConfigurator, setActiveConfigurator] = useState<{
    routeIdx: number;
    legIdx: number;
    mode: string;
    price: string;
    destination: string;
  } | null>(null);

  const handleLegConfig = (routeIdx: number, legIdx: number, priceModifier: number) => {
    setLegPriceModifiers((prev) => ({
      ...prev,
      [routeIdx]: {
        ...(prev[routeIdx] || {}),
        [legIdx]: priceModifier,
      },
    }));
  };

  const getDynamicTotalPrice = (route: JourneyLeg[], routeIdx: number) => {
    let sum = 0;
    for (let i = 0; i < route.length; i++) {
      const l = route[i];
      const baseN = parseInt(l.price.replace(/[^\d]/g, ""), 10);
      if (!isNaN(baseN)) {
        sum += baseN;
      }
      const modifier = legPriceModifiers[routeIdx]?.[i] || 0;
      sum += modifier;
    }
    return sum > 0 ? `₹${sum.toLocaleString("en-IN")}` : "N/A";
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fade-in flex flex-col gap-6 items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-white/10 border-t-[#3B6FE8] rounded-full animate-spin" />
        <p className="text-white/50 font-technical text-sm tracking-widest uppercase">
          Discovering routes from {source} to {destination}…
        </p>
        <p className="text-white/20 font-technical text-[10px] tracking-widest uppercase mt-1">
          Scanning airports • railway stations • bus stands
        </p>
      </div>
    );
  }

  // ── Error / empty state ────────────────────────────────────────────────────
  if (error || routesList.length === 0) {
    return (
      <div className="fade-in flex flex-col gap-4 items-center justify-center py-20 text-center text-white/50">
        <span className="material-symbols-outlined text-4xl text-[#EAED41]">
          warning
        </span>
        <p className="text-lg">
          Could not find transport routes between{" "}
          <span className="text-white font-semibold">{source}</span> and{" "}
          <span className="text-white font-semibold">{destination}</span>.
        </p>
        <p className="text-xs opacity-50 max-w-md">
          This may happen if the destination is very remote or if the routing
          services are temporarily unavailable. Try refreshing.
        </p>
      </div>
    );
  }

  // ── Route cards ────────────────────────────────────────────────────────────
  return (
    <>
    <div className="fade-in flex flex-col gap-8">
      {/* Section header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-4">
        <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-[#3B6FE8]">
            route
          </span>
          Available Routes
        </h2>
        <p className="text-white/40 font-technical text-xs uppercase tracking-wider">
          {routesList.length} option{routesList.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Route option cards */}
      {routesList.map((route, rIdx) => {
        const isActive = rIdx === activeRouteIdx;
        const isBooked = rIdx === bookedRouteIdx;
        const color = routePrimaryColor(route);

        return (
          <div
            key={rIdx}
            role="button"
            tabIndex={0}
            onClick={() => setActiveRouteIdx?.(rIdx)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveRouteIdx?.(rIdx); }}
            className={`w-full text-left rounded-3xl border transition-all duration-300 cursor-pointer group
              ${
                isActive
                  ? "border-white/20 bg-[#0d1825] shadow-2xl shadow-black/40 scale-[1.01]"
                  : "border-white/5 bg-[#111c2b] hover:border-white/15 hover:bg-[#14202f]"
              }`}
          >
            {/* ── Card Header ──────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-white/5 rounded-t-3xl"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${color}15 0%, transparent 60%)`
                  : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                {/* Active indicator */}
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    isActive ? "scale-100" : "scale-50 opacity-30"
                  }`}
                  style={{ background: color }}
                />
                <span className="text-lg font-headline font-bold">
                  {routeLabel(route)}
                </span>
                {isActive && (
                  <span className="font-technical text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-white/60">
                    Selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="font-technical text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                    Est. Time
                  </p>
                  <p className="font-headline font-bold text-[#0DF5E3]">
                    {totalTime(route)}
                  </p>
                </div>
                <div>
                  <p className="font-technical text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                    Est. Cost
                  </p>
                  <p className="font-headline font-bold" style={{ color }}>
                    {getDynamicTotalPrice(route, rIdx)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Leg breakdown (expanded when active) ─────────────────── */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isActive ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 py-5 relative">
                {/* Vertical timeline connector */}
                <div className="absolute left-[39px] top-8 bottom-8 w-px bg-white/8" />

                <div className="flex flex-col gap-4">
                  {route.map((leg, idx) => {
                    const legColor = MODE_COLORS[leg.mode] || "#3B6FE8";
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 relative"
                      >
                        {/* Timeline dot */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{
                            background: legColor,
                            boxShadow: `0 0 12px ${legColor}66`,
                          }}
                        >
                          <span className="material-symbols-outlined text-black text-[13px]">
                            {MODE_ICONS[leg.mode] || "directions_bus"}
                          </span>
                        </div>

                        {/* Leg info */}
                        <div 
                          className={`flex-1 bg-white/[0.03] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 relative ${
                            isActive && (leg.mode === 'bus' || leg.mode === 'flight') 
                              ? 'cursor-pointer hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 group/leg' 
                              : ''
                          }`}
                          onClick={() => {
                            if (isActive && (leg.mode === 'bus' || leg.mode === 'flight')) {
                              setActiveConfigurator({
                                routeIdx: rIdx,
                                legIdx: idx,
                                mode: leg.mode,
                                price: leg.price,
                                destination: leg.destination
                              });
                            }
                          }}
                        >
                          <div>
                            <span className="font-technical text-[9px] uppercase tracking-widest text-[#0DF5E3] block mb-0.5">
                              Leg {idx + 1} • {leg.mode}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-semibold text-sm">
                                {leg.origin.split(",")[0]}
                              </span>
                              <span className="material-symbols-outlined text-white/20 text-xs">
                                trending_flat
                              </span>
                              <span className="font-headline font-semibold text-sm">
                                {leg.destination.split(",")[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-technical text-[10px] text-white/40 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">
                                  timelapse
                                </span>
                                {leg.duration} • {leg.distanceKm} km
                              </span>
                              {leg.departureTime && (
                                <span className="font-technical text-[10px] text-[#0DF5E3] flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                  {leg.departureTime} → {leg.arrivalTime}
                                </span>
                              )}
                              
                              {/* Selection Indicator */}
                              {isActive && leg.mode === 'bus' && (
                                <span className="font-technical text-[9px] text-[#3B6FE8] flex items-center gap-1 border border-[#3B6FE8]/30 px-1.5 py-0.5 rounded bg-[#3B6FE8]/10 mt-0.5 group-hover/leg:bg-[#3B6FE8]/20 transition-colors">
                                  <span className="material-symbols-outlined text-[10px]">touch_app</span>
                                  {legPriceModifiers[rIdx]?.[idx] ? 'Seat Selected' : 'Tap to Select Seat'}
                                </span>
                              )}
                              {isActive && leg.mode === 'flight' && (
                                <span className="font-technical text-[9px] text-[#DF33DF] flex items-center gap-1 border border-[#DF33DF]/30 px-1.5 py-0.5 rounded bg-[#DF33DF]/10 mt-0.5 group-hover/leg:bg-[#DF33DF]/20 transition-colors">
                                  <span className="material-symbols-outlined text-[10px]">touch_app</span>
                                  {legPriceModifiers[rIdx]?.[idx] ? 'Class Selected' : 'Tap to Select Class'}
                                </span>
                              )}
                            </div>
                            <span
                              className="font-headline font-bold text-base"
                              style={{ color: legColor }}
                            >
                              {leg.price}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Book Route Button */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-sm text-white/40 font-technical">
                    Total: <span className="text-white font-bold text-base">{getDynamicTotalPrice(route, rIdx)}</span>
                  </div>
                  {isBooked ? (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Route Booked
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onBookRoute) {
                          const priceStr = getDynamicTotalPrice(route, rIdx);
                          const priceNum = parseInt(priceStr.replace(/[^\d]/g, ""), 10) || 0;
                          onBookRoute(rIdx, priceNum);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                        color: color === '#EAED41' ? '#050e1c' : '#fff',
                        boxShadow: `0 8px 20px -5px ${color}40`,
                      }}
                    >
                      <span className="material-symbols-outlined text-sm">bookmark_add</span>
                      Book This Route
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Collapsed summary (inactive cards) ──────────────────── */}
            {!isActive && (
              <div className="px-6 py-3 flex items-center gap-3 text-white/30">
                {route.map((leg, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ color: MODE_COLORS[leg.mode] || "#555" }}
                    >
                      {MODE_ICONS[leg.mode] || "directions_bus"}
                    </span>
                    <span className="font-technical text-[10px] uppercase">
                      {leg.mode}
                    </span>
                    {i < route.length - 1 && (
                      <span className="material-symbols-outlined text-[10px] text-white/15 mx-0.5">
                        chevron_right
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>

      {/* Configurator Modal */}
      {activeConfigurator && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#050e1c] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-[#050e1c]/90 backdrop-blur-md p-6 border-b border-white/5 flex items-center justify-between z-20">
              <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: MODE_COLORS[activeConfigurator.mode] || '#3B6FE8' }}>
                  {MODE_ICONS[activeConfigurator.mode] || 'event_seat'}
                </span>
                {activeConfigurator.mode === 'bus' ? 'Select Your Bus Seat' : 'Choose Flight Class'}
              </h3>
              <button 
                onClick={() => setActiveConfigurator(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              {activeConfigurator.mode === 'bus' && (
                <BusSeatMap 
                  basePriceStr={activeConfigurator.price} 
                  location={activeConfigurator.destination} 
                  onSeatSelect={(modifier) => handleLegConfig(activeConfigurator.routeIdx, activeConfigurator.legIdx, modifier)}
                />
              )}
              {activeConfigurator.mode === 'flight' && (
                <FlightClassSelector 
                  basePriceStr={activeConfigurator.price} 
                  onClassSelect={(modifier) => handleLegConfig(activeConfigurator.routeIdx, activeConfigurator.legIdx, modifier)}
                />
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#050e1c]/90 backdrop-blur-md p-6 border-t border-white/5 flex justify-end z-20">
              <button
                onClick={() => setActiveConfigurator(null)}
                className="px-8 py-3 rounded-full bg-[#3B6FE8] text-white font-bold text-sm hover:bg-[#2b55b8] transition-colors flex items-center gap-2 shadow-lg shadow-[#3B6FE8]/20"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
