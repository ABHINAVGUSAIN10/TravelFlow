"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "./_components/Sidebar";
import TimelineTab, { BookedHotel } from "./_components/TimelineTab";
import HotelsTab from "./_components/HotelsTab";
import VehiclesTab from "./_components/VehiclesTab";
import GuidesTab from "./_components/GuidesTab";
import PlanMap from "./_components/PlanMap";
import TripSetupModal from "./_components/TripSetupModal";
import { JourneyLeg } from "@/app/api/routes/route";

export default function PlanTrip() {
  return (
    <Suspense fallback={<div className="bg-[#050e1c] h-screen text-white flex items-center justify-center">Loading Itinerary...</div>}>
      <PlanTripContent />
    </Suspense>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function PlanTripContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const destParam = searchParams.get("dest");
  const sourceParam = searchParams.get("source");
  const tabParam = searchParams.get("tab") as 'timeline' | 'hotels' | 'vehicles' | 'guides' | null;
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const travelersParam = searchParams.get("travelers");

  const [activeTab, setActiveTab] = useState<'timeline' | 'hotels' | 'vehicles' | 'guides'>(
    tabParam || 'timeline'
  );

  // ── Trip Setup State ──────────────────────────────────────────────────
  const [showSetupModal, setShowSetupModal] = useState(!(startParam && endParam));
  const [startDate, setStartDate] = useState<Date | null>(startParam ? new Date(startParam) : null);
  const [endDate, setEndDate] = useState<Date | null>(endParam ? new Date(endParam) : null);
  const [travelers, setTravelers] = useState(travelersParam ? parseInt(travelersParam) : 2);

  // ── Budget State ──────────────────────────────────────────────────────
  const [hotelCost, setHotelCost] = useState(0);
  const [guideCost, setGuideCost] = useState(0);
  const [routeCost, setRouteCost] = useState(0);
  const budgetSpent = hotelCost + guideCost + routeCost;

  // sourceTitle: starts from URL param, can be overridden by GPS
  const [sourceTitle, setSourceTitle] = useState<string>(sourceParam || "New Delhi");
  const [isGpsSource, setIsGpsSource] = useState(false);

  // bookedHotel: set when user reserves a room in HotelsTab → appears in TimelineTab
  const [bookedHotel, setBookedHotel] = useState<BookedHotel | null>(null);
  const [hiredGuide, setHiredGuide] = useState<string | null>(null);
  const [guidePrice, setGuidePrice] = useState<string | null>(null);

  // Route booking state
  const [bookedRouteIdx, setBookedRouteIdx] = useState<number | null>(null);

  // Routing state
  const destinationTitle = destParam ? destParam : "Manali";
  const [routesList, setRoutesList] = useState<JourneyLeg[][]>([]);
  const [activeRouteIdx, setActiveRouteIdx] = useState(0);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState(false);

  // Booking confirmation state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch routes when source or destination changes
  useEffect(() => {
    if (!sourceTitle || !destinationTitle) return;
    let cancelled = false;
    setRoutesLoading(true);
    setRoutesError(false);
    setRoutesList([]);
    setActiveRouteIdx(0);
    setBookedRouteIdx(null);
    setRouteCost(0);

    fetch(`/api/routes?source=${encodeURIComponent(sourceTitle)}&dest=${encodeURIComponent(destinationTitle)}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.routes && data.routes.length > 0) {
          setRoutesList(data.routes);
        } else {
          setRoutesError(true);
        }
        setRoutesLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setRoutesError(true); setRoutesLoading(false); }
      });

    return () => { cancelled = true; };
  }, [sourceTitle, destinationTitle]);

  // When GPS fires from the map, update the source shown everywhere
  const handleLocate = (cityName: string) => {
    setSourceTitle(cityName);
    setIsGpsSource(true);
  };

  // Handle trip setup modal confirmation
  const handleSetupConfirm = (start: Date, end: Date, numTravelers: number) => {
    setStartDate(start);
    setEndDate(end);
    setTravelers(numTravelers);
    setShowSetupModal(false);
  };

  // Handle route booking
  const handleBookRoute = (routeIdx: number, price: number) => {
    // If rebooking, remove old route cost
    setRouteCost(price);
    setBookedRouteIdx(routeIdx);
    setActiveRouteIdx(routeIdx);
  };

  // Handle hotel booking
  const handleBookHotel = (price: number) => {
    setHotelCost(price);
  };

  // Handle guide booking
  const handleBookGuide = (price: number) => {
    setGuideCost(price);
  };

  // Confirm & Book Trip
  const handleConfirmTrip = async () => {
    if (!startDate || !endDate) return;
    setIsBooking(true);

    try {
      const payload = {
        source: sourceTitle,
        destination: destinationTitle,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        travelers,
        totalCost: budgetSpent,
        routeLegs: bookedRouteIdx !== null ? routesList[bookedRouteIdx]?.map(leg => ({
          mode: leg.mode,
          origin: leg.origin,
          destination: leg.destination,
          price: leg.price,
          duration: leg.duration,
          distanceKm: leg.distanceKm,
        })) : [],
        hotel: bookedHotel ? {
          name: bookedHotel.name,
          address: bookedHotel.address,
          price: bookedHotel.price,
          roomType: bookedHotel.roomType,
        } : null,
        guide: hiredGuide ? {
          name: hiredGuide,
          price: guidePrice || "N/A",
        } : null,
      };

      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => router.push("/profile"), 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to book trip");
      }
    } catch {
      alert("An error occurred while booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Derived display values
  const tripDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const dateRangeLabel = startDate && endDate
    ? `${MONTHS[startDate.getMonth()]} ${startDate.getDate()} — ${MONTHS[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()} • ${tripDays} Day${tripDays !== 1 ? "s" : ""}`
    : "Select dates to begin";

  const hasBookedAnything = bookedRouteIdx !== null || bookedHotel !== null;

  return (
    <div className="bg-[#050e1c] text-white font-body overflow-hidden h-screen flex flex-col">
      {/* Trip Setup Modal */}
      {showSetupModal && (
        <TripSetupModal
          destination={destinationTitle}
          onConfirm={handleSetupConfirm}
        />
      )}

      {/* Booking Success Overlay */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 animate-in">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-400 text-5xl">check</span>
            </div>
            <h2 className="text-3xl font-headline font-black text-white">Trip Booked!</h2>
            <p className="text-white/50 text-sm">Redirecting to your profile...</p>
            <div className="w-10 h-10 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        </div>
      )}

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
          <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20">
            <img alt="User" src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || "Travel+User"}&background=0D8ABC&color=fff`} />
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Side Navigation Bar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Left Section: Content area based on activeTab */}
        <section className="w-full lg:w-1/2 overflow-y-auto bg-[#0a1422] p-10 custom-scrollbar relative z-10 shadow-[20px_0_40px_-10px_rgba(0,0,0,0.5)]">
          {/* Header Section */}
          <header className="mb-12">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-headline font-black tracking-tighter mb-2 text-white">Trip to {destinationTitle}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-white/60 text-lg font-medium">{dateRangeLabel}</p>
                  {/* GPS Source Badge */}
                  {isGpsSource ? (
                    <div className="flex items-center gap-1.5 bg-[#3B6FE8]/15 border border-[#3B6FE8]/40 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[#3B6FE8] text-sm">my_location</span>
                      <span className="font-technical text-[10px] text-[#3B6FE8] uppercase tracking-widest font-bold">
                        From: {sourceTitle}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-white/40 text-sm">near_me</span>
                      <span className="font-technical text-[10px] text-white/40 uppercase tracking-widest">
                        From: {sourceTitle}
                      </span>
                    </div>
                  )}
                </div>
                {/* Travelers badge */}
                {travelers > 0 && !showSetupModal && (
                  <div className="flex items-center gap-1.5 bg-[#0DF5E3]/10 border border-[#0DF5E3]/20 px-3 py-1 rounded-full mt-2 w-fit">
                    <span className="material-symbols-outlined text-[#0DF5E3] text-sm">group</span>
                    <span className="font-technical text-[10px] text-[#0DF5E3] uppercase tracking-widest font-bold">
                      {travelers} Traveler{travelers !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="font-technical text-[10px] text-white/50 block uppercase tracking-widest mb-1">Booked Amount</span>
                <p className="text-3xl font-headline font-bold text-[#EAED41]">₹{budgetSpent > 0 ? budgetSpent.toLocaleString('en-IN') : "0"}</p>
                {budgetSpent > 0 && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    {routeCost > 0 && <span className="text-[9px] text-white/30 font-technical">Route: ₹{routeCost.toLocaleString('en-IN')}</span>}
                    {hotelCost > 0 && <span className="text-[9px] text-white/30 font-technical">Hotel: ₹{hotelCost.toLocaleString('en-IN')}</span>}
                    {guideCost > 0 && <span className="text-[9px] text-white/30 font-technical">Guide: ₹{guideCost.toLocaleString('en-IN')}</span>}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* DYNAMIC CONTENT SWITCHER */}
          {activeTab === 'timeline'  && <TimelineTab 
            source={sourceTitle} 
            destination={destinationTitle} 
            bookedHotel={bookedHotel}
            routesList={routesList}
            activeRouteIdx={activeRouteIdx}
            setActiveRouteIdx={setActiveRouteIdx}
            loading={routesLoading}
            error={routesError}
          />}
          {activeTab === 'hotels'    && <HotelsTab destination={destinationTitle} onBookItem={handleBookHotel} onHotelSelect={setBookedHotel} />}
          {activeTab === 'vehicles'  && <VehiclesTab 
            source={sourceTitle} 
            destination={destinationTitle} 
            routesList={routesList}
            activeRouteIdx={activeRouteIdx}
            setActiveRouteIdx={setActiveRouteIdx}
            loading={routesLoading}
            error={routesError}
            onBookRoute={handleBookRoute}
            bookedRouteIdx={bookedRouteIdx}
          />}
          {activeTab === 'guides'    && <GuidesTab 
            destination={destinationTitle} 
            onBookItem={handleBookGuide} 
            onGuideSelect={(name: string, price?: string) => {
              setHiredGuide(name);
              if (price) setGuidePrice(price);
            }} 
          />}

          {/* Spacer for the confirm button */}
          {hasBookedAnything && <div className="h-24" />}
        </section>

        {/* Right Section: Map View */}
        <PlanMap 
          source={sourceTitle} 
          destination={destinationTitle} 
          onLocate={handleLocate} 
          routesList={routesList}
          activeRouteIdx={activeRouteIdx}
          loading={routesLoading}
          bookedHotel={bookedHotel?.name}
          hiredGuide={hiredGuide}
          setActiveRouteIdx={setActiveRouteIdx}
        />

        {/* Confirm & Book Trip — Sticky Footer */}
        {hasBookedAnything && !showSetupModal && startDate && endDate && (
          <div className="absolute bottom-0 left-[72px] right-0 lg:right-1/2 z-30 p-4 bg-gradient-to-t from-[#0a1422] via-[#0a1422]/95 to-transparent pt-10">
            <button
              onClick={handleConfirmTrip}
              disabled={isBooking}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D30C5C] to-[#DF33DF] text-white font-headline font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#D30C5C]/30 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isBooking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  Confirm & Book Trip — ₹{budgetSpent.toLocaleString('en-IN')}
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
