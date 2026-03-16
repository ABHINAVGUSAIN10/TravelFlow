"use client";

import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Location {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
  cardImage: string;
  gradient: string;
  accentColor: string;
  coordinates: string;
  category: string;
  bestTimeToVisit: string;
  state: string;
}

const CATEGORIES = [
  { label: "All", icon: "explore", color: "#EAED41" },
  { label: "Beaches", icon: "beach_access", color: "#0EBCDC" },
  { label: "Mountains", icon: "landscape", color: "#94A3B8" },
  { label: "Monuments", icon: "account_balance", color: "#F59E0B" },
  { label: "Cities", icon: "location_city", color: "#EC4899" },
  { label: "Forests", icon: "forest", color: "#22C55E" },
  { label: "Lakes", icon: "water", color: "#60A5FA" },
  { label: "Deserts", icon: "wb_sunny", color: "#EAB308" },
  { label: "Valleys", icon: "terrain", color: "#84CC16" },
  { label: "Hill Stations", icon: "filter_hdr", color: "#10B981" },
  { label: "Waterfalls", icon: "waves", color: "#06B6D4" },
  { label: "Islands", icon: "sailing", color: "#38BDF8" },
];

const VIBE_MAP: Record<string, string[]> = {
  Nature: ["Beaches", "Mountains", "Lakes", "Valleys", "Forests", "Waterfalls", "Islands", "Hill Stations"],
  Culture: ["Monuments", "Cities"],
  Adventure: ["Mountains", "Deserts", "Forests"],
};

