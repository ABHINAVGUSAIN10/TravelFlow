"use client";

interface AreaInfo {
  description: string;
  whatsNearby: { name: string; distance: string }[];
  gettingAround: { name: string; distance: string }[];
  restaurants: { name: string; distance: string }[];
}

interface NearbyPlace {
  name: string;
  distance: string;
}

interface AreaModalProps {
  hotelName: string;
  areaInfo: AreaInfo;
  nearbyPlaces: NearbyPlace[];
  onClose: () => void;
}

export default function AreaModal({ hotelName, areaInfo, nearbyPlaces, onClose }: AreaModalProps) {
  // Use API data or fallback
  const hasApiData =
    areaInfo.description ||
    areaInfo.whatsNearby.length > 0 ||
    nearbyPlaces.length > 0;

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
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#3B6FE8]">explore</span>
            <h2 className="text-xl font-headline font-bold text-white">Explore the area</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white/80">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] custom-scrollbar">
          {hasApiData ? (
            <>
              {/* About the area */}
              {areaInfo.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-headline font-bold text-white mb-3">About the area</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{areaInfo.description}</p>
                </div>
              )}

              {/* What's nearby */}
              {(nearbyPlaces.length > 0 || areaInfo.whatsNearby.length > 0) && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#3B6FE8] text-lg">location_on</span>
                    <h3 className="text-base font-headline font-bold text-white">What&apos;s nearby</h3>
                  </div>
                  <div className="pl-8 space-y-2">
                    {(areaInfo.whatsNearby.length > 0 ? areaInfo.whatsNearby : nearbyPlaces).map((p, i) => (
                      <p key={i} className="text-sm text-white/70">{p.name} - {p.distance}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Getting around */}
              {areaInfo.gettingAround.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#3B6FE8] text-lg">directions_car</span>
                    <h3 className="text-base font-headline font-bold text-white">Getting around</h3>
                  </div>
                  <div className="pl-8 space-y-2">
                    {areaInfo.gettingAround.map((t, i) => (
                      <p key={i} className="text-sm text-white/70">{t.name} - {t.distance}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurants */}
              {areaInfo.restaurants.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#3B6FE8] text-lg">restaurant</span>
                    <h3 className="text-base font-headline font-bold text-white">Restaurants</h3>
                  </div>
                  <div className="pl-8 space-y-2">
                    {areaInfo.restaurants.map((r, i) => (
                      <p key={i} className="text-sm text-white/70">{r.name} - {r.distance}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Fallback: hardcoded data from user's requirements */
            <>
              <div className="mb-6">
                <h3 className="text-lg font-headline font-bold text-white mb-3">About the area</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Located in Manali, {hotelName} is in the city centre and on the riverwalk. Mall Road and Club House 
                  are worth checking out if shopping is on the agenda, while those wishing to experience the area&apos;s 
                  natural beauty can explore Pin Valley National Park and Van Vihar National Park. Solang-Nullah and 
                  Vashist Springs are also worth visiting. Spend some time exploring the area&apos;s activities, including 
                  winery tours.
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#3B6FE8] text-lg">location_on</span>
                  <h3 className="text-base font-headline font-bold text-white">What&apos;s nearby</h3>
                </div>
                <div className="pl-8 space-y-2">
                  {[
                    "Mall Road - 6 min drive",
                    "Himalayan Nyinmapa Buddhist Temple - 8 min drive",
                    "Himalayan Nyinmapa Buddhist Monastery - 8 min drive",
                    "Solang-Nullah - 8 min drive",
                    "Vashist Springs - 9 min drive",
                  ].map((item, i) => (
                    <p key={i} className="text-sm text-white/70">{item}</p>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#3B6FE8] text-lg">directions_car</span>
                  <h3 className="text-base font-headline font-bold text-white">Getting around</h3>
                </div>
                <div className="pl-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/40 text-sm">train</span>
                    <p className="text-sm text-white/70">Joginder Nagar Station</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/40 text-sm">flight</span>
                    <p className="text-sm text-white/70">Kullu (KUU-Kullu Manali) - 80 min drive</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#3B6FE8] text-lg">restaurant</span>
                  <h3 className="text-base font-headline font-bold text-white">Restaurants</h3>
                </div>
                <div className="pl-8 space-y-2">
                  <p className="text-sm text-white/70">Friendship - 10 min walk</p>
                  <p className="text-sm text-white/70">Byke Hotel - 13 min walk</p>
                  <p className="text-sm text-white/70">Italian Pizza Hut - 8 min drive</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
