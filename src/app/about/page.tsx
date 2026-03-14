import Navigation from "@/components/Navigation";
import Image from "next/image";

export default function About() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#0a1422]">
        <Image 
          src="https://images.unsplash.com/photo-1506905925-83e91122cf23?q=80&w=2070&auto=format&fit=crop"
          alt="Abstract Cinematic Landscape"
          fill
          className="object-cover opacity-20 mix-blend-luminosity"
        />
        {/* Deep, rich overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050e1c]/90 via-[#050e1c]/80 to-[#050e1c]"></div>
      </div>
      
      <Navigation />

      <main className="relative z-10 px-[8%] pt-40 pb-32 max-w-5xl mx-auto text-center flex flex-col items-center min-h-screen justify-center">
        
        <div className="flex items-center gap-3 bg-white/5 w-max px-4 py-1.5 rounded-full border border-[#EAED41]/30 mb-8 mx-auto shadow-[0_0_20px_rgba(234,237,65,0.1)]">
           <span className="w-2 h-2 rounded-full bg-[#EAED41] animate-pulse"></span>
           <span className="font-technical text-[#EAED41] text-xs tracking-widest uppercase font-semibold">Our Vision</span>
        </div>

        <h1 className="font-headline font-black text-6xl md:text-8xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/40 drop-shadow-2xl mb-8">
          We Frame The World.
        </h1>
        
        <p className="text-white/80 text-xl md:text-2xl leading-relaxed font-medium max-w-3xl mb-16">
          TravelFlow is a digital canvas for the modern explorer. We believe travel isn't just about moving from A to B—it's about the <span className="text-[#0EBCDC]">cinematic moments</span>, the <span className="text-[#D30C5C]">vibrant cultures</span>, and leaving with stories that outlast the jet lag.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Core Value 1 */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/[0.05] transition-colors text-left flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D30C5C] to-[#ED5A78] flex items-center justify-center mb-2 shadow-[0_10px_20px_rgba(211,12,92,0.3)]">
              <span className="material-symbols-outlined text-white">camera</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white">Cinematic Approach</h3>
            <p className="text-white/60 font-medium">Every journey we design is meant to feel like a high-production film, with you as the auteur.</p>
          </div>

          {/* Core Value 2 */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/[0.05] transition-colors text-left flex flex-col gap-4 translate-y-0 md:translate-y-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EBCDC] to-[#0591F9] flex items-center justify-center mb-2 shadow-[0_10px_20px_rgba(14,188,220,0.3)]">
              <span className="material-symbols-outlined text-white">explore</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white">Untamed Discovery</h3>
            <p className="text-white/60 font-medium">We bypass the tourist traps to find the deeply saturated experiences hidden off the beaten path.</p>
          </div>

          {/* Core Value 3 */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/[0.05] transition-colors text-left flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EAED41] to-[#B4D104] flex items-center justify-center mb-2 shadow-[0_10px_20px_rgba(234,237,65,0.3)]">
              <span className="material-symbols-outlined text-[#1F2400]">eco</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white">Mindful Travel</h3>
            <p className="text-white/60 font-medium">Leaving places better than we found them. Sustainability woven into our vivid itineraries.</p>
          </div>
        </div>

        <div className="mt-32 pt-16 border-t border-white/10 w-full flex flex-col items-center">
            <h2 className="font-headline text-4xl font-bold text-white mb-8">Ready to write your next chapter?</h2>
            <button className="bg-white text-[#050e1c] px-12 py-5 rounded-full font-headline font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl">
              Start Designing Your Trip
            </button>
        </div>

      </main>
    </>
  );
}