export default function Destinations() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vibeParam = searchParams.get("vibe");

  const [locations, setLocations] = useState<Location[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeVibe, setActiveVibe] = useState<string | null>(vibeParam);

  useEffect(() => {
    async function fetchLocations() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // If vibe is active, use mapped categories
        if (activeVibe && VIBE_MAP[activeVibe]) {
          params.set("category", VIBE_MAP[activeVibe].join(","));
        } else if (activeCategory !== "All") {
          params.set("category", activeCategory);
        }

        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`/api/locations?${params.toString()}`);
        const data = await res.json();
        setLocations(data.locations || []);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(fetchLocations, 300);
    return () => clearTimeout(debounce);
  }, [activeCategory, searchQuery, activeVibe]);

  // Group locations by category for "All" view
  const groupedLocations: Record<string, Location[]> = {};
  if (activeCategory === "All") {
    locations.forEach((loc) => {
      if (!groupedLocations[loc.category]) {
        groupedLocations[loc.category] = [];
      }
      groupedLocations[loc.category].push(loc);
    });
  }

  const getCategoryMeta = (cat: string) =>
    CATEGORIES.find((c) => c.label === cat) || CATEGORIES[0];

  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#050e1c]">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vh] bg-[#D30C5C] blur-[150px] opacity-10 rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vh] bg-[#0EBCDC] blur-[120px] opacity-10 rounded-full mix-blend-screen"></div>
      </div>

      <Navigation />

      <main className="relative z-10 min-h-screen px-[5%] md:px-[8%] pt-36 pb-24">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 bg-white/5 w-max px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EAED41] animate-pulse"></span>
            <span className="font-technical text-white text-xs tracking-widest uppercase font-semibold">
              {locations.length} Curated Locations
            </span>
          </div>
          <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 drop-shadow-xl inline-block">
            {activeVibe ? `${activeVibe} Destinations` : "Our Destinations"}
          </h1>
          <p className="text-white/60 text-lg mt-4 max-w-2xl font-medium">
            {activeVibe
              ? `Showing destinations curated for your "${activeVibe}" vibe. Explore and find your perfect escape.`
              : "Discover India's most breathtaking locations, from pristine beaches to ancient monuments. Filter by category to find your perfect escape."
            }
          </p>

          {/* Vibe filter pill */}
          {activeVibe && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#D30C5C]/20 to-[#DF33DF]/20 border border-[#D30C5C]/30 px-4 py-2 rounded-full backdrop-blur-md">
                <span className="material-symbols-outlined text-[#DF33DF] text-sm">auto_awesome</span>
                <span className="font-headline font-semibold text-sm text-white">
                  {activeVibe} Vibe
                </span>
                <button
                  onClick={() => {
                    setActiveVibe(null);
                    router.replace("/destinations");
                  }}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-1"
                >
                  <span className="material-symbols-outlined text-white/70 text-xs">close</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              search
            </span>
            <input
              type="text"
              placeholder="Search destinations, states, or experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white font-medium placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-12 overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-3 w-max">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`group flex items-center gap-2.5 px-5 py-3 rounded-2xl font-headline font-semibold text-sm whitespace-nowrap transition-all duration-300 border ${
                    isActive
                      ? "text-[#050e1c] shadow-lg scale-[1.02] border-transparent"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10 hover:border-white/20"
                  }`}
                  style={{
                    backgroundColor: isActive ? cat.color : undefined,
                    boxShadow: isActive
                      ? `0 8px 25px -5px ${cat.color}40`
                      : undefined,
                  }}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? "" : "opacity-60 group-hover:opacity-100"
                    }`}
                  >
                    {cat.icon}
                  </span>
                  {cat.label}
                  {isActive && activeCategory !== "All" && (
                    <span className="bg-[#050e1c]/20 text-[#050e1c] text-xs font-bold px-2 py-0.5 rounded-full">
                      {locations.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-[#EAED41] rounded-full animate-spin"></div>
              <span className="text-white/40 font-technical text-sm tracking-widest uppercase">
                Loading destinations...
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && locations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              travel_explore
            </span>
            <h3 className="font-headline font-bold text-2xl text-white mb-2">
              No destinations found
            </h3>
            <p className="text-white/50 max-w-md">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && locations.length > 0 && (
          <>
            {activeCategory === "All" ? (
              // Grouped by category sections
              <div className="space-y-16">
                {Object.entries(groupedLocations).map(
                  ([category, catLocations]) => {
                    const meta = getCategoryMeta(category);
                    return (
                      <section key={category}>
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                              style={{
                                backgroundColor: `${meta.color}20`,
                                border: `1px solid ${meta.color}30`,
                              }}
                            >
                              <span
                                className="material-symbols-outlined text-xl"
                                style={{ color: meta.color }}
                              >
                                {meta.icon}
                              </span>
                            </div>
                            <div>
                              <h2 className="font-headline font-bold text-2xl text-white">
                                {category}
                              </h2>
                              <p className="text-white/40 text-sm font-technical">
                                {catLocations.length} destination
                                {catLocations.length > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveCategory(category)}
                            className="text-white/50 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1"
                          >
                            View All
                            <span className="material-symbols-outlined text-sm">
                              arrow_forward
                            </span>
                          </button>
                        </div>

                        {/* Horizontal scrollable cards */}
                        <div className="overflow-x-auto pb-4 -mx-2 px-2">
                          <div className="flex gap-6 w-max">
                            {catLocations.map((loc) => (
                              <LocationCard
                                key={loc._id}
                                location={loc}
                                accentColor={meta.color}
                              />
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  }
                )}
              </div>
            ) : (
              // Grid view for single category
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {locations.map((loc) => (
                    <LocationCardGrid
                      key={loc._id}
                      location={loc}
                      accentColor={
                        getCategoryMeta(loc.category).color
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

/* ──────────────────────────────────────────────
   Horizontal scroll card for "All" category view
   ────────────────────────────────────────────── */
function LocationCard({
  location,
  accentColor,
}: {
  location: Location;
  accentColor: string;
}) {
  return (
    <Link
      href={`/destinations/${location._id}`}
      className="group relative block w-72 h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/10 shrink-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={location.cardImage}
        alt={location.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b ${location.gradient} mix-blend-color opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>

      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="flex gap-2 mb-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <span
            className="font-technical text-[10px] uppercase tracking-wider text-white backdrop-blur-md px-3 py-1 rounded-full"
            style={{ backgroundColor: `${accentColor}40` }}
          >
            {location.category}
          </span>
          <span className="font-technical text-[10px] uppercase tracking-wider text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
            {location.bestTimeToVisit}
          </span>
        </div>
        <h3 className="font-headline font-bold text-2xl text-white mb-1 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
          {location.title}
        </h3>
        <p className="font-medium text-white/70 text-sm translate-y-1 group-hover:translate-y-0 transition-transform duration-500 delay-75 flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-xs"
            style={{ color: accentColor }}
          >
            location_on
          </span>
          {location.subtitle}, {location.state}
        </p>
      </div>

      {/* Hover arrow indicator */}
      <div className="absolute right-5 bottom-5 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-sm">
        <span className="material-symbols-outlined text-white text-sm">
          north_east
        </span>
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────
   Grid card for filtered category view
   ────────────────────────────────────────────── */
function LocationCardGrid({
  location,
  accentColor,
}: {
  location: Location;
  accentColor: string;
}) {
  return (
    <Link
      href={`/destinations/${location._id}`}
      className="group relative block h-[28rem] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_20px_50px_-15px_rgba(211,12,92,0.3)] transition-all duration-500 hover:-translate-y-2 border border-white/10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={location.cardImage}
        alt={location.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b ${location.gradient} mix-blend-color opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>

      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="flex flex-wrap gap-2 mb-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          <span
            className="font-technical text-[10px] uppercase tracking-wider text-white backdrop-blur-md px-3 py-1 rounded-full"
            style={{ backgroundColor: `${accentColor}40` }}
          >
            {location.category}
          </span>
          <span className="font-technical text-[10px] uppercase tracking-wider text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
            {location.state}
          </span>
          <span className="font-technical text-[10px] uppercase tracking-wider text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
            {location.bestTimeToVisit}
          </span>
        </div>
        <h3 className="font-headline font-bold text-3xl text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          {location.title}
        </h3>
        <p className="font-medium text-white/70 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-sm"
            style={{ color: accentColor }}
          >
            location_on
          </span>
          {location.subtitle}, {location.state}
        </p>
        <p className="text-white/50 text-sm mt-2 line-clamp-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
          {location.description}
        </p>
      </div>

      {/* Hover arrow indicator */}
      <div className="absolute right-8 bottom-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-sm">
        <span className="material-symbols-outlined text-white">north_east</span>
      </div>
    </Link>
  );
}
