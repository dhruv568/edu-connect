"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";
import { formatCurrency } from "@/lib/currency";

export interface TeacherFilterState {
  subject: string;
  priceMax: number;
  ratingMin: number;
  experienceMin: number;
  sortBy: string;
}

export interface TeacherFilterPanelProps {
  filters: TeacherFilterState;
  onChange: (newFilters: TeacherFilterState) => void;
  onReset: () => void;
}

export function TeacherFilterPanel({ filters, onChange, onReset }: TeacherFilterPanelProps) {
  const subjects = [
    { value: "all", label: "All Subjects" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "computer science", label: "Computer Science" },
    { value: "english", label: "English" },
  ];

  return (
    <div className="glass-surface p-6 rounded-3xl space-y-6 border border-white/80 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm uppercase tracking-wider">
          <Filter className="h-4 w-4 text-blue-600" /> Filter Tutors
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Subject Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</label>
        <select
          value={filters.subject}
          onChange={(e) => onChange({ ...filters, subject: e.target.value })}
          className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hourly Rate Filter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-700 uppercase tracking-wider">Max Hourly Rate</span>
          <span className="text-blue-600">{formatCurrency(filters.priceMax)}/hr</span>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          step={5}
          value={filters.priceMax}
          onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Minimum Rating</label>
        <div className="flex gap-2">
          {[4.0, 4.5, 4.8].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...filters, ratingMin: filters.ratingMin === r ? 0 : r })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                filters.ratingMin === r
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              ★ {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="recommended">Recommended Tutors</option>
          <option value="rating">Highest Rated ★</option>
          <option value="experience">Most Experienced</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
