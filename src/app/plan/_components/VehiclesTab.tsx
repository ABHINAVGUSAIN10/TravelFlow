import { PLAN_VEHICLES } from "@/lib/data";

export default function VehiclesTab() {
  return (
    <div className="fade-in flex flex-col gap-6">
      <h2 className="text-2xl font-headline font-bold border-b border-white/10 pb-4 flex items-center gap-3">
         <span className="material-symbols-outlined text-[#3B6FE8]">directions_bus</span>
         Transport Options
      </h2>
      {PLAN_VEHICLES.map(v => (
        <div key={v.id} className="bg-[#16202f] rounded-2xl p-6 flex justify-between shadow-xl border border-white/5 items-center">
            <div className="flex-1">
                <span className="font-technical text-[10px] text-[#3B6FE8] uppercase tracking-widest">{v.route}</span>
                <h3 className="text-xl font-headline font-bold mt-1">{v.type}</h3>
                <div className="flex items-center gap-4 mt-2 text-white/50 text-sm font-technical">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {v.dep}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">timelapse</span> {v.duration}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="font-headline font-bold text-xl mb-3">{v.price}</p>
                <button className="bg-[#3B6FE8] text-white px-5 py-2 rounded-full text-xs font-bold hover:opacity-90 transition shadow-lg shadow-[#3B6FE8]/20">Select</button>
            </div>
        </div>
      ))}
    </div>
  );
}
