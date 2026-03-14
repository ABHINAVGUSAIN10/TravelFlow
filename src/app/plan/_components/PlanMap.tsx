export default function PlanMap() {
  return (
    <section className="hidden lg:block w-1/2 relative bg-[#121c2a] overflow-hidden">
      {/* Map Background */}
      <div 
        className="absolute inset-0 grayscale contrast-125 opacity-40 mix-blend-luminosity" 
        style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
        }}
      ></div>
      <div className="absolute inset-0 bg-[#050e1c]/60"></div>
      
      {/* SVG Route Mapping Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_10px_rgba(59,111,232,0.5)]" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
        <path className="opacity-80 drop-shadow-lg" d="M100 800 L350 550 L500 400 L650 150" fill="none" stroke="#3b6fe8" strokeDasharray="12 8" strokeWidth="4"></path>
        
        {/* Nav nodes mapped to points on the path */}
        <g transform="translate(100, 800)">
          <circle fill="#3b6fe8" r="24" className="shadow-lg"></circle>
          <text fill="white" fontFamily="Material Symbols Outlined" fontSize="24" x="-12" y="8">directions_bus</text>
          <rect fill="rgba(5, 14, 28, 0.8)" height="30" rx="15" width="100" x="35" y="-15" stroke="rgba(255,255,255,0.2)"></rect>
          <text fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace" x="45" y="5">Delhi ISBT</text>
        </g>
        
        <g transform="translate(350, 550)">
          <circle fill="#D30C5C" r="24"></circle>
          <text fill="white" fontFamily="Material Symbols Outlined" fontSize="24" x="-12" y="8">bed</text>
          <rect fill="rgba(5, 14, 28, 0.8)" height="30" rx="15" width="120" x="35" y="-15" stroke="rgba(255,255,255,0.2)"></rect>
          <text fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace" x="45" y="5">Hotel Retreat</text>
        </g>
        
        <g transform="translate(650, 150)">
          <circle fill="#B4D104" r="24"></circle>
          <text fill="white" fontFamily="Material Symbols Outlined" fontSize="24" x="-12" y="8">hiking</text>
          <rect fill="rgba(5, 14, 28, 0.8)" height="30" rx="15" width="110" x="-135" y="-15" stroke="rgba(255,255,255,0.2)"></rect>
          <text fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace" x="-125" y="5">Beas Summit</text>
        </g>
      </svg>
      
      {/* Map Floating Controls */}
      <div className="absolute top-8 right-8 flex flex-col gap-4">
        <div className="glass-nav border border-white/20 p-2 rounded-2xl flex flex-col gap-2">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-white">add</span>
          </button>
          <div className="h-px bg-white/10 mx-2"></div>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-white">remove</span>
          </button>
        </div>
        <button className="glass-nav border border-white/20 w-14 h-14 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg">
          <span className="material-symbols-outlined text-white">layers</span>
        </button>
      </div>
      
      <div className="absolute bottom-10 left-10">
        <div className="glass-nav border border-white/20 p-5 rounded-3xl max-w-sm shadow-2xl backdrop-blur-2xl">
          <p className="font-technical text-[10px] uppercase tracking-widest font-bold text-[#3B6FE8] mb-3">Live Tracking</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-white/20">
              <span className="material-symbols-outlined text-2xl text-white">directions_bus</span>
            </div>
            <div>
              <p className="font-headline font-bold text-white text-lg">En Route to Destination</p>
              <p className="text-white/60 font-medium text-sm mt-1">Arrival estimated 08:30 AM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
