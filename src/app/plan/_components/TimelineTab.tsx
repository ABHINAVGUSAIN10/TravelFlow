export default function TimelineTab() {
  return (
    <div className="relative pl-8 fade-in">
      {/* Vertical Dashed Line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[linear-gradient(to_bottom,rgba(255,255,255,0.2)_50%,transparent_50%)] bg-[length:1px_12px]"></div>
      
      {/* Timeline Item: Bus */}
      <div className="relative mb-8 group">
        <div className="absolute -left-[28px] top-6 w-5 h-5 rounded-full bg-[#3B6FE8] border-4 border-[#0a1422] z-10 shadow-[0_0_15px_rgba(59,111,232,0.5)]"></div>
        <div className="bg-[#16202f] rounded-2xl p-6 flex gap-6 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 hover:border-white/20">
          <div className="w-2 bg-[#3B6FE8] rounded-full shadow-[0_0_10px_rgba(59,111,232,0.5)]"></div>
          <div className="flex-1 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-[#3B6FE8]">directions_bus</span>
                  <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#3B6FE8]">Transport</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-white">Volvo Semi-Sleeper</h3>
                <p className="text-sm text-white/60 font-medium">New Delhi → Destination</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#EAED41] font-technical">21:30</p>
                <p className="text-xs text-white/50 font-technical">Oct 12</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-base">swap_horiz</span> Swap/Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Item: Hotel */}
      <div className="relative mb-8 group">
        <div className="absolute -left-[28px] top-6 w-5 h-5 rounded-full bg-[#D30C5C] border-4 border-[#0a1422] z-10 shadow-[0_0_15px_rgba(211,12,92,0.5)]"></div>
        <div className="bg-[#16202f] rounded-2xl p-6 flex gap-6 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 hover:border-white/20">
          <div className="w-2 bg-[#D30C5C] rounded-full shadow-[0_0_10px_rgba(211,12,92,0.5)]"></div>
          <div className="flex-1 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-[#D30C5C]">bed</span>
                  <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#D30C5C]">Stay</span>
                </div>
                <h3 className="text-xl font-headline font-bold">The Himalayan Retreat</h3>
                <p className="text-sm text-white/60 font-medium">Riverside Location</p>
              </div>
              <div className="text-right">
                <p className="font-bold font-technical">Check-in</p>
                <p className="text-xs text-white/50 font-technical">Oct 13, 11:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Item: Trek */}
      <div className="relative mb-8 group">
        <div className="absolute -left-[28px] top-6 w-5 h-5 rounded-full bg-[#B4D104] border-4 border-[#0a1422] z-10 shadow-[0_0_15px_rgba(180,209,4,0.3)]"></div>
        <div className="bg-[#16202f] rounded-2xl p-6 flex gap-6 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 hover:border-white/20">
          <div className="w-2 bg-[#B4D104] rounded-full"></div>
          <div className="flex-1 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-[#B4D104]">hiking</span>
                  <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#B4D104]">Adventure</span>
                </div>
                <h3 className="text-xl font-headline font-bold">Basecamp Trek</h3>
                <p className="text-sm text-white/60 font-medium">Valley to Summit</p>
              </div>
              <div className="text-right">
                <p className="font-bold font-technical text-[#EAED41]">06:00</p>
                <p className="text-xs text-white/50 font-technical">Oct 15</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
