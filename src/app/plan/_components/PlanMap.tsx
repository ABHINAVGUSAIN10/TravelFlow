"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import { JourneyLeg } from "@/app/api/routes/route";

interface PlanMapProps {
  source?: string;
  destination?: string;
  /** Callback fired when GPS resolves the user's city */
  onLocate?: (cityName: string) => void;
  routesList?: JourneyLeg[][];
  activeRouteIdx?: number;
  loading?: boolean;
  bookedHotel?: string;
  hiredGuide?: string | null;
  setActiveRouteIdx?: (idx: number) => void;
}

// Leaflet requires the browser's `window` object, so we must disable SSR.
const PlanMapLeaflet = dynamic<PlanMapProps>(
  () => import("./PlanMapLeaflet") as Promise<{ default: ComponentType<PlanMapProps> }>,
  {
    ssr: false,
    loading: () => (
      <section className="hidden lg:flex w-1/2 relative bg-[#121c2a] overflow-hidden items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <span className="material-symbols-outlined text-5xl animate-pulse">map</span>
          <p className="font-technical text-xs uppercase tracking-widest">Loading Map…</p>
        </div>
      </section>
    ),
  }
);

export default function PlanMap({ source, destination, onLocate, routesList, activeRouteIdx, loading, bookedHotel, hiredGuide, setActiveRouteIdx }: PlanMapProps) {
  return (
    <PlanMapLeaflet 
      source={source} 
      destination={destination} 
      onLocate={onLocate} 
      routesList={routesList}
      activeRouteIdx={activeRouteIdx}
      loading={loading}
      bookedHotel={bookedHotel}
      hiredGuide={hiredGuide}
      setActiveRouteIdx={setActiveRouteIdx}
    />
  );
}
