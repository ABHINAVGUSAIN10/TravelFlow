"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface PackingItem { item: string; icon: string; }
interface SeasonalPacking { season: string; months: string; items: PackingItem[]; }
interface Festival { name: string; month: string; description: string; }

interface LocationDetail {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  bgImage: string;
  cardImage: string;
  gradient: string;
  accentColor: string;
  coordinates: string;
  category: string;
  bestTimeToVisit: string;
  state: string;
  highlights: string[];
  funFacts: string[];
  festivals: Festival[];
  packingEssentials: SeasonalPacking[];
}

export default function DestinationDetail() {
  const params = useParams();
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePackingSeason, setActivePackingSeason] = useState(0);

  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch(`/api/locations/${params.id}`);
        const data = await res.json();
        setLocation(data.location);
      } catch (err) {
        console.error("Failed to fetch location:", err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchLocation();
  }, [params.id]);

  if (loading) {
    return (
      <div className="bg-[#050e1c] min-h-screen flex items-center justify-center">
        <Navigation />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[#EAED41] rounded-full animate-spin"></div>
          <span className="text-white/40 font-technical text-sm tracking-widest uppercase">Loading destination...</span>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="bg-[#050e1c] min-h-screen flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">location_off</span>
          <h2 className="font-headline font-bold text-2xl text-white mb-2">Destination not found</h2>
          <Link href="/destinations" className="text-[#EAED41] hover:underline">← Back to all destinations</Link>
        </div>
      </div>
    );
  }

  const activePacking = location.packingEssentials?.[activePackingSeason];

  return (
    <div className="bg-[#050e1c] min-h-screen text-white font-body">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[75vh] w-full flex items-end pb-20 justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={location.bgImage} alt={location.title} className="w-full h-full object-cover opacity-70" />
          <div className={`absolute inset-0 bg-gradient-to-t mix-blend-multiply opacity-80 ${location.gradient}`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-[#050e1c]/70 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-white/50 text-sm font-technical">
            <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-white/80">{location.category}</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-white">{location.title}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <span className="font-technical text-xs uppercase tracking-widest text-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20"
              style={{ backgroundColor: `${location.accentColor}30` }}>{location.category}</span>
            <span className="font-technical text-xs uppercase tracking-widest text-white/90 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">{location.state}</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter mb-4 drop-shadow-2xl">{location.title}</h1>
          <p className="text-xl md:text-2xl text-white/80 font-medium font-headline">{location.subtitle}</p>

          <div className="flex items-center gap-6 mt-8 text-white/60 font-technical text-sm">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: location.accentColor }}>location_on</span>
              {location.coordinates}
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: location.accentColor }}>calendar_month</span>
              {location.bestTimeToVisit}
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <span className="material-symbols-outlined text-white/30 text-3xl">expand_more</span>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-16">

            {/* Description */}
            <div>
              <h2 className="text-3xl font-headline font-bold flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-2xl" style={{ color: location.accentColor }}>menu_book</span>
                About {location.title}
              </h2>
              <p className="text-lg text-white/70 leading-relaxed font-medium">{location.longDescription || location.description}</p>
            </div>

            {/* Highlights */}
            {location.highlights?.length > 0 && (
              <div>
                <h2 className="text-3xl font-headline font-bold flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-2xl" style={{ color: location.accentColor }}>star</span>
                  Top Highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {location.highlights.map((h, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/8 transition-colors">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center font-technical font-bold text-sm shrink-0 border border-white/20"
                        style={{ backgroundColor: `${location.accentColor}20`, color: location.accentColor }}>{i + 1}</span>
                      <span className="font-medium text-white/90">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Facts */}
            {location.funFacts?.length > 0 && (
              <div>
                <h2 className="text-3xl font-headline font-bold flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-2xl" style={{ color: location.accentColor }}>lightbulb</span>
                  Fun Facts
                </h2>
                <div className="space-y-4">
                  {location.funFacts.map((fact, i) => (
                    <div key={i} className="flex items-start gap-4 bg-gradient-to-r from-white/5 to-transparent p-5 rounded-2xl border-l-4"
                      style={{ borderColor: location.accentColor }}>
                      <span className="material-symbols-outlined text-xl mt-0.5 shrink-0" style={{ color: location.accentColor }}>tips_and_updates</span>
                      <p className="text-white/80 font-medium">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Festivals */}
            {location.festivals?.length > 0 && (
              <div>
                <h2 className="text-3xl font-headline font-bold flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-2xl" style={{ color: location.accentColor }}>celebration</span>
                  Festivals & Events
                </h2>
                <div className="space-y-4">
                  {location.festivals.map((fest, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-headline font-bold text-xl text-white">{fest.name}</h3>
                        <span className="font-technical text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20"
                          style={{ backgroundColor: `${location.accentColor}20`, color: location.accentColor }}>{fest.month}</span>
                      </div>
                      <p className="text-white/60">{fest.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packing Essentials */}
            {location.packingEssentials?.length > 0 && (
              <div>
                <h2 className="text-3xl font-headline font-bold flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-2xl" style={{ color: location.accentColor }}>luggage</span>
                  Packing Essentials
                </h2>

                {/* Season Tabs */}
                {location.packingEssentials.length > 1 && (
                  <div className="flex gap-3 mb-6">
                    {location.packingEssentials.map((sp, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePackingSeason(i)}
                        className={`px-5 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border ${
                          activePackingSeason === i
                            ? "text-[#050e1c] border-transparent shadow-lg"
                            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                        style={{
                          backgroundColor: activePackingSeason === i ? location.accentColor : undefined,
                          boxShadow: activePackingSeason === i ? `0 8px 20px -5px ${location.accentColor}40` : undefined,
                        }}
                      >
                        {sp.season} ({sp.months})
                      </button>
                    ))}
                  </div>
                )}

                {activePacking && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePacking.items.map((item, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/8 transition-colors">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${location.accentColor}15` }}>
                          <span className="material-symbols-outlined text-lg" style={{ color: location.accentColor }}>{item.icon}</span>
                        </div>
                        <span className="font-medium text-white/90">{item.item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {location.packingEssentials.length === 1 && activePacking && (
                  <p className="text-white/40 text-sm font-technical mt-4">Recommended for: {activePacking.months}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-8">

            {/* Best Time Card */}
            <div className="sticky top-32 space-y-6">
              <div className="glass-nav border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-5"
                  style={{ backgroundColor: `${location.accentColor}20` }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: location.accentColor }}>calendar_month</span>
                </div>
                <h3 className="font-headline font-bold text-xl mb-2">Best Time to Visit</h3>
                <p className="text-2xl font-headline font-black mb-3" style={{ color: location.accentColor }}>{location.bestTimeToVisit}</p>
                <p className="text-white/50 text-sm">Plan your visit during these months for the best weather and peak experiences at {location.title}.</p>
              </div>

              {/* Quick Info */}
              <div className="glass-nav border border-white/10 p-6 rounded-[2rem] shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-white/50">map</span>
                  <div>
                    <p className="text-white/40 text-xs font-technical uppercase tracking-wider">Coordinates</p>
                    <p className="text-white font-medium">{location.coordinates}</p>
                  </div>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-white/50">pin_drop</span>
                  <div>
                    <p className="text-white/40 text-xs font-technical uppercase tracking-wider">State</p>
                    <p className="text-white font-medium">{location.state}</p>
                  </div>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-white/50">category</span>
                  <div>
                    <p className="text-white/40 text-xs font-technical uppercase tracking-wider">Category</p>
                    <p className="text-white font-medium">{location.category}</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="glass-nav border border-white/10 p-8 rounded-[2rem] shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D30C5C] to-[#DF33DF] flex items-center justify-center shadow-lg shadow-[#D30C5C]/20 mb-4">
                  <span className="material-symbols-outlined text-white text-2xl">flight_takeoff</span>
                </div>
                <h3 className="font-headline font-bold text-xl mb-2">Ready to explore?</h3>
                <p className="text-white/50 text-sm mb-5">Start planning your trip to {location.title} with our itinerary planner.</p>
                <Link
                  href={`/plan?dest=${encodeURIComponent(location.title)}&tab=hotels`}
                  className="w-full block bg-white text-[#050e1c] py-4 rounded-xl font-bold font-headline text-center hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Plan Your Itinerary
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <Link href="/destinations" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors font-semibold">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to All Destinations
        </Link>
      </div>
    </div>
  );
}
