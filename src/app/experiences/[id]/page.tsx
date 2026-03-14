import { EXPERIENCES } from "@/lib/data";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return EXPERIENCES.map((exp) => ({
    id: exp.id.toString(),
  }));
}

export default function ExperienceDetail({ params }: { params: { id: string } }) {
  const experience = EXPERIENCES.find(e => e.id.toString() === params.id);

  if (!experience) {
    notFound();
  }

  return (
    <div className="bg-[#050e1c] min-h-screen text-white font-body">
      <Navigation />
      
      {/* Split Hero View */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-[8%] py-32 relative z-10 lg:sticky lg:top-0 lg:h-screen">
          <div className="space-y-8 max-w-xl">
             <div className="flex items-center gap-3 w-max px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[#EAED41] text-sm">local_activity</span>
                <span className={`font-technical text-white/90 text-[10px] tracking-widest uppercase font-bold`}>{experience.category}</span>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter leading-tight drop-shadow-xl">
               {experience.title}
             </h1>

             <div className="flex flex-wrap items-center gap-6 mt-6 pb-8 border-b border-white/10">
               <div className="flex items-center gap-2 text-white/70">
                 <span className="material-symbols-outlined text-[#EAED41]">location_on</span>
                 <span className="font-medium text-lg">{experience.location}</span>
               </div>
               <div className="flex items-center gap-2 text-white/70">
                 <span className="material-symbols-outlined text-[#0EBCDC]">schedule</span>
                 <span className="font-medium text-lg">{experience.duration}</span>
               </div>
               <div className="flex items-center gap-2 text-[#EAED41] bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                 <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                 <span className="font-technical font-bold text-lg">{experience.rating} / 5.0</span>
               </div>
             </div>

             <div className="space-y-6 pt-4">
               <h3 className="text-2xl font-headline font-bold">The Experience</h3>
               <p className="text-lg text-white/60 leading-relaxed font-medium">
                 {experience.description}
               </p>
             </div>

             <div className="space-y-4 pt-4">
               <h3 className="text-sm font-technical font-bold text-white/50 uppercase tracking-widest">What's Included</h3>
               <ul className="space-y-3">
                 {experience.included.map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-white/80">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${experience.accent}`}>
                         <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                      </div>
                      <span className="font-medium">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>

             <div className="pt-10">
                <Link 
                  href={`/plan?dest=${experience.location}`}
                  className={`${experience.accent} w-full text-white py-5 rounded-full font-bold font-headline text-lg hover:opacity-90 transition-opacity shadow-xl shadow-[${experience.accent}]/20 flex items-center justify-center gap-2`}
                >
                   Plan Your Itinerary <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
             </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-screen">
          <Image 
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050e1c] via-[#050e1c]/40 to-transparent lg:hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-[#050e1c] via-[#050e1c]/10 to-transparent hidden lg:block opacity-60"></div>
        </div>

      </div>
    </div>
  );
}
