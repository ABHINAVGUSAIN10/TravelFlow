import { JOURNAL_POSTS } from "@/lib/data";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return JOURNAL_POSTS.map((post) => ({
    id: post.id.toString(),
  }));
}

export default function JournalDetail({ params }: { params: { id: string } }) {
  const post = JOURNAL_POSTS.find(p => p.id.toString() === params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-[#050e1c] min-h-screen text-white font-body pb-32">
      <Navigation />
      
      {/* Hero Header */}
      <header className="px-[8%] pt-36 pb-16 max-w-5xl mx-auto text-center border-b border-white/10">
         <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`font-technical text-xs uppercase tracking-widest font-bold ${post.accent} bg-white/5 border border-white/10 px-4 py-1.5 rounded-full`}>
               {post.category}
            </span>
            <span className="text-white/50 text-sm font-technical">{post.readTime}</span>
            <span className="text-white/50 text-sm font-technical">•</span>
            <span className="text-white/50 text-sm font-technical">{post.date}</span>
         </div>
         
         <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter leading-tight mb-8">
            {post.title}
         </h1>
         
         <p className="text-xl md:text-2xl text-white/70 font-medium max-w-3xl mx-auto leading-relaxed">
            {post.excerpt}
         </p>
         
         <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
               <span className="material-symbols-outlined text-white/60">person</span>
            </div>
            <div className="text-left">
               <p className="font-bold text-lg">{post.author}</p>
               <p className="text-white/50 text-sm font-technical uppercase tracking-wider">TravelFlow Contributor</p>
            </div>
         </div>
      </header>
      
      {/* Hero Image */}
      <div className="w-full max-w-6xl mx-auto mt-16 px-[4%] relative h-[60vh] md:h-[70vh]">
         <div className="relative w-full h-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <Image 
               src={post.image}
               alt={post.title}
               fill
               className="object-cover"
               priority
            />
            {/* Soft vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,14,28,0.6)_100%)]"></div>
         </div>
      </div>
      
      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-6 mt-20">
         <div className="prose prose-invert prose-lg prose-p:text-white/80 prose-p:font-medium prose-p:leading-relaxed prose-a:text-[#0EBCDC] font-body text-xl space-y-8">
            <p className="first-letter:text-6xl first-letter:font-headline first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:text-[#EAED41]">
               {post.content}
            </p>
            <p>
               There's an undeniable allure to places that demand effort to reach. We spent the better part of three weeks preparing for what would become one of the most transformative experiences of our lives. The logistics alone felt like preparing for a lunar mission, but the reality on the ground was far more unpredictable.
            </p>
            
            <blockquote className="border-l-4 border-[#0EBCDC] pl-6 my-12 italic text-2xl text-white/90 font-headline font-bold">
               "To awaken entirely alone in a strange town is one of the pleasantest sensations in the world."
            </blockquote>
            
            <p>
               Locals welcomed us with an astonishing warmth that completely contrasted the biting cold outside. Every evening, stories were shared over steaming cups of local brew, bridging the gap between our completely different worlds. It's in these quiet, unscripted moments that the true cinematic nature of travel reveals itself.
            </p>
         </div>
         
         {/* Call to action */}
         <div className="mt-20 pt-10 border-t border-white/10 text-center">
            <p className="text-white/60 mb-6 font-medium">Inspired by this journey?</p>
            <Link 
               href="/plan"
               className="inline-flex items-center gap-3 bg-white text-[#050e1c] px-10 py-4 rounded-full font-headline font-bold hover:bg-gray-200 transition-colors shadow-xl"
            >
               Design a similar itinerary <span className="material-symbols-outlined">explore</span>
            </Link>
         </div>
      </article>

    </div>
  );
}
