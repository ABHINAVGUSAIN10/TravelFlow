import { DESTINATIONS } from "@/lib/data";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Required for static site generation with dynamic routes
export function generateStaticParams() {
  return DESTINATIONS.map((dest) => ({
    id: dest.id.toString(),
  }));
}

export default function DestinationDetail({ params }: { params: { id: string } }) {
  const destination = DESTINATIONS.find(d => d.id.toString() === params.id);

  if (!destination) {
    notFound();
  }

  return (
    <div className="bg-[#050e1c] min-h-screen text-white font-body">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full flex items-end pb-20 justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={destination.image}
            alt={destination.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-t mix-blend-multiply opacity-80 ${destination.gradient}`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-[#050e1c]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex gap-3 mb-6">
            {destination.tags.map(tag => (
              <span key={tag} className="font-technical text-xs uppercase tracking-widest text-white/90 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black tracking-tighter mb-4 drop-shadow-2xl">
            {destination.title.split(',')[0]}
          </h1>
          <p className="text-2xl text-white/80 font-medium font-headline">
            {destination.subtitle}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-[#EAED41]">menu_book</span>
              The Cinematic Story
            </h2>
            <p className="text-xl text-white/70 leading-relaxed font-medium">
              {destination.description}
            </p>
            
            <div className="mt-12">
               <h3 className="text-2xl font-headline font-bold mb-6">Top Highlights</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {destination.highlights.map((h, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                       <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-technical font-bold text-sm text-[#EAED41] shrink-0 border border-white/20">{i+1}</span>
                       <span className="font-medium text-white/90">{h}</span>
                    </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="sticky top-32 glass-nav border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D30C5C] to-[#DF33DF] flex items-center justify-center shadow-lg shadow-[#D30C5C]/20 mb-2">
                   <span className="material-symbols-outlined text-white text-3xl">flight_takeoff</span>
                </div>
                <h3 className="font-headline font-bold text-2xl">Ready to action?</h3>
                <p className="text-white/60 text-sm">Design your perfect timeline in our itinerary command center.</p>
                <Link 
                  href={`/plan?dest=${destination.title}`}
                  className="w-full mt-4 bg-white text-[#050e1c] py-4 rounded-xl font-bold font-headline text-center hover:bg-gray-200 transition-colors shadow-lg"
                >
                   Plan Your Itinerary
                </Link>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
