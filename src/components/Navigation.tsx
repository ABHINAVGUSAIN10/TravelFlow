import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] z-50 glass-nav rounded-full px-8 py-3 flex items-center justify-between shadow-2xl shadow-[#D30C5C]/10 border border-white/10">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#EAED41] drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
        <Link href="/" className="font-headline font-black text-xl tracking-tight text-white drop-shadow-sm">TravelFlow</Link>
      </div>
      <div className="hidden md:flex items-center gap-10">
        <Link href="/destinations" className="text-sm font-medium text-white/90 hover:text-[#EAED41] transition-colors drop-shadow-sm">Destinations</Link>
        <Link href="/experiences" className="text-sm font-medium text-white/90 hover:text-[#EAED41] transition-colors drop-shadow-sm">Experiences</Link>
        <Link href="/journal" className="text-sm font-medium text-white/90 hover:text-[#EAED41] transition-colors drop-shadow-sm">Journal</Link>
        <Link href="/about" className="text-sm font-medium text-white/90 hover:text-[#EAED41] transition-colors drop-shadow-sm">About</Link>
      </div>
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-white/80 hover:text-[#EAED41] transition-colors">account_circle</button>
        <button className="material-symbols-outlined text-white/80 hover:text-[#EAED41] transition-colors">menu</button>
      </div>
    </nav>
  );
}
