"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Suggestion {
  _id: string;
  title: string;
  subtitle: string;
  state: string;
  category: string;
  cardImage: string;
  accentColor: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: Suggestion) => void;
}

export default function DestinationAutocomplete({ value, onChange, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/locations/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setIsOpen((data.suggestions || []).length > 0);
      setHighlightIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function handleSelect(suggestion: Suggestion) {
    onChange(suggestion.title);
    onSelect(suggestion);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col">
      <span className="text-[10px] font-technical uppercase text-[#B4D104] tracking-widest">
        Destination
      </span>
      <input
        type="text"
        placeholder="Where to?"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value === "") onSelect(null as unknown as Suggestion); // clear selection
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="bg-transparent border-none text-white font-headline font-semibold text-sm focus:outline-none placeholder-white/50 mt-1"
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] w-[280px] max-h-[320px] overflow-y-auto rounded-2xl glass-dropdown shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7)] border border-white/[0.08]"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
        >
          <div className="p-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={s._id}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${
                  highlightIndex === idx
                    ? "bg-white/[0.08]"
                    : "hover:bg-white/[0.05]"
                }`}
              >
                {/* Accent line */}
                <div
                  className={`w-[3px] self-stretch rounded-full transition-all duration-300 ${
                    highlightIndex === idx ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundColor: s.accentColor }}
                />

                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.cardImage}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col min-w-0">
                  <span className="font-headline font-semibold text-sm text-white truncate">
                    {s.title}
                  </span>
                  <span className="text-[11px] text-white/50 font-medium truncate">
                    {s.subtitle}, {s.state}
                  </span>
                </div>

                {/* Category badge */}
                <span
                  className="ml-auto text-[9px] font-technical uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `${s.accentColor}20`,
                    color: s.accentColor,
                  }}
                >
                  {s.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
