"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { CourseFilterPanel, CourseFilterState } from "@/components/discovery/course-filter-panel";
import { CourseCardGrid } from "@/components/discovery/course-card-grid";
import { AuthModal } from "@/components/shared/auth-modal";
import { Search, BookOpen } from "lucide-react";
import { UserRole } from "@/types/auth";
import { trackEvent } from "@/lib/analytics";

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState<CourseFilterState>({
    subject: searchParams.get("subject") || "all",
    priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : 150,
    ratingMin: searchParams.get("ratingMin") ? Number(searchParams.get("ratingMin")) : 0,
    sortBy: searchParams.get("sortBy") || "recommended",
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");

  const updateURL = (newSearch: string, newFilters: CourseFilterState) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set("search", newSearch);
    if (newFilters.subject !== "all") params.set("subject", newFilters.subject);
    if (newFilters.priceMax < 150) params.set("priceMax", String(newFilters.priceMax));
    if (newFilters.sortBy !== "recommended") params.set("sortBy", newFilters.sortBy);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) queryParams.set("search", searchQuery);
        if (filters.subject !== "all") queryParams.set("subject", filters.subject);
        if (filters.priceMax) queryParams.set("priceMax", String(filters.priceMax));
        if (filters.sortBy) queryParams.set("sortBy", filters.sortBy);

        const res = await fetch(`/api/courses?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setCourses(data.data.courses);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchQuery, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("course_search_submitted", { query: searchQuery });
    updateURL(searchQuery, filters);
  };

  const handleFilterChange = (newFilters: CourseFilterState) => {
    setFilters(newFilters);
    updateURL(searchQuery, newFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters: CourseFilterState = {
      subject: "all",
      priceMax: 150,
      ratingMin: 0,
      sortBy: "recommended",
    };
    setSearchQuery("");
    setFilters(defaultFilters);
    updateURL("", defaultFilters);
  };

  const handleOpenAuth = (role: UserRole) => {
    setSelectedRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">
              Structured LMS Courses
            </span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Self-Paced Learning Catalog
            </h1>
            <p className="text-sm text-slate-600">
              Explore video-based courses, download practice workbooks, and earn certificates.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="glass-surface p-2 rounded-2xl flex items-center shadow-lg border border-white/90">
              <Search className="h-5 w-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search courses by topic (e.g. 'Calculus' or 'Python')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Search Courses
              </button>
            </div>
          </form>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-4">
              <CourseFilterPanel
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                <span>Showing {courses.length} LMS Courses</span>
                <span>URL Filter Sync Active 🔗</span>
              </div>

              <CourseCardGrid
                courses={courses}
                loading={loading}
                onOpenAuth={handleOpenAuth}
              />
            </div>
          </div>
        </div>
      </main>

      <PremiumFooter />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={selectedRole}
      />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Course Discovery...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
