import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/data";

export default function Destinations() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#050e1c]">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vh] bg-[#D30C5C] blur-[150px] opacity-10 rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vh] bg-[#0EBCDC] blur-[120px] opacity-10 rounded-full mix-blend-screen"></div>
      </div>
      
      <Navigation />

      <main className="relative z-10 min-h-screen px-[8%] pt-36 pb-24">
        <header className="mb-16">
          <div className="flex items-center gap-3 bg-white/5 w-max px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EAED41] animate-pulse"></span>
            <span className="font-technical text-white text-xs tracking-widest uppercase font-semibold">Curated Locations</span>
          </div>
          <h1 className="font-headline font-black text-6xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 drop-shadow-xl inline-block">
            Our Destinations
          </h1>
          <p className="text-white/60 text-lg mt-4 max-w-2xl font-medium">
            Discover places where breathtaking landscapes meet vibrant cultures. Every destination is a new cinematic masterpiece waiting to be explored.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest) => (
            <Link 
              href={`/destinations/${dest.id}`}
              key={dest.id} 
              className="group relative block h-[28rem] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_20px_50px_-15px_rgba(211,12,92,0.3)] transition-all duration-500 hover:-translate-y-2 border border-white/10"
            >
              <Image 
                src={dest.image}
                alt={dest.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Dynamic Color Blend Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-b ${dest.gradient} mix-blend-color opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex gap-2 mb-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                  {dest.tags.map(tag => (
                    <span key={tag} className="font-technical text-[10px] uppercase tracking-wider text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-headline font-bold text-3xl text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{dest.title}</h3>
                <p className="font-medium text-white/70 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#EAED41]">location_on</span>
                  {dest.subtitle}
                </p>
                
                {/* Hover indicator */}
                <div className="absolute right-8 bottom-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-sm">
                   <span className="material-symbols-outlined text-white">north_east</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
