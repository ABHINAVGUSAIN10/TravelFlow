"use client";

import { useState, useEffect, useRef, useMemo } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(day: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  return day > start && day < end;
}

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
}

export default function CalendarPicker({ startDate, endDate, onDateChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectingEnd, setSelectingEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Maximum date: 2 months from today
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 2);
    return d;
  }, [today]);

  // Constrain navigation
  const canGoBack = viewMonth.getFullYear() > today.getFullYear() || 
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() > today.getMonth());

  const nextViewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
  const canGoForward = nextViewMonth < maxDate;

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleDayClick(day: Date) {
    if (day < today || day > maxDate) return;

    if (!selectingEnd || !startDate) {
      // Selecting start date
      onDateChange(day, null);
      setSelectingEnd(true);
    } else {
      // Selecting end date
      if (day < startDate) {
        // If clicked before start, reset start
        onDateChange(day, null);
        setSelectingEnd(true);
      } else {
        onDateChange(startDate, day);
        setSelectingEnd(false);
        // Keep the calendar open so user can see the selection, close after small delay
        setTimeout(() => setIsOpen(false), 400);
      }
    }
  }

  function renderMonth(monthDate: Date) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return (
      <div className="flex-1 min-w-[200px]">
        <h4 className="text-center font-headline font-bold text-white text-sm mb-3">
          {MONTHS[month]} {year}
        </h4>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-technical text-white/30 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-9" />;
            }
            const disabled = day < today || day > maxDate;
            const isStart = startDate && isSameDay(day, startDate);
            const isEnd = endDate && isSameDay(day, endDate);
            const isSelected = isStart || isEnd;
            const inRange = isInRange(day, startDate, endDate);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={day.toISOString()}
                onClick={() => !disabled && handleDayClick(day)}
                disabled={disabled}
                className={`h-9 w-full rounded-lg text-sm font-medium transition-all duration-200 relative
                  ${disabled ? "text-white/15 cursor-not-allowed" : "cursor-pointer"}
                  ${isSelected ? "text-[#050e1c] font-bold" : ""}
                  ${inRange ? "bg-[#B4D104]/15 text-white" : ""}
                  ${!isSelected && !inRange && !disabled ? "text-white/70 hover:bg-white/[0.08] hover:text-white" : ""}
                  ${isToday && !isSelected ? "ring-1 ring-white/20" : ""}
                `}
                style={isSelected ? { backgroundColor: "#B4D104" } : undefined}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const displayValue = (() => {
    if (startDate && endDate) {
      const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
      return `${fmt(startDate)} — ${fmt(endDate)}`;
    }
    if (startDate) {
      return `${startDate.getDate()} ${MONTHS[startDate.getMonth()].slice(0, 3)} — ...`;
    }
    return "";
  })();

  return (
    <div ref={containerRef} className="relative flex flex-col md:border-l md:border-white/10 md:pl-6">
      <span className="text-[10px] font-technical uppercase text-[#B4D104] tracking-widest">
        Dates
      </span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-none text-left font-headline font-semibold text-sm focus:outline-none mt-1 min-w-[120px]"
      >
        <span className={displayValue ? "text-white" : "text-white/50"}>
          {displayValue || "Select Dates"}
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] rounded-2xl glass-dropdown shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7)] border border-white/[0.08] p-5 w-max">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => canGoBack && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              disabled={!canGoBack}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                canGoBack ? "bg-white/[0.06] hover:bg-white/10 text-white" : "text-white/15 cursor-not-allowed"
              }`}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            <div className="flex items-center gap-2">
              {selectingEnd && startDate && (
                <span className="text-[10px] font-technical text-[#B4D104]/70 tracking-wider uppercase">
                  Select end date
                </span>
              )}
              {!selectingEnd && !startDate && (
                <span className="text-[10px] font-technical text-white/40 tracking-wider uppercase">
                  Select start date
                </span>
              )}
            </div>

            <button
              onClick={() => canGoForward && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              disabled={!canGoForward}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                canGoForward ? "bg-white/[0.06] hover:bg-white/10 text-white" : "text-white/15 cursor-not-allowed"
              }`}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Two-month grid */}
          <div className="flex gap-6">
            {renderMonth(viewMonth)}
            {renderMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          </div>

          {/* Quick actions */}
          {(startDate || endDate) && (
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => {
                  onDateChange(null, null);
                  setSelectingEnd(false);
                }}
                className="text-[11px] font-technical text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
              >
                Clear dates
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
