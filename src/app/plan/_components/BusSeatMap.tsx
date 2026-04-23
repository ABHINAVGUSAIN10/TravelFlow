"use client";

import { useState, useMemo, useEffect } from "react";

interface Props {
  basePriceStr: string;
  location: string;
  onSeatSelect: (priceModifier: number) => void;
}

export default function BusSeatMap({ basePriceStr, location, onSeatSelect }: Props) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const basePriceNum = parseInt(basePriceStr.replace(/[^\d]/g, ""), 10) || 0;

  // Calculate specific price for a seat
  const getSeatPrice = (row: number, col: string) => {
    let modifier = 0;
    // Window seats (A and D in normal rows, A and E in back row)
    if (col === 'A' || col === 'D' || (row === 7 && col === 'E')) {
      modifier += 100;
    }
    // Middle rows (rows 2 to 6)
    if (row > 1 && row < 7) {
      modifier += 50;
    }
    return basePriceNum + modifier;
  };

  // Generate static scenario deterministically
  const seatStatuses = useMemo(() => {
    const hash = Array.from(location).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const scenarioIdx = hash % 5;
    
    const statuses: Record<string, 'available' | 'sold' | 'ladies'> = {};
    for (let r = 1; r <= 7; r++) {
      const cols = r === 7 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
      cols.forEach(c => {
        statuses[`R${r}-${c}`] = 'available';
      });
    }

    if (scenarioIdx === 0) {
      statuses['R1-A'] = 'sold'; statuses['R1-B'] = 'sold'; 
      statuses['R2-A'] = 'ladies'; statuses['R2-B'] = 'ladies';
      statuses['R7-A'] = 'sold'; statuses['R7-B'] = 'sold'; statuses['R7-C'] = 'sold';
    } else if (scenarioIdx === 1) {
      statuses['R3-C'] = 'ladies'; statuses['R3-D'] = 'ladies';
      statuses['R5-A'] = 'sold'; statuses['R6-A'] = 'sold';
      statuses['R1-C'] = 'sold'; statuses['R1-D'] = 'sold';
    } else if (scenarioIdx === 2) {
      // Mostly empty
      statuses['R1-A'] = 'sold';
      statuses['R4-C'] = 'ladies';
    } else if (scenarioIdx === 3) {
      // Mostly full
      for (let r = 2; r <= 6; r++) {
        statuses[`R${r}-A`] = 'sold'; statuses[`R${r}-D`] = 'sold';
      }
      statuses['R1-A'] = 'ladies'; statuses['R1-B'] = 'ladies';
    } else {
      statuses['R2-C'] = 'sold'; statuses['R2-D'] = 'sold';
      statuses['R4-A'] = 'ladies'; statuses['R4-B'] = 'ladies';
      statuses['R7-E'] = 'sold';
    }
    return statuses;
  }, [location]);

  const handleSelect = (id: string, status: string, price: number) => {
    if (status === 'sold') return;
    
    let newSelected: string[];
    if (selectedSeats.includes(id)) {
      newSelected = selectedSeats.filter(s => s !== id);
    } else {
      newSelected = [...selectedSeats, id];
    }
    setSelectedSeats(newSelected);
    
    if (newSelected.length === 0) {
      onSeatSelect(0);
    } else {
      const totalSeatCost = newSelected.reduce((sum, seatId) => {
        const [rStr, col] = seatId.split('-');
        const row = parseInt(rStr.replace('R', ''), 10);
        return sum + getSeatPrice(row, col);
      }, 0);
      onSeatSelect(totalSeatCost - basePriceNum);
    }
  };

  // Run once to ensure if there's no selection, modifier is 0
  useEffect(() => {
    onSeatSelect(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#050e1c] rounded-2xl p-6 flex flex-col items-center border border-white/10 w-full max-w-sm mx-auto">
      <div className="flex justify-between w-full mb-6 items-center px-4">
         <span className="text-white/50 text-xs font-technical uppercase">Bus Front</span>
         <span className="material-symbols-outlined text-white/30 text-3xl">directions_steering</span>
      </div>

      <div className="flex flex-col gap-4 bg-white/[0.02] p-4 rounded-3xl border border-white/5 w-full">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((row) => {
          const isLast = row === 7;
          return (
            <div key={row} className={`flex justify-between items-center ${isLast ? 'gap-2' : 'gap-6'}`}>
              {/* Left Side (A, B) */}
              <div className="flex gap-2">
                {['A', 'B'].map((col) => {
                  const id = `R${row}-${col}`;
                  const status = seatStatuses[id];
                  const price = getSeatPrice(row, col);
                  const isSelected = selectedSeats.includes(id);
                  return (
                    <SeatIcon 
                      key={id} id={id} status={status} price={price} 
                      isSelected={isSelected} onClick={() => handleSelect(id, status, price)} 
                    />
                  );
                })}
              </div>

              {/* Aisle or Middle Seat */}
              {isLast ? (
                <div className="flex justify-center">
                  <SeatIcon 
                    id={`R7-C`} status={seatStatuses['R7-C']} price={getSeatPrice(7, 'C')} 
                    isSelected={selectedSeats.includes('R7-C')} onClick={() => handleSelect('R7-C', seatStatuses['R7-C'], getSeatPrice(7, 'C'))} 
                  />
                </div>
              ) : (
                <div className="w-8 flex justify-center text-white/10 text-[10px] font-technical">Aisle</div>
              )}

              {/* Right Side (C, D or D, E for last row) */}
              <div className="flex gap-2">
                {(isLast ? ['D', 'E'] : ['C', 'D']).map((col) => {
                  const id = `R${row}-${col}`;
                  const status = seatStatuses[id];
                  const price = getSeatPrice(row, col);
                  const isSelected = selectedSeats.includes(id);
                  return (
                    <SeatIcon 
                      key={id} id={id} status={status} price={price} 
                      isSelected={isSelected} onClick={() => handleSelect(id, status, price)} 
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-6 w-full text-[10px] font-technical uppercase tracking-widest text-white/50">
        <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-green-500 rounded flex items-center justify-center bg-green-500/10" /> Available</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#3B6FE8] rounded flex items-center justify-center bg-[#3B6FE8]/20" /> Selected</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#DF33DF] rounded flex items-center justify-center bg-[#DF33DF]/10" /> Ladies</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white/20 rounded border-2 border-transparent" /> Sold</div>
      </div>
    </div>
  );
}

function SeatIcon({ id, status, price, isSelected, onClick }: { id: string, status: string, price: number, isSelected: boolean, onClick: () => void }) {
  let styleClass = "border-green-500 text-green-500 bg-green-500/10 hover:bg-green-500/20";
  if (isSelected) styleClass = "border-[#3B6FE8] text-[#3B6FE8] bg-[#3B6FE8]/20 ring-2 ring-[#3B6FE8]/50 scale-110";
  else if (status === 'sold') styleClass = "border-transparent bg-white/10 text-white/20 opacity-50 cursor-not-allowed";
  else if (status === 'ladies') styleClass = "border-[#DF33DF] text-[#DF33DF] bg-[#DF33DF]/10 hover:bg-[#DF33DF]/20";

  return (
    <div className="flex flex-col items-center gap-1">
      <button 
        onClick={onClick}
        className={`w-10 h-10 rounded-md border-2 transition-all flex flex-col items-center justify-center relative group ${styleClass}`}
      >
        <span className="material-symbols-outlined text-lg">event_seat</span>
        {status === 'ladies' && !isSelected && <span className="material-symbols-outlined absolute text-[10px] bottom-0.5 right-0.5 text-[#DF33DF]">female</span>}
        {isSelected && <span className="material-symbols-outlined absolute text-[12px] bottom-0.5 right-0.5 text-[#3B6FE8]">check</span>}
      </button>
      <span className="text-[9px] font-technical text-white/50">{status === 'sold' ? 'SOLD' : `₹${price}`}</span>
    </div>
  );
}
