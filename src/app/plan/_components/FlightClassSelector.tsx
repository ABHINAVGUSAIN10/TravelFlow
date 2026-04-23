"use client";

import { useState, useEffect } from "react";

interface Props {
  basePriceStr: string;
  onClassSelect: (priceModifier: number) => void;
}

const CLASSES = [
  {
    id: "economy",
    name: "Economy",
    icon: "airline_seat_recline_normal",
    multiplier: 1,
    color: "#0DF5E3",
    features: ["Standard Legroom", "Complimentary Snacks", "1 Cabin Bag"],
  },
  {
    id: "business",
    name: "Business",
    icon: "airline_seat_recline_extra",
    multiplier: 2.5,
    color: "#DF33DF",
    features: ["Extra Legroom", "Lounge Access", "Priority Boarding", "Premium Meals"],
  },
  {
    id: "first",
    name: "First Class",
    icon: "airline_seat_flat",
    multiplier: 4.0,
    color: "#EAED41",
    features: ["Flat Bed Suite", "Exclusive Lounge", "Gourmet Dining", "Personal Attendant"],
  },
];

const WINDOW_SURCHARGE = 1500;

export default function FlightClassSelector({ basePriceStr, onClassSelect }: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("economy");
  const [wantsWindow, setWantsWindow] = useState<boolean>(false);

  const basePriceNum = parseInt(basePriceStr.replace(/[^\d]/g, ""), 10) || 0;

  useEffect(() => {
    const cls = CLASSES.find(c => c.id === selectedClass) || CLASSES[0];
    const classPrice = basePriceNum * cls.multiplier;
    const windowCost = wantsWindow ? WINDOW_SURCHARGE : 0;
    const finalPrice = classPrice + windowCost;
    
    // We emit the difference from the original base price
    onClassSelect(finalPrice - basePriceNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, wantsWindow]);

  return (
    <div className="flex flex-col gap-5 w-full mt-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-white/50 text-sm">flight_class</span>
        <h4 className="text-sm font-technical uppercase tracking-widest text-white/80">Select Cabin Class</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CLASSES.map((cls) => {
          const isSelected = selectedClass === cls.id;
          const price = basePriceNum * cls.multiplier;
          
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`relative cursor-pointer rounded-2xl border transition-all duration-300 p-5 flex flex-col gap-4 overflow-hidden group ${
                isSelected
                  ? "bg-white/[0.05] shadow-2xl scale-[1.02]"
                  : "bg-[#050e1c] hover:bg-[#081525] border-white/5 hover:border-white/20"
              }`}
              style={{
                borderColor: isSelected ? cls.color : undefined,
                boxShadow: isSelected ? `0 10px 30px -10px ${cls.color}40` : undefined,
              }}
            >
              {/* Background gradient for selected */}
              {isSelected && (
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${cls.color}, transparent)` }}
                />
              )}

              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 z-10">
                  <span className="material-symbols-outlined text-3xl" style={{ color: cls.color }}>
                    {cls.icon}
                  </span>
                  <span className="font-headline font-bold text-lg">{cls.name}</span>
                </div>
                <div className="text-right z-10">
                  <span className="text-xs text-white/40 font-technical uppercase">Price</span>
                  <div className="font-headline font-bold text-xl">₹{price.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2 mt-2 z-10">
                {cls.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: cls.color }}>check</span>
                    {feat}
                  </div>
                ))}
              </div>

              {/* Selected indicator */}
              <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? "border-transparent bg-white/10 scale-100" : "border-white/10 scale-0"
              }`}>
                {isSelected && <span className="material-symbols-outlined text-sm" style={{ color: cls.color }}>check</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Window Seat Option */}
      <div 
        onClick={() => setWantsWindow(!wantsWindow)}
        className={`mt-2 flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
          wantsWindow ? 'bg-[#3B6FE8]/10 border-[#3B6FE8]/50' : 'bg-[#050e1c] border-white/5 hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wantsWindow ? 'bg-[#3B6FE8]/20 text-[#3B6FE8]' : 'bg-white/5 text-white/40'}`}>
            <span className="material-symbols-outlined">airline_seat_flat_angled</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-sm">Window Seat Preference</span>
            <span className="font-technical text-[10px] uppercase text-white/50 tracking-wider">Enjoy the view from the window</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col">
            <span className="text-xs text-white/40 font-technical uppercase">Surcharge</span>
            <span className="font-headline font-bold text-[#3B6FE8]">+₹{WINDOW_SURCHARGE.toLocaleString('en-IN')}</span>
          </div>
          {/* Toggle */}
          <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${wantsWindow ? 'bg-[#3B6FE8]' : 'bg-white/10'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${wantsWindow ? 'left-7' : 'left-1'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
