import { PLAN_GUIDES } from "@/lib/data";

export default function GuidesTab() {
  return (
    <div className="fade-in flex flex-col gap-6">
      <h2 className="text-2xl font-headline font-bold border-b border-white/10 pb-4 flex items-center gap-3">
         <span className="material-symbols-outlined text-[#0DF5E3]">group</span>
         Local Tour Guides
      </h2>
      {PLAN_GUIDES.map(g => (
        <div key={g.id} className="bg-[#16202f] rounded-2xl p-6 flex justify-between shadow-xl border border-white/5 items-center">
            <div className="w-16 h-16 rounded-full bg-white/10 shrink-0 flex items-center justify-center mr-6 border border-white/20">
                <span className="material-symbols-outlined text-3xl text-white/50">person</span>
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-headline font-bold">{g.name}</h3>
                <p className="text-[#0DF5E3] text-sm uppercase font-technical tracking-wider mb-1 mt-1">{g.specialty}</p>
                <p className="text-white/50 text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">translate</span> {g.languages}
                </p>
            </div>
            <div className="text-right">
                <div className="flex justify-end items-center gap-1 mb-2 text-[#EAED41]">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="font-technical text-sm font-bold">{g.rating}</span>
                </div>
                <p className="font-headline font-bold text-lg mb-2">{g.price}</p>
                <button className="border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-white/10 transition">Hire Guide</button>
            </div>
        </div>
      ))}
    </div>
  );
}
