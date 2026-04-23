"use client";

import { useState } from "react";

interface Props {
  destination: string;
  onConfirm: (startDate: Date, endDate: Date, travelers: number) => void;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function TripSetupModal({ destination, onConfirm }: Props) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [travelers, setTravelers] = useState(2);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Calendar helpers
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDateClick(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);
    clicked.setHours(0,0,0,0);
    if (clicked < today) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(clicked);
      setEndDate(null);
    } else {
      if (clicked < startDate) {
        setStartDate(clicked);
        setEndDate(null);
      } else {
        setEndDate(clicked);
      }
    }
  }

  function isInRange(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (startDate && endDate) return d >= startDate && d <= endDate;
    if (startDate && hoveredDate && !endDate) {
      const rangeEnd = hoveredDate >= startDate ? hoveredDate : startDate;
      const rangeStart = hoveredDate >= startDate ? startDate : hoveredDate;
      return d >= rangeStart && d <= rangeEnd;
    }
    return false;
  }

  function isStart(day: number) {
    if (!startDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d.getTime() === startDate.getTime();
  }
  function isEnd(day: number) {
    if (!endDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d.getTime() === endDate.getTime();
  }
  function isPast(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    return d < today;
  }

  const tripDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const formatDate = (d: Date) => `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`;

  const canConfirm = startDate && endDate && travelers >= 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-lg mx-4 rounded-[2.5rem] bg-[#0d1825] border border-white/10 shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D30C5C] to-[#DF33DF] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl">flight_takeoff</span>
            </div>
            <div>
              <h2 className="text-2xl font-headline font-black text-white">Plan Your Trip</h2>
              <p className="text-white/50 text-sm font-medium">to {destination}</p>
            </div>
          </div>
          <p className="text-white/30 text-xs font-technical uppercase tracking-widest mt-4">
            Select your travel dates and group size to get started
          </p>
        </div>

        {/* Calendar */}
        <div className="px-8 py-4">
          <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-white/60 text-sm">chevron_left</span>
              </button>
              <span className="font-headline font-bold text-white text-lg">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-white/60 text-sm">chevron_right</span>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-technical uppercase tracking-widest text-white/30 py-1">{d}</div>
              ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const past = isPast(day);
                const start = isStart(day);
                const end = isEnd(day);
                const inRange = isInRange(day);

                return (
                  <button
                    key={day}
                    disabled={past}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => !past && setHoveredDate(new Date(viewYear, viewMonth, day))}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`relative h-9 rounded-lg text-sm font-medium transition-all
                      ${past ? "text-white/15 cursor-not-allowed" : "cursor-pointer hover:bg-white/10"}
                      ${inRange && !start && !end ? "bg-[#D30C5C]/15 text-white" : ""}
                      ${start || end ? "bg-gradient-to-br from-[#D30C5C] to-[#DF33DF] text-white font-bold shadow-lg shadow-[#D30C5C]/30" : "text-white/70"}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Selected range display */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[9px] font-technical uppercase tracking-widest text-white/30">Start</p>
                  <p className="text-sm font-bold text-white">{startDate ? formatDate(startDate) : "—"}</p>
                </div>
                <span className="material-symbols-outlined text-white/20 text-sm">arrow_forward</span>
                <div>
                  <p className="text-[9px] font-technical uppercase tracking-widest text-white/30">End</p>
                  <p className="text-sm font-bold text-white">{endDate ? formatDate(endDate) : "—"}</p>
                </div>
              </div>
              {tripDays > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#D30C5C]/15 text-[#D30C5C] text-xs font-bold border border-[#D30C5C]/20">
                  {tripDays} {tripDays === 1 ? "Day" : "Days"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Travelers */}
        <div className="px-8 py-2">
          <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0DF5E3] text-xl">group</span>
              <div>
                <p className="font-headline font-bold text-white text-sm">Travelers</p>
                <p className="text-[10px] text-white/30 font-technical uppercase tracking-widest">How many people?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-lg">remove</span>
              </button>
              <span className="text-2xl font-headline font-black text-white w-8 text-center">{travelers}</span>
              <button
                onClick={() => setTravelers(Math.min(10, travelers + 1))}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-8 pt-4 pb-8">
          <button
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm(startDate!, endDate!, travelers)}
            className={`w-full py-4 rounded-2xl font-headline font-bold text-lg flex items-center justify-center gap-3 transition-all
              ${canConfirm
                ? "bg-gradient-to-r from-[#D30C5C] to-[#DF33DF] text-white shadow-xl shadow-[#D30C5C]/30 hover:opacity-90 cursor-pointer"
                : "bg-white/5 text-white/25 cursor-not-allowed border border-white/5"
              }`}
          >
            <span className="material-symbols-outlined text-xl">explore</span>
            Start Planning
          </button>
          {!canConfirm && (
            <p className="text-center text-white/20 text-xs mt-3 font-technical">
              Please select both dates to continue
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
