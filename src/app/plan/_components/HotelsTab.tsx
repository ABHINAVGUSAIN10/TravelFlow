"use client";

import { useState, useEffect } from "react";
import HotelDetailView from "./HotelDetailView";

interface HotelsTabProps {
  destination: string;
  onBookItem?: (price: number) => void;
  onHotelSelect?: (hotel: { name: string; address?: string; price?: string; roomType?: string }) => void;
}

interface Hotel {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalReviews: number;
  reviewSummary: string;
  price: string;
  priceRaw: number;
  strikethrough: string;
  address: string;
  starRating: number;
  badge: string;
}

export default function HotelsTab({ destination, onBookItem, onHotelSelect }: HotelsTabProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<{ id: string; name: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<"recommended" | "price_asc" | "price_desc">("recommended");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/hotels/search?dest=${encodeURIComponent(destination)}`);
        if (!res.ok) throw new Error("Failed to fetch hotels");
        const data = await res.json();
        setHotels(data.hotels || []);
        setNextPageToken(data.nextPageToken || null);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    if (destination) fetchHotels();
  }, [destination]);

  async function loadMore() {
    if (!nextPageToken) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/hotels/search?dest=${encodeURIComponent(destination)}&next_page_token=${encodeURIComponent(nextPageToken)}`);
      if (!res.ok) throw new Error("Failed to fetch more hotels");
      const data = await res.json();
      setHotels((prev) => [...prev, ...(data.hotels || [])]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err: any) {
      console.error("Failed to load more:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }

  // If a hotel is selected, show detail view
  if (selectedHotel) {
    return (
      <HotelDetailView
        hotelId={selectedHotel.id}
        hotelName={selectedHotel.name}
        onBack={() => setSelectedHotel(null)}
        onBookItem={onBookItem}
        onHotelSelect={onHotelSelect}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="fade-in flex flex-col gap-6">
        <h2 className="text-2xl font-headline font-bold border-b border-white/10 pb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#D30C5C]">bed</span>
          Available Stays
        </h2>
        {/* Skeleton cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#16202f] rounded-2xl p-4 flex gap-6 shadow-xl border border-white/5 items-center animate-pulse">
            <div className="w-32 h-24 rounded-xl bg-white/5 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="bg-white/5 rounded h-5 w-3/4" />
              <div className="bg-white/5 rounded h-3 w-1/2" />
              <div className="bg-white/5 rounded h-3 w-1/4" />
            </div>
            <div className="space-y-3">
              <div className="bg-white/5 rounded h-5 w-20" />
              <div className="bg-white/5 rounded-full h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fade-in flex flex-col gap-6">
        <h2 className="text-2xl font-headline font-bold border-b border-white/10 pb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#D30C5C]">bed</span>
          Available Stays
        </h2>
        <div className="bg-[#16202f] rounded-2xl p-8 text-center border border-white/5">
          <span className="material-symbols-outlined text-4xl text-white/30 mb-3 block">error_outline</span>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3B6FE8] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#2d5bc9] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  const displayedHotels = [...hotels].sort((a, b) => {
    if (sortOrder === "price_asc") return (a.priceRaw || Infinity) - (b.priceRaw || Infinity);
    if (sortOrder === "price_desc") return (b.priceRaw || 0) - (a.priceRaw || 0);
    return 0; // Already sorted by recommended mapped from backend
  });

  return (
    <div className="fade-in flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-[#D30C5C]">bed</span>
          Available Stays
          <span className="text-sm font-normal text-white/40 font-body ml-3">
            {hotels.length} hotel{hotels.length !== 1 ? "s" : ""} found
          </span>
        </h2>
        
        {hotels.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50 font-medium">Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "recommended" | "price_asc" | "price_desc")}
              className="bg-[#16202f] text-white text-sm border border-white/10 rounded px-2 py-1 outline-none focus:border-[#3B6FE8] transition-colors cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {displayedHotels.length === 0 ? (
        <div className="bg-[#16202f] rounded-2xl p-8 text-center border border-white/5">
          <span className="material-symbols-outlined text-4xl text-white/30 mb-3 block">hotel</span>
          <p className="text-white/60">No hotels found for {destination}</p>
        </div>
      ) : (
        <>
          {displayedHotels.map((hotel) => (
            <button
              key={`${hotel.id}-${hotel.name}`}
              onClick={() => setSelectedHotel({ id: hotel.id, name: hotel.name })}
              className="bg-[#16202f] rounded-2xl p-4 flex gap-6 shadow-xl border border-white/5 items-center hover:border-white/20 hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
            >
              {/* Hotel image */}
              <div className="w-32 h-24 relative rounded-xl overflow-hidden shrink-0">
                {hotel.image ? (
                  <img src={hotel.image} alt={hotel.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-2xl">hotel</span>
                  </div>
                )}
                {/* Badge */}
                {hotel.badge && (
                  <span className="absolute top-1.5 left-1.5 bg-[#D30C5C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {hotel.badge}
                  </span>
                )}
              </div>

              {/* Hotel info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-headline font-bold text-white truncate group-hover:text-[#3B6FE8] transition-colors">
                  {hotel.name}
                </h3>
                {hotel.address && (
                  <p className="text-white/50 text-sm truncate">{hotel.address}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {/* Review score */}
                  {hotel.rating > 0 && (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500 text-white font-bold text-xs">
                      {hotel.rating}
                    </span>
                  )}
                  {hotel.reviewSummary && (
                    <span className="text-xs text-white/60">{hotel.reviewSummary}</span>
                  )}
                  {hotel.totalReviews > 0 && (
                    <span className="text-xs text-white/40">({hotel.totalReviews} reviews)</span>
                  )}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="text-right pr-2 shrink-0">
                {hotel.strikethrough && (
                  <p className="text-xs text-white/40 line-through">{hotel.strikethrough}</p>
                )}
                <p className="font-headline font-bold text-lg text-white mb-2">{hotel.price || "Contact for Price"}</p>
                <span className="bg-[#D30C5C] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-[#D30C5C]/20 inline-block">
                  View Details
                </span>
              </div>
            </button>
          ))}

          {nextPageToken && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Loading...
                  </>
                ) : (
                  "Load More Stays"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
