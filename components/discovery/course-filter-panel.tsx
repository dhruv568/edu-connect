"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";

export interface CourseFilterState {
  subject: string;
  priceMax: number;
  ratingMin: number;
  sortBy: string;
}

export interface CourseFilterPanelProps {
  filters: CourseFilterState;
  onChange: (newFilters: CourseFilterState) => void;
  onReset: () => void;
}

export function CourseFilterPanel({ filters, onChange, onReset }: CourseFilterPanelProps) {
  const subjects = [
    { value: "all", label: "All Subjects" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "computer science", label: "Computer Science" },
  ];

  return (
    <div className="glass-surface p-6 rounded-3xl space-y-6 border border-white/80 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm uppercase tracking-wider">
          <Filter className="h-4 w-4 text-emerald-600" /> Filter Courses
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
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
          className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        >
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Max Price */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-700 uppercase tracking-wider">Max Price</span>
          <span className="text-emerald-600">${filters.priceMax}</span>
        </div>
        <input
          type="range"
          min={30}
          max={150}
          step={10}
          value={filters.priceMax}
          onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer"
        />
      </div>

      {/* Sorting */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        >
          <option value="recommended">Recommended Courses</option>
          <option value="rating">Highest Rated ★</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
