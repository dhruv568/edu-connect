import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
        <div className="w-20 h-6 bg-slate-200 rounded-full" />
      </div>
      <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-200 rounded-lg w-full" />
      <div className="h-4 bg-slate-200 rounded-lg w-5/6" />
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm animate-pulse flex flex-col md:flex-row items-center gap-6">
      <div className="w-24 h-24 bg-slate-200 rounded-full shrink-0" />
      <div className="flex-1 space-y-3 w-full">
        <div className="h-7 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
        <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
      </div>
    </div>
  );
}
