"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";
import CalendarPicker from "@/components/CalendarPicker";
import { useState, useEffect, useRef } from "react";

// India-centric nature locations
const LOCATIONS = [
  {
    id: 1,
    title: "Pangong Tso",
    subtitle: "Ladakh",
    description: "A mesmerising high-altitude saltwater lake reflecting shades of brilliant blue.",
    bgImage: "/images/pangong_tso.jpeg",
    cardImage: "/images/pangong_tso.jpeg",
    gradient: "from-[#0591F9]/60 via-[#0EBCDC]/50 to-transparent",
    accentColor: "#0EBCDC",
    coordinates: "33.7225° N, 78.8988° E"
  },
  {
    id: 2,
    title: "Mechuka",
    subtitle: "Arunachal Pradesh",
    description: "A breathtaking, untouched valley surrounded by pine forests and snow-capped peaks.",
    bgImage: "/images/mechuka.png",
    cardImage: "/images/mechuka.png",
    gradient: "from-green-900/60 via-[#B4D104]/50 to-transparent",
    accentColor: "#B4D104",
    coordinates: "28.5959° N, 94.1353° E"
  },
  {
    id: 3,
    title: "Taj Mahal",
    subtitle: "Agra",
    description: "The iconic ivory-white marble mausoleum, catching the glowing light of dawn.",
    bgImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2000&auto=format&fit=crop",
    cardImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=40&w=800&auto=format&fit=crop",
    gradient: "from-orange-900/60 via-amber-600/40 to-transparent",
    accentColor: "#F59E0B",
    coordinates: "27.1751° N, 78.0421° E"
  },
  {
    id: 4,
    title: "Palolem Beach",
    subtitle: "South Goa",
    description: "A famous, crescent-shaped beach known for its calm waters and vibrant nightlife.",
    bgImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000&auto=format&fit=crop",
    cardImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=40&w=800&auto=format&fit=crop",
    gradient: "from-[#D30C5C]/60 via-[#DF33DF]/50 to-transparent",
    accentColor: "#DF33DF",
    coordinates: "15.0099° N, 74.0232° E"
  },
  {
    id: 5,
    title: "Munnar",
    subtitle: "Kerala",
    description: "Lush green rolling hills covered in endless emerald tea plantations.",
    bgImage: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2000&auto=format&fit=crop",
    cardImage: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=40&w=800&auto=format&fit=crop",
    gradient: "from-green-900/60 via-emerald-600/40 to-transparent",
    accentColor: "#10B981",
    coordinates: "10.0889° N, 77.0595° E"
  },
  {
    id: 6,
    title: "Valley of Flowers",
    subtitle: "Uttarakhand",
    description: "A fairy-tale high-altitude Himalayan valley bursting with endemic alpine flora.",
    bgImage: "/images/valley_of_flowers.jpg",
    cardImage: "/images/valley_of_flowers.jpg",
    gradient: "from-purple-900/60 via-[#DF33DF]/40 to-transparent",
    accentColor: "#DF33DF",
    coordinates: "30.7280° N, 79.6053° E"
  },
  {
    id: 7,
    title: "Radhanagar Beach",
    subtitle: "Andaman Islands",
    description: "Pristine white sands, turquoise waters, and lush forest backdrops on Havelock Island.",
    bgImage: "/images/radhanagar_beach.jpg",
    cardImage: "/images/radhanagar_beach.jpg",
    gradient: "from-blue-900/60 via-blue-500/40 to-transparent",
    accentColor: "#0EBCDC",
    coordinates: "11.9840° N, 92.9507° E"
  },
  {
    id: 8,
    title: "Gulmarg",
    subtitle: "Kashmir",
    description: "A pristine winter wonderland famous for its snow-draped landscapes and pine forests.",
    bgImage: "/images/gulmarg.jpg",
    cardImage: "/images/gulmarg.jpg",
    gradient: "from-slate-900/80 via-blue-200/40 to-transparent",
    accentColor: "#E0F2FE",
    coordinates: "34.0484° N, 74.3805° E"
  }
];

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Search bar state
  const [sourceQuery, setSourceQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<{ _id: string; title: string } | null>(null);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<{ _id: string; title: string } | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [travelersCount, setTravelersCount] = useState(2);
  const [selectedVibe, setSelectedVibe] = useState("Nature");

  // Block user scroll when expanded
  useEffect(() => {
    if (isSearchExpanded) {
      const preventScroll = (e: Event) => e.preventDefault();
      const preventKeyScroll = (e: KeyboardEvent) => {
          if (["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(e.code)) {
              e.preventDefault();
          }
      };

      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      window.addEventListener('keydown', preventKeyScroll, { passive: false });

      return () => {
          window.removeEventListener('wheel', preventScroll);
          window.removeEventListener('touchmove', preventScroll);
          window.removeEventListener('keydown', preventKeyScroll);
      };
    }
  }, [isSearchExpanded]);

  // Auto-advance carousel
  useEffect(() => {
    if (isSearchExpanded) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % LOCATIONS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isSearchExpanded]);

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % LOCATIONS.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + LOCATIONS.length) % LOCATIONS.length);

  const handleSearchClick = () => {
    if (!isSearchExpanded && searchSectionRef.current) {
      setIsSearchExpanded(true);
      // Wait a tiny tick for layout to recalculate so document depth is accurate
      setTimeout(() => {
        if (searchSectionRef.current) {
            window.scrollTo({
              top: searchSectionRef.current.offsetTop,
              behavior: "smooth"
            });
        }
      }, 50);
    }
  };

  const handleCloseSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSearchExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeLoc = LOCATIONS[currentSlide];

  return (
    <>
      <Navigation />

      {/* Hero Section Container */}
      <div className="relative h-screen w-full overflow-hidden">
        
        {/* Animated Backgrounds */}
        {LOCATIONS.map((loc, idx) => (
          <div 
            key={`bg-${loc.id}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt={loc.title} 
              className="w-full h-full object-cover mix-blend-luminosity scale-105" 
              src={loc.bgImage}
            />
            {/* Dynamic Specific Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${loc.gradient} mix-blend-color opacity-80`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-[#050e1c]/40 to-transparent"></div>
          </div>
        ))}

        {/* Vertical Dot Navigator */}
        <aside className="absolute left-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-6">
          <div className="w-[2px] h-12 bg-gradient-to-b from-white/20 to-transparent"></div>
          <div className="flex flex-col gap-4">
            {LOCATIONS.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`rounded-full transition-all cursor-pointer ${
                  idx === currentSlide 
                    ? `w-2.5 h-2.5 ring-4 shadow-lg scale-110` 
                    : `w-1.5 h-1.5 bg-white/40 hover:bg-white/80`
                }`}
                style={{ 
                  backgroundColor: idx === currentSlide ? activeLoc.accentColor : undefined,
                  boxShadow: idx === currentSlide ? `0 0 15px ${activeLoc.accentColor}` : undefined,
                  borderColor: idx === currentSlide ? `${activeLoc.accentColor}40` : undefined // 40 is hex for 25% opacity
                }}
              ></div>
            ))}
          </div>
        </aside>

        {/* Main Hero Content */}
        <main className="relative z-10 flex flex-col items-start justify-center h-full px-[8%] md:px-[10%] pt-20">
          
          <div className="flex flex-col lg:flex-row w-full gap-12 items-center justify-between">
            
            {/* Narrative Content */}
            <section className="flex flex-col gap-4 max-w-2xl w-full">
              <div className="flex items-center gap-3 bg-white/10 w-max px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 mb-2">
                 <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeLoc.accentColor }}></span>
                 <span className="font-technical text-white text-xs tracking-widest uppercase font-semibold">Featured Location</span>
              </div>
              
              <h1 className="font-headline font-black text-5xl md:text-[5.5rem] leading-[1.05] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 drop-shadow-2xl h-[120px] md:h-[180px]">
                {activeLoc.title}
              </h1>
              
              <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-xl font-medium mt-4 h-24">
                {activeLoc.description} Explore deeply saturated landscapes and rich cultural experiences tailored just for you.
              </p>
              
              <div className="pt-8 flex items-center gap-6">
                <Link 
                  href={`/plan?dest=${encodeURIComponent(activeLoc.title)}`}
                  style={{ backgroundColor: activeLoc.accentColor }}
                  className="text-[#050e1c] px-10 py-4 rounded-full font-headline font-bold flex items-center gap-3 group hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl"
                >
                  Plan Your Trip
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </section>

            {/* Dynamic Carousel Cards */}
            <section className="w-full lg:w-auto relative perspective-1000 hidden md:block">
              {/* Controls */}
              <div className="absolute -top-16 right-0 flex gap-4 z-30">
                <button onClick={handlePrev} className="w-12 h-12 rounded-full glass-nav flex items-center justify-center hover:bg-white/10 transition">
                  <span className="material-symbols-outlined text-white">chevron_left</span>
                </button>
                <button onClick={handleNext} className="w-12 h-12 rounded-full glass-nav flex items-center justify-center hover:bg-white/10 transition">
                  <span className="material-symbols-outlined text-white">chevron_right</span>
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex items-center gap-6 relative h-[30rem] w-[24rem]">
                 {LOCATIONS.map((loc, idx) => {
                    // Determine relation to current slide for carousel effect
                    let offset = idx - currentSlide;
                    if (offset < 0) offset += LOCATIONS.length;
                    
                    // Only render if it's the current slide, the next slide, or the prev slide
                    const isVisible = offset === 0 || offset === 1 || offset === LOCATIONS.length - 1;
                    
                    if (!isVisible) return null;

                    const isCurrent = offset === 0;
                    const isNext = offset === 1;

                    return (
                      <div 
                        key={loc.id}
                        className={`absolute top-0 left-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl overflow-hidden glass-nav border border-white/20
                          ${isCurrent ? 'z-20 w-80 h-[28rem] translate-x-0 scale-100 opacity-100 shadow-2xl shadow-black/80' : ''}
                          ${isNext ? 'z-10 w-80 h-[24rem] translate-x-32 translate-y-8 scale-90 opacity-60 shadow-lg' : ''}
                          ${(!isCurrent && !isNext) ? 'z-0 w-80 h-[20rem] -translate-x-32 translate-y-16 scale-75 opacity-0' : ''}
                        `}
                      >
                         <img src={loc.cardImage} alt={loc.title} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-[#050e1c]/40 to-transparent"></div>
                         
                         {isCurrent && (
                          <div className="absolute bottom-6 left-6 right-6 fade-in">
                            <h3 className="font-headline font-bold text-2xl text-white">{loc.title}</h3>
                            <p className="text-white/80 text-sm mt-1">{loc.subtitle}</p>
                          </div>
                         )}
                      </div>
                    )
                 })}
              </div>
            </section>
          </div>
          
        </main>

        {/* Global Meta Footer */}
        <footer className="absolute bottom-6 left-[8%] md:left-[10%] z-40 flex flex-col gap-1">
            <span className="font-technical text-[10px] text-white/50 uppercase tracking-widest transition-opacity duration-300">Location Coordinates</span>
            <span className="font-technical text-sm text-white font-medium drop-shadow-md">{activeLoc.coordinates}</span>
        </footer>

      </div> {/* End Hero Container */}


      {/* Search Section below Fold */}
      <div 
        ref={searchSectionRef}
        className="relative z-40 w-full bg-[#050e1c] flex justify-center"
        style={{ height: isSearchExpanded ? "100vh" : "160px" }}
      >
        <div 
            className="w-full px-4 flex justify-center absolute left-0 transition-all duration-[600ms] ease-out"
            style={{
                top: isSearchExpanded ? '50%' : '0px',
                transform: isSearchExpanded ? 'translateY(-50%)' : 'translateY(-50%)',
            }}
        >
            
            <div 
                onClick={!isSearchExpanded ? handleSearchClick : undefined}
                style={{
                    width: isSearchExpanded ? '100%' : '180px',
                    maxWidth: isSearchExpanded ? '1024px' : '180px',
                    maxHeight: isSearchExpanded ? '500px' : '64px',
                    padding: isSearchExpanded ? '0.5rem' : '0rem', // 8px wrapper padding when expanded
                }}
                className={`relative group bg-white/10 backdrop-blur-2xl border border-white/20 text-white font-headline transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center ${
                   isSearchExpanded ? "rounded-[2rem] md:rounded-full cursor-default" : "rounded-full cursor-pointer hover:bg-white/20"
                }`}
            >
               {/* Button Content (Fades out when expanded) */}
               <div 
                  className={`absolute flex items-center justify-center gap-3 font-bold text-lg whitespace-nowrap transition-opacity duration-[400ms] ${isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
               >
                  <span className="material-symbols-outlined">search</span>
                  <span>Search</span>
               </div>

               {/* Expanded Content (Fades in when expanded) */}
               <div 
                  className={`w-full flex flex-col md:flex-row items-center justify-between transition-all duration-[800ms] delay-[100ms] ${
                      isSearchExpanded ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none absolute'
                  }`}
               >
                   <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-5 px-6 py-4 md:py-0 gap-6 md:gap-4 whitespace-nowrap">
                      <DestinationAutocomplete
                        label="Source"
                        placeholder="Current Location?"
                        value={sourceQuery}
                        onChange={setSourceQuery}
                        onSelect={(s) => setSelectedSource(s ? { _id: s._id, title: s.title } : null)}
                      />
                      <div className="md:border-l md:border-white/10 md:pl-6">
                        <DestinationAutocomplete
                          value={destinationQuery}
                          onChange={setDestinationQuery}
                          onSelect={(s) => setSelectedDestination(s ? { _id: s._id, title: s.title } : null)}
                        />
                      </div>
                      <CalendarPicker
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={(s, e) => { setStartDate(s); setEndDate(e); }}
                      />
                      <div className="flex flex-col md:border-l md:border-white/10 md:pl-6 pt-4 md:pt-0 border-t border-white/10 md:border-t-0 col-span-2 md:col-span-1">
                        <span className="text-[10px] font-technical uppercase text-[#B4D104] tracking-widest">Travelers</span>
                        <select value={travelersCount} onChange={(e) => setTravelersCount(parseInt(e.target.value))} className="bg-transparent border-none text-white font-headline font-semibold text-sm focus:outline-none mt-1 appearance-none cursor-pointer">
                          <option value={1} className="bg-[#050e1c]">1 Guest</option>
                          <option value={2} className="bg-[#050e1c]">2 Guests</option>
                          <option value={3} className="bg-[#050e1c]">3+ Guests</option>
                        </select>
                      </div>
                      <div className="flex flex-col md:border-l md:border-white/10 md:pl-6 pt-4 md:pt-0 border-t border-white/10 md:border-t-0 col-span-2 md:col-span-1">
                        <span className="text-[10px] font-technical uppercase text-[#B4D104] tracking-widest">Vibe</span>
                        <select
                          value={selectedVibe}
                          onChange={(e) => setSelectedVibe(e.target.value)}
                          className="bg-transparent border-none text-white font-headline font-semibold text-sm focus:outline-none mt-1 appearance-none cursor-pointer"
                        >
                          <option className="bg-[#050e1c]">Nature</option>
                          <option className="bg-[#050e1c]">Culture</option>
                          <option className="bg-[#050e1c]">Adventure</option>
                        </select>
                      </div>
                   </div>
                   
                   <div className="flex w-full md:w-auto mt-2 md:mt-0 p-2 md:p-0 items-center justify-end gap-2">
                       {/* Close Button */}
                       <button 
                         onClick={handleCloseSearch}
                         className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 shrink-0"
                         title="Close Search"
                       >
                           <span className="material-symbols-outlined text-white">close</span>
                       </button>
                        <button 
                           onClick={() => {
                             const sourceName = selectedSource?.title || sourceQuery || "New Delhi";
                             const destName = selectedDestination?.title || destinationQuery || "Manali";
                             
                             let queryUrl = `/plan?source=${encodeURIComponent(sourceName)}&tab=hotels`;
                             if (destName) queryUrl += `&dest=${encodeURIComponent(destName)}`;
                             else queryUrl += `&vibe=${encodeURIComponent(selectedVibe)}`;

                             if (startDate && endDate) {
                               queryUrl += `&start=${startDate.toISOString()}&end=${endDate.toISOString()}&travelers=${travelersCount}`;
                             }
                             
                             router.push(queryUrl);
                           }}
                           className="flex-1 md:flex-none h-12 bg-gradient-to-r from-[#D30C5C] to-[#DF33DF] text-white font-bold px-8 justify-center rounded-full text-sm hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                           Search
                        </button>
                   </div>
               </div>
            </div>
            
        </div>
      </div>

    </>
  );
}
