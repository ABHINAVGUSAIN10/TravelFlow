import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { EXPERIENCES } from "@/lib/data";

export default function Experiences() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-black">
        {/* Deep, rich dark background pattern */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>
      
      <Navigation />

      <main className="relative z-10 min-h-screen px-[8%] pt-36 pb-24">
        <header className="mb-16 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 bg-white/5 w-max px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 mb-6 mx-auto">
             <span className="material-symbols-outlined text-[#0EBCDC] text-sm">local_activity</span>
             <span className="font-technical text-white text-xs tracking-widest uppercase font-semibold">Curated Experiences</span>
          </div>
          <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter text-white mb-6">
            Moments That<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D30C5C] via-[#0EBCDC] to-[#EAED41]">Last A Lifetime</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl font-medium">
            Dive into handpicked activities around the globe. Whether seeking adrenaline or a touch of culture, our experiences add cinematic depth to your journey.
          </p>
        </header>

        {/* Masonry-style layout simulation with Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {EXPERIENCES.map((exp, index) => {
            // Mix up spans for a masonry feel
            const colSpan = index === 0 ? "lg:col-span-8" : 
                            index === 1 ? "lg:col-span-4" : 
                            index === 2 ? "lg:col-span-4" :
                            index === 3 ? "lg:col-span-4" : "lg:col-span-4";
            
            const height = index === 0 ? "h-[32rem]" : "h-[24rem]";

            return (
              <Link href={`/experiences/${exp.id}`} key={exp.id} className={`block cursor-pointer ${colSpan} ${height} group relative rounded-3xl overflow-hidden glass-nav border border-white/10 hover:border-[#EAED41]/50 transition-colors`}>
                <Image 
                  src={exp.image}
                  alt={exp.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className={`font-technical text-[10px] uppercase font-bold tracking-widest text-[#1F2400] px-3 py-1.5 rounded-full ${exp.accent}`}>
                      {exp.category}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-900/40 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <span className="material-symbols-outlined text-[#EAED41] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-technical text-sm text-white font-bold">{exp.rating}</span>
                    </div>
                  </div>

                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-headline font-bold text-2xl lg:text-3xl text-white mb-3 tracking-tight">{exp.title}</h3>
                    
                    <div className="flex items-center gap-6 text-white/70 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="text-sm">{exp.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="text-sm">{exp.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
