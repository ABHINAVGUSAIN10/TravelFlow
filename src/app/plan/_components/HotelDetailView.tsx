"use client";

import { useState, useEffect } from "react";
import PropertyModal from "./PropertyModal";
import AreaModal from "./AreaModal";

interface HotelDetailViewProps {
  hotelId: string;
  hotelName: string;
  onBack: () => void;
  onBookItem?: (price: number) => void;
}

export default function HotelDetailView({ hotelId, hotelName, onBack, onBookItem }: HotelDetailViewProps) {
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/hotels/${hotelId}?name=${encodeURIComponent(hotelName)}`);
        if (res.ok) {
          const data = await res.json();
          setHotel(data);
        }
      } catch (err) {
        console.error("Failed to fetch hotel detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [hotelId]);

  if (loading) {
    return (
      <div className="fade-in flex flex-col gap-6">
        {/* Back button */}
        <button onClick={onBack} className="flex items-center gap-2 text-[#3B6FE8] hover:text-[#5a8bf5] transition-colors w-fit">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-sm font-medium">Back to Hotels</span>
        </button>

        {/* Skeleton loader */}
        <div className="animate-pulse space-y-6">
          <div className="bg-white/5 rounded-2xl h-64 w-full" />
          <div className="bg-white/5 rounded-xl h-8 w-3/4" />
          <div className="bg-white/5 rounded-xl h-4 w-1/2" />
          <div className="flex gap-4">
            <div className="bg-white/5 rounded-xl h-20 w-1/3" />
            <div className="bg-white/5 rounded-xl h-20 w-1/3" />
            <div className="bg-white/5 rounded-xl h-20 w-1/3" />
          </div>
          <div className="bg-white/5 rounded-2xl h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="fade-in">
        <button onClick={onBack} className="flex items-center gap-2 text-[#3B6FE8] hover:text-[#5a8bf5] transition-colors w-fit mb-6">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-sm font-medium">Back to Hotels</span>
        </button>
        <p className="text-white/60">Failed to load hotel details.</p>
      </div>
    );
  }

  const displayImages = hotel.images?.length > 0 ? hotel.images : [];
  const stars = hotel.starRating || 0;

  return (
    <div className="fade-in flex flex-col gap-8">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-[#3B6FE8] hover:text-[#5a8bf5] transition-colors w-fit">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        <span className="text-sm font-medium">Back to Hotels</span>
      </button>

      {/* ============ IMAGE GALLERY ============ */}
      {displayImages.length > 0 && (
        <div className="space-y-2">
          {/* Main large image */}
          <div className="relative rounded-2xl overflow-hidden h-72 group">
            <img
              src={displayImages[activeImageIndex]}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Nav arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : displayImages.length - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/50 dark:bg-black/50 flex items-center justify-center hover:bg-slate-900/70 dark:bg-black/70 transition opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-white text-lg">chevron_left</span>
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => prev < displayImages.length - 1 ? prev + 1 : 0)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/50 dark:bg-black/50 flex items-center justify-center hover:bg-slate-900/70 dark:bg-black/70 transition opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-white text-lg">chevron_right</span>
                </button>
              </>
            )}
            {/* Image count badge */}
            <div className="absolute bottom-3 right-3 bg-slate-900/60 dark:bg-black/60 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
              <span className="text-white text-xs font-medium">{displayImages.length}+</span>
            </div>
          </div>

          {/* Thumbnail strip */}
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {displayImages.slice(0, 8).map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? "border-[#3B6FE8] shadow-lg shadow-[#3B6FE8]/20" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ HOTEL HEADER ============ */}
      <div>
        <h2 className="text-3xl font-headline font-black text-white mb-1">{hotel.name}</h2>

        {/* Star rating */}
        {stars > 0 && (
          <div className="flex items-center gap-0.5 mb-3">
            {Array.from({ length: Math.round(stars) }).map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined text-[#EAED41] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Fully refundable
          </span>
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Reserve now, pay later
          </span>
        </div>

        {/* Review score */}
        {hotel.reviewScore > 0 && (
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 text-white font-bold text-sm">
              {hotel.reviewScore}
            </span>
            <div>
              <span className="text-white font-bold text-sm">{hotel.reviewQuality || "Excellent"}</span>
              {hotel.totalReviews > 0 && (
                <span className="text-white/50 text-xs block">
                  See {hotel.totalReviews} review{hotel.totalReviews > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============ HIGHLIGHTS ============ */}
      {hotel.highlights && hotel.highlights.length > 0 && (
        <div className="bg-[#16202f] rounded-2xl p-5 border border-white/5">
          <h3 className="text-lg font-headline font-bold text-white mb-4">Highlights for your trip</h3>
          <div className="space-y-3">
            {hotel.highlights.map((h: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B6FE8]/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#3B6FE8] text-lg">
                    {h.icon || "star"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{h.title}</p>
                  {h.subtitle && <p className="text-xs text-white/60 mt-0.5">{h.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ ABOUT THIS PROPERTY ============ */}
      <div className="bg-[#16202f] rounded-2xl p-5 border border-white/5">
        <h3 className="text-lg font-headline font-bold text-white mb-2">About this property</h3>
        {(hotel.tagline || hotel.description) && (
          <p className="text-sm text-white/70 mb-4">{hotel.tagline || hotel.description}</p>
        )}

        {/* Key amenities grid */}
        {hotel.keyAmenities && hotel.keyAmenities.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {hotel.keyAmenities.slice(0, 6).map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3B6FE8] text-base">
                  {a.icon || "check_circle"}
                </span>
                <span className="text-sm text-white/80">{a.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* See all about the property link */}
        <button
          onClick={() => setShowPropertyModal(true)}
          className="text-[#3B6FE8] text-sm font-medium hover:text-[#5a8bf5] transition-colors flex items-center gap-1"
        >
          See all about the property
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>

      {/* ============ EXPLORE THE AREA ============ */}
      <div className="bg-[#16202f] rounded-2xl p-5 border border-white/5">
        <h3 className="text-lg font-headline font-bold text-white mb-4">Explore the area</h3>

        {hotel.address && (
          <p className="text-sm text-white/60 mb-4">{hotel.address}</p>
        )}

        {/* Nearby places */}
        <div className="space-y-3 mb-4">
          {(hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0
            ? hotel.nearbyPlaces.slice(0, 4)
            : [
                { name: "Mall Road", distance: "6 min drive", icon: "location_on" },
                { name: "Himalayan Nyinmapa Buddhist Monastery", distance: "8 min drive", icon: "location_on" },
                { name: "Solang-Nullah", distance: "8 min drive", icon: "location_on" },
                { name: "Kullu (KUU-Kullu Manali)", distance: "80 min drive", icon: "flight" },
              ]
          ).map((place: any, i: number) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#3B6FE8] text-base">
                  {place.icon || "location_on"}
                </span>
                <span className="text-sm text-white/80">{place.name}</span>
              </div>
              <span className="text-xs text-white/50">{place.distance}</span>
            </div>
          ))}
        </div>

        {/* See all about area link */}
        <button
          onClick={() => setShowAreaModal(true)}
          className="text-[#3B6FE8] text-sm font-medium hover:text-[#5a8bf5] transition-colors flex items-center gap-1"
        >
          See all about the area
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>

      {/* ============ CHOOSE YOUR ROOM ============ */}
      <div>
        <h3 className="text-2xl font-headline font-bold text-white mb-6">Choose your room</h3>
        <div className="flex flex-col gap-6">
          {(hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms : generateFallbackRooms()).map((room: any, i: number) => (
            <RoomCard key={room.id || i} room={room} index={i} onBookItem={onBookItem} />
          ))}
        </div>
      </div>

      {/* ============ MODALS ============ */}
      {showPropertyModal && (
        <PropertyModal
          amenityGroups={hotel.amenityGroups || []}
          onClose={() => setShowPropertyModal(false)}
        />
      )}
      {showAreaModal && (
        <AreaModal
          hotelName={hotel.name}
          areaInfo={hotel.areaInfo || { description: "", whatsNearby: [], gettingAround: [], restaurants: [] }}
          nearbyPlaces={hotel.nearbyPlaces || []}
          onClose={() => setShowAreaModal(false)}
        />
      )}
    </div>
  );
}

/* ======================== ROOM CARD ======================== */
function RoomCard({ room, index, onBookItem }: { room: any; index: number; onBookItem?: (price: number) => void }) {
  const [selectedExtra, setSelectedExtra] = useState(0);
  const [isReserved, setIsReserved] = useState(false);

  const badges = ["Our lowest price", "Enjoy a room with a view", "Upgrade your stay", "Best value", "Popular choice"];
  const badge = room.badge || badges[index % badges.length];

  // Mock extras if none from API
  const extras = [
    { label: "No extras", price: "+ ₹0", priceRaw: 0 },
    { label: "Breakfast buffet", price: "+ ₹420", priceRaw: 420 },
    { label: "Half board", price: "+ ₹3,620", priceRaw: 3620 },
  ];

  // Calculate dynamic price
  let basePrice = 0;
  if (room.priceRaw) {
    basePrice = room.priceRaw;
  } else if (room.price) {
    basePrice = parseInt(room.price.replace(/[^0-9]/g, "")) || 0;
  } else {
    basePrice = 3780; // fallback
  }
  const currentPriceRaw = basePrice + extras[selectedExtra].priceRaw;
  const currentPriceFormatted = `₹${currentPriceRaw.toLocaleString('en-IN')}`;

  return (
    <div className="bg-[#16202f] rounded-2xl overflow-hidden border border-white/5 shadow-xl hover:border-white/10 transition-colors">
      {/* Badge header */}
      <div className="bg-[#0a1422] px-4 py-2 border-b border-white/5">
        <span className="text-xs font-bold text-[#EAED41] uppercase tracking-wider">{badge}</span>
      </div>

      {/* Room image */}
      {room.image && (
        <div className="relative h-44 overflow-hidden group">
          <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {/* Nav arrows */}
          <button className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/50 dark:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <span className="material-symbols-outlined text-white text-sm">chevron_left</span>
          </button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/50 dark:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <span className="material-symbols-outlined text-white text-sm">chevron_right</span>
          </button>
          {/* Image count */}
          {room.imageCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-slate-900/60 dark:bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-white text-xs">photo_camera</span>
              <span className="text-white text-[10px] font-medium">{room.imageCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Room content */}
      <div className="p-4">
        <h4 className="text-base font-headline font-bold text-white mb-3">{room.name}</h4>

        {/* Features */}
        <div className="space-y-1.5 mb-4">
          {(room.features && room.features.length > 0
            ? room.features.slice(0, 6)
            : ["Free self parking", "Free WiFi", "Reserve now, pay later"]
          ).map((f: string, fi: number) => (
            <div key={fi} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-xs">check</span>
              <span className="text-xs text-white/70">{f}</span>
            </div>
          ))}
        </div>

        {/* Refundable badge */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
          <span className="text-xs text-emerald-400 font-medium">Fully refundable</span>
        </div>

        {/* Extras */}
        <div className="border-t border-white/5 pt-4 mb-4">
          <p className="text-xs font-bold text-white mb-2">Extras</p>
          <div className="space-y-2">
            {extras.map((extra, ei) => (
              <label
                key={ei}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isReserved) setSelectedExtra(ei);
                }}
                className={`flex items-center justify-between group ${!isReserved ? 'cursor-pointer' : 'opacity-70 cursor-default'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedExtra === ei ? "border-[#3B6FE8] bg-[#3B6FE8]" : "border-white/30 group-hover:border-white/50"
                  }`}>
                    {selectedExtra === ei && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs text-white/80">{extra.label}</span>
                </div>
                <span className="text-xs text-white/50">{extra.price}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between mb-4">
          <div>
            {room.strikethrough && (
              <span className="text-xs text-white/40 line-through mr-2">{room.strikethrough}</span>
            )}
            <span className="text-xl font-headline font-bold text-white">
              {currentPriceFormatted}
            </span>
            {room.discount && (
              <span className="ml-2 bg-[#D30C5C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {room.discount}
              </span>
            )}
          </div>
          {room.totalPrice && (
            <span className="text-[10px] text-white/40">{room.totalPrice}<br />includes taxes & fees</span>
          )}
        </div>

        {/* Reserve button */}
        {isReserved ? (
          <div className="w-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
            <span className="material-symbols-outlined text-emerald-400">check_circle</span>
            Successfully Reserved
          </div>
        ) : (
          <button 
            onClick={() => {
              setIsReserved(true);
              if (onBookItem) onBookItem(currentPriceRaw);
            }}
            className="w-full bg-[#3B6FE8] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#2d5bc9] transition-colors shadow-lg shadow-[#3B6FE8]/20"
          >
            Reserve
          </button>
        )}
        <p className="text-[10px] text-white/40 text-center mt-2">You will not be charged yet</p>
      </div>
    </div>
  );
}

/* ======================== FALLBACK ======================== */
function generateFallbackRooms() {
  return [
    {
      id: "r1",
      name: "Classic Chalet, Mountain View",
      image: "",
      imageCount: 8,
      features: ["Mountain view", "Free self parking", "20 sq m", "1 bedroom", "Sleeps 2", "1 King Bed", "Reserve now, pay later", "Free WiFi"],
      badge: "Our lowest price",
      price: "₹3,780",
      strikethrough: "₹5,400",
      totalPrice: "₹22,345 total",
      discount: "30% Off",
    },
    {
      id: "r2",
      name: "Luxury Double Room, Balcony, Valley View",
      image: "",
      imageCount: 22,
      features: ["Valley view", "Free self parking", "18 sq m", "Sleeps 2", "1 King Bed", "Reserve now, pay later", "Free WiFi"],
      badge: "Enjoy a room with a view",
      price: "₹4,480",
      strikethrough: "₹6,400",
      totalPrice: "₹26,020 total",
      discount: "30% Off",
    },
    {
      id: "r3",
      name: "Deluxe Double Room, Balcony, Mountain View",
      image: "",
      imageCount: 14,
      features: ["Mountain view", "Free self parking", "20 sq m", "Sleeps 3", "1 King Bed", "Reserve now, pay later", "Free WiFi"],
      badge: "Upgrade your stay",
      price: "₹4,550",
      strikethrough: "₹6,500",
      totalPrice: "₹26,388 total",
      discount: "30% Off",
    },
  ];
}
