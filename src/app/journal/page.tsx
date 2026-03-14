import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { JOURNAL_POSTS } from "@/lib/data";

export default function Journal() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#0a1422]">
        {/* Soft atmospheric gradient */}
        <div className="absolute top-0 right-0 w-[60vw] h-[40vh] bg-gradient-to-bl from-[#D30C5C]/5 to-transparent blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[60vw] h-[40vh] bg-gradient-to-tr from-[#0EBCDC]/5 to-transparent blur-3xl rounded-full"></div>
      </div>
      
      <Navigation />

      <main className="relative z-10 px-[8%] pt-36 pb-24 max-w-7xl mx-auto">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 w-max px-4 py-1.5 rounded-full border border-white/20 mb-6 bg-[#050e1c]/80 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[#EAED41] text-sm">auto_stories</span>
                <span className="font-technical text-white/90 text-xs tracking-widest uppercase font-semibold">Traveler's Log</span>
            </div>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter text-white">
              The Journal
            </h1>
            <p className="text-white/60 text-xl font-medium mt-6">
              Stories from the road. Dive deep into cinematic travel narratives, photography essays, and cultural deep-dives.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button className="text-white/80 hover:text-white pb-1 border-b-2 border-[#D30C5C] font-headline font-semibold transition-colors">Latest</button>
            <button className="text-white/50 hover:text-white pb-1 border-b-2 border-transparent hover:border-white/30 font-headline font-semibold transition-colors">Adventure</button>
            <button className="text-white/50 hover:text-white pb-1 border-b-2 border-transparent hover:border-white/30 font-headline font-semibold transition-colors">Culture</button>
          </div>
        </header>

        <div className="flex flex-col gap-12">
          {/* Featured Post (First one) */}
          <Link href={`/journal/${JOURNAL_POSTS[0].id}`} className="group block cursor-pointer grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center bg-white/[0.02] p-6 lg:p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.04] transition-colors rounded-tr-none">
            <div className="relative h-[24rem] lg:h-[32rem] rounded-[2rem] overflow-hidden rounded-tr-none border border-white/10">
              <Image 
                src={JOURNAL_POSTS[0].image}
                alt={JOURNAL_POSTS[0].title}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-transparent to-transparent opacity-60"></div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <span className={`font-technical text-xs uppercase tracking-widest font-bold ${JOURNAL_POSTS[0].accent}`}>
                  {JOURNAL_POSTS[0].category}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="font-technical text-xs text-white/50">{JOURNAL_POSTS[0].readTime}</span>
              </div>
              
              <h2 className="font-headline font-bold text-4xl lg:text-5xl text-white tracking-tight mb-6 group-hover:text-[#EAED41] transition-colors">
                {JOURNAL_POSTS[0].title}
              </h2>
              
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                {JOURNAL_POSTS[0].excerpt}
              </p>
              
              <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/60 text-sm">person</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{JOURNAL_POSTS[0].author}</h4>
                    <span className="text-xs text-white/50">{JOURNAL_POSTS[0].date}</span>
                  </div>
                </div>
                
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#B4D104] group-hover:text-[#1F2400] transition-colors text-white">
                  <span className="material-symbols-outlined transform -rotate-45 group-hover:rotate-0 transition-transform">arrow_forward</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {JOURNAL_POSTS.slice(1).map((post) => (
              <Link href={`/journal/${post.id}`} key={post.id} className="group cursor-pointer flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-colors block">
                <div className="relative h-64 overflow-hidden border-b border-white/5">
                  <Image 
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`bg-black/60 backdrop-blur-md px-3 py-1 rounded-full font-technical text-[10px] uppercase tracking-widest font-bold ${post.accent}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-headline font-bold text-2xl text-white tracking-tight mb-4 group-hover:text-[#0EBCDC] transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/60 text-base leading-relaxed mb-8 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <h4 className="text-sm font-bold text-white/90">{post.author}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-xs text-white/40">{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
