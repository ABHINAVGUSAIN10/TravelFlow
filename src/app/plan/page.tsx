"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import TimelineTab from "./_components/TimelineTab";
import HotelsTab from "./_components/HotelsTab";
import VehiclesTab from "./_components/VehiclesTab";
import GuidesTab from "./_components/GuidesTab";
import PlanMap from "./_components/PlanMap";

export default function PlanTrip() {
  return (
    <Suspense fallback={<div className="bg-[#050e1c] h-screen text-white flex items-center justify-center">Loading Itinerary...</div>}>
      <PlanTripContent />
    </Suspense>
  );
}


function PlanTripContent() {
  const searchParams = useSearchParams();
  const destParam = searchParams.get("dest");
  const tabParam = searchParams.get("tab") as 'timeline' | 'hotels' | 'vehicles' | 'guides' | null;
  const [activeTab, setActiveTab] = useState<'timeline' | 'hotels' | 'vehicles' | 'guides'>(
    tabParam || 'timeline'
  );
  const [budgetSpent, setBudgetSpent] = useState(0);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Dynamic Title Logic
  const destinationTitle = destParam ? destParam : "Manali";

  return (
    <div className="bg-[#050e1c] text-white font-body overflow-hidden h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-16 px-8 flex items-center justify-between glass-nav z-50 shrink-0 border-b border-white/10 bg-[#050e1c]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#3B6FE8] font-headline font-extrabold text-xl tracking-tight">TravelFlow</Link>
        </div>
        <div className="flex flex-1 justify-center items-center gap-10">
          <Link className="text-sm font-medium hover:text-[#3B6FE8] transition-colors" href="/">Home</Link>
          <Link className="text-sm font-medium hover:text-[#3B6FE8] transition-colors" href="/destinations">Destinations</Link>
          <span className="text-sm font-bold text-[#3B6FE8] border-b-2 border-[#3B6FE8] pb-1 cursor-default">Plan Itinerary</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-900/10 dark:hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined text-white">explore</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20">
            <img alt="User" src="https://ui-avatars.com/api/?name=Travel+User&background=0D8ABC&color=fff" />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Side Navigation Bar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Left Section: Content area based on activeTab */}
        <section className="w-full lg:w-1/2 overflow-y-auto bg-[#0a1422] p-10 custom-scrollbar relative z-10 shadow-[20px_0_40px_-10px_rgba(0,0,0,0.5)]">
          {/* Header Section */}
          <header className="mb-12">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-headline font-black tracking-tighter mb-2 text-white">Trip to {destinationTitle}</h1>
                <p className="text-white/60 text-lg font-medium">Oct 12 — Oct 18, 2026 • 6 Days</p>
              </div>
              <div className="text-right">
                <span className="font-technical text-[10px] text-white/50 block uppercase tracking-widest mb-1">Booked Amount</span>
                <p className="text-3xl font-headline font-bold text-[#EAED41]">₹{budgetSpent > 0 ? budgetSpent.toLocaleString('en-IN') : "0"}</p>
              </div>
            </div>
          </header>

          {/* DYNAMIC CONTENT SWITCHER */}
          {activeTab === 'timeline' && <TimelineTab />}
          {activeTab === 'hotels' && <HotelsTab destination={destinationTitle} onBookItem={(price: number) => setBudgetSpent(p => p + price)} />}
          {activeTab === 'vehicles' && <VehiclesTab />}
          {activeTab === 'guides' && <GuidesTab />}
        </section>

        {/* Right Section: Map View */}
        <PlanMap />
      </main>
    </div>
  );
}
