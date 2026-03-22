"use client";

interface AmenityCategory {
  name: string;
  icon: string;
  items: string[];
}

interface AmenityGroup {
  title: string;
  items: AmenityCategory[];
}

interface PropertyModalProps {
  amenityGroups: AmenityGroup[];
  onClose: () => void;
}

const AMENITY_ICONS: Record<string, string> = {
  wifi: "wifi",
  internet: "wifi",
  parking: "local_parking",
  breakfast: "restaurant",
  pet: "pets",
  family: "family_restroom",
  laundry: "local_laundry_service",
  convenience: "concierge",
  guest: "room_service",
  outdoor: "park",
  accessibility: "accessible",
  smoking: "smoking_rooms",
  activity: "sports_score",
  pool: "pool",
  fitness: "fitness_center",
  spa: "spa",
  default: "check_circle",
};

function getIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return AMENITY_ICONS.default;
}

export default function PropertyModal({ amenityGroups, onClose }: PropertyModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0f1a2e] z-10">
          <h2 className="text-xl font-headline font-bold text-white">All property amenities</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white/80">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] custom-scrollbar">
          {amenityGroups.length > 0 ? (
            amenityGroups.map((group, gi) => (
              <div key={gi} className="mb-6">
                {group.items.map((category, ci) => (
                  <div key={ci} className="mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-[#3B6FE8] text-xl">
                        {getIcon(category.name)}
                      </span>
                      <h3 className="text-base font-headline font-bold text-white">
                        {category.name}
                      </h3>
                    </div>
                    <div className="pl-9 space-y-1.5">
                      {category.items.map((item, ii) => (
                        <p key={ii} className="text-sm text-white/70">{item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            /* Fallback: hardcoded amenities from user's requirements */
            <div className="space-y-5">
              {[
                {
                  icon: "wifi", name: "Internet", items: [
                    "Available in all rooms: Free WiFi",
                    "In-room WiFi speed: 250+ Mbps (good for 3–5 people or up to 10 devices)",
                    "Available in some public areas: Free WiFi",
                  ],
                },
                {
                  icon: "local_parking", name: "Parking", items: [
                    "Free secured self parking on site",
                    "Wheelchair-accessible parking and van parking available",
                  ],
                },
                {
                  icon: "restaurant", name: "Breakfast", items: [
                    "Buffet breakfast for a fee",
                    "Served weekends from 8:00 AM - 10:30 AM",
                    "INR 400 per person",
                  ],
                },
                {
                  icon: "pets", name: "Pet friendly", items: [
                    "Welcoming dogs only",
                    "Fee: INR 500 per pet per day",
                    "Pets allowed in specific rooms only and may not be left unattended; other pets allowed with some restrictions",
                    "One-time cleaning fee: INR 500",
                  ],
                },
                {
                  icon: "family_restroom", name: "Family friendly", items: ["Laundry facilities"],
                },
                {
                  icon: "concierge", name: "Conveniences", items: [
                    "24-hour front desk",
                    "Laundry facilities",
                    "Luggage storage",
                  ],
                },
                {
                  icon: "room_service", name: "Guest services", items: [
                    "Change of bedsheets (on request)",
                    "Change of towels on request",
                    "Dry cleaning/laundry service",
                    "Housekeeping (daily)",
                    "Tour and ticket assistance",
                  ],
                },
                {
                  icon: "park", name: "Outdoors", items: [
                    "In a nature reserve",
                    "In the mountains",
                    "On a river",
                  ],
                },
                {
                  icon: "accessible", name: "Accessibility", items: [
                    "If you have requests for specific accessibility needs, please contact the property using the information on the reservation confirmation received after booking.",
                    "1 step to reach entrance",
                    "3 accessible parking spaces",
                    "Elevator (120 inch wide door)",
                    "Front entrance ramp",
                    "Grab bar in shower (40 inches high)",
                    "Phone accessibility kit",
                    "Sign language-capable staff",
                    "Valet for wheelchair-equipped vehicles",
                    "Visual fire alarm",
                    "Wheelchair accessibility",
                    "Wheelchair accessible (may have limitations)",
                    "Wheelchair-accessible parking",
                    "Wheelchair-accessible path of travel",
                    "Wheelchair-accessible path to elevator",
                    "Wheelchair-accessible public washroom",
                    "Wheelchair-accessible registration desk",
                    "Wheelchair-accessible restaurant",
                    "Wheelchair-accessible van parking",
                    "Wheelchair-width doorways",
                  ],
                },
                {
                  icon: "smoking_rooms", name: "More", items: [
                    "Designated smoking areas",
                    "Activities nearby: Winery tours",
                  ],
                },
              ].map((cat, i) => (
                <div key={i} className="mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-[#3B6FE8] text-xl">{cat.icon}</span>
                    <h3 className="text-base font-headline font-bold text-white">{cat.name}</h3>
                  </div>
                  <div className="pl-9 space-y-1.5">
                    {cat.items.map((item, ii) => (
                      <p key={ii} className="text-sm text-white/70">{item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
