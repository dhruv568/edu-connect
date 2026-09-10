"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, GraduationCap, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setTeachers([]);
      setCourses([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [tRes, cRes] = await Promise.all([
          fetch(`/api/teachers?search=${encodeURIComponent(query)}`).then((r) => r.json()),
          fetch(`/api/courses?search=${encodeURIComponent(query)}`).then((r) => r.json()),
        ]);
        if (tRes.success) setTeachers(tRes.data.teachers.slice(0, 3));
        if (cRes.success) setCourses(cRes.data.courses.slice(0, 3));
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-[#DCE5E4] overflow-hidden relative"
        >
          {/* Input Header */}
          <div className="relative flex items-center border-b border-[#DCE5E4] pb-4">
            <Search className="h-5 w-5 text-[#5D7373] absolute left-2" />
            <input
              type="text"
              autoFocus
              placeholder="Search teachers, subjects, or courses... (Type 'Mathematics' or 'Sarah')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 text-base font-medium text-[#102A2A] placeholder:text-[#5D7373] bg-transparent outline-none"
            />
            <button
              onClick={onClose}
              className="absolute right-2 text-[#5D7373] hover:text-[#102A2A] p-1 rounded-full hover:bg-[#F5F7F8]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results Area */}
          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-6 pr-1">
            {!query.trim() ? (
              <div className="py-8 text-center space-y-2">
                <span className="text-xs font-bold text-[#5D7373] uppercase tracking-widest">
                  Quick Search Suggestions
                </span>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {["Mathematics", "Physics", "Python", "Chemistry", "Sarah Jenkins"].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(s)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F5F7F8] hover:bg-[#E6F0EF] hover:text-[#0B4F4B] transition-colors border border-[#DCE5E4]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="py-8 text-center text-xs text-[#5D7373]">Searching EduConnects repository...</div>
            ) : (
              <>
                {/* Teachers Match */}
                {teachers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-[#0B4F4B] uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" /> Verified Teachers ({teachers.length})
                    </h4>
                    <div className="space-y-2">
                      {teachers.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            onClose();
                            router.push(`/find-teachers?search=${encodeURIComponent(t.name)}`);
                          }}
                          className="p-3 rounded-2xl bg-[#F5F7F8] hover:bg-[#E6F0EF] border border-[#DCE5E4] transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <h5 className="text-xs font-bold text-[#102A2A]">{t.name}</h5>
                              <p className="text-[11px] text-[#5D7373]">{t.headline}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#0B4F4B]">${t.hourlyRate}/hr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses Match */}
                {courses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-[#1B6863] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" /> LMS Courses ({courses.length})
                    </h4>
                    <div className="space-y-2">
                      {courses.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            onClose();
                            router.push(`/courses?search=${encodeURIComponent(c.title)}`);
                          }}
                          className="p-3 rounded-2xl bg-[#F5F7F8] hover:bg-[#E6F0EF] border border-[#DCE5E4] transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-[#102A2A]">{c.title}</h5>
                            <p className="text-[11px] text-[#5D7373]">{c.subject} • {c.lessonCount} Lessons</p>
                          </div>
                          <span className="text-xs font-bold text-[#1B6863]">{c.price === 0 ? "FREE" : formatCurrency(c.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {teachers.length === 0 && courses.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No results found for &ldquo;{query}&rdquo;. Try another subject or tutor name.
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
