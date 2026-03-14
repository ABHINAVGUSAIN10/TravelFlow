import { PLAN_HOTELS } from "@/lib/data";

export default function HotelsTab() {
  return (
    <div className="fade-in flex flex-col gap-6">
      <h2 className="text-2xl font-headline font-bold border-b border-white/10 pb-4 flex items-center gap-3">
         <span className="material-symbols-outlined text-[#D30C5C]">bed</span>
         Available Stays
      </h2>
      {PLAN_HOTELS.map(hotel => (
        <div key={hotel.id} className="bg-[#16202f] rounded-2xl p-4 flex gap-6 shadow-xl border border-white/5 items-center">
            <div className="w-32 h-24 relative rounded-xl overflow-hidden shrink-0">
                <img src={hotel.image} alt={hotel.name} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-headline font-bold">{hotel.name}</h3>
                <p className="text-white/60 text-sm">{hotel.location}</p>
                <div className="flex items-center gap-1 mt-2 text-[#EAED41]">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="font-technical text-sm font-bold">{hotel.rating}</span>
                </div>
            </div>
            <div className="text-right pr-4">
                <p className="font-headline font-bold text-xl mb-3">{hotel.price}</p>
                <button className="bg-[#D30C5C] text-white px-5 py-2 rounded-full text-xs font-bold hover:opacity-90 transition shadow-lg shadow-[#D30C5C]/20">Book Now</button>
            </div>
        </div>
      ))}
    </div>
  );
}
