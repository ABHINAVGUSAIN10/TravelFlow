interface SidebarProps {
  activeTab: 'timeline' | 'hotels' | 'vehicles' | 'guides';
  setActiveTab: (tab: 'timeline' | 'hotels' | 'vehicles' | 'guides') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const activeColor = "text-[#3B6FE8]";
  const inactiveColor = "text-white/60 hover:text-white transition-colors cursor-pointer";

  return (
    <aside className="w-20 hidden lg:flex flex-col items-center py-8 bg-[#101c2e]/50 border-r border-white/10 shrink-0">
      <div className="flex flex-col gap-10 items-center">
        <div className="w-10 h-10 rounded-xl bg-[#3B6FE8] flex items-center justify-center shadow-lg shadow-[#3B6FE8]/20">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>mountain_flag</span>
        </div>
        <div className="flex flex-col gap-8 text-white/50">
          <button onClick={() => setActiveTab('timeline')} className={activeTab === 'timeline' ? activeColor : inactiveColor} title="Timeline">
            <span className="material-symbols-outlined" style={activeTab === 'timeline' ? { fontVariationSettings: "'FILL' 1" } : {}}>timeline</span>
          </button>
          <button onClick={() => setActiveTab('hotels')} className={activeTab === 'hotels' ? activeColor : inactiveColor} title="Hotels & Stays">
            <span className="material-symbols-outlined" style={activeTab === 'hotels' ? { fontVariationSettings: "'FILL' 1" } : {}}>bed</span>
          </button>
          <button onClick={() => setActiveTab('vehicles')} className={activeTab === 'vehicles' ? activeColor : inactiveColor} title="Transport">
            <span className="material-symbols-outlined" style={activeTab === 'vehicles' ? { fontVariationSettings: "'FILL' 1" } : {}}>directions_bus</span>
          </button>
          <button onClick={() => setActiveTab('guides')} className={activeTab === 'guides' ? activeColor : inactiveColor} title="Tour Guides">
            <span className="material-symbols-outlined" style={activeTab === 'guides' ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
