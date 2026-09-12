"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";

interface CourseData {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  level?: string;
  price?: number;
  teacher?: {
    name?: string;
  };
}

export function ExploreCoursesSection() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses?limit=3");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.courses) {
            setCourses(json.data.courses);
          } else if (json.data?.items) {
            setCourses(json.data.items);
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#DCE5E4] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black text-[#0F5C5A] uppercase tracking-widest px-3 py-1 rounded-full bg-[#E6F0EF]">
              STRUCTURED LMS CURRICULA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#102A2A] tracking-tight">
              Learn through structured courses
            </h2>
            <p className="text-xs sm:text-sm text-[#5D7373] max-w-xl">
              Access comprehensive video lessons, study resources, and quizzes created by subject experts.
            </p>
          </div>

          <Link href="/courses">
            <GlassButton
              variant="primary"
              className="bg-[#0F5C5A] hover:bg-[#083F3D] text-white font-extrabold px-6 rounded-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Explore All Courses →
            </GlassButton>
          </Link>
        </div>

        {/* Dynamic Courses Grid or Fallback State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-[#F5F7F8] animate-pulse rounded-3xl border border-[#DCE5E4]" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-[#F5F7F8] border border-[#DCE5E4] shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Thumbnail */}
                  <div className="h-44 rounded-2xl overflow-hidden bg-[#DCE5E4] relative">
                    <img
                      src={
                        c.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80"
                      }
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {c.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">
                        {c.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-[#102A2A] line-clamp-2 group-hover:text-[#0F5C5A] transition-colors">
                    {c.title}
                  </h3>

                  {c.teacher?.name && (
                    <p className="text-xs text-[#5D7373] font-semibold">
                      By {c.teacher.name}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DCE5E4]">
                    {c.level && (
                      <span className="text-[#5D7373] font-semibold">{c.level}</span>
                    )}
                    <span className="text-base font-black text-[#0F5C5A]">
                      {c.price ? `₹${c.price}` : "Free"}
                    </span>
                  </div>
                </div>

                <Link href={`/courses/${c.slug || c.id}`}>
                  <GlassButton variant="secondary" className="w-full justify-center text-xs font-bold bg-white">
                    View Course Details
                  </GlassButton>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Polished Empty State for Courses */
          <div className="p-10 rounded-3xl bg-[#F5F7F8] border border-[#DCE5E4] text-center space-y-4 max-w-xl mx-auto">
            <div className="p-3.5 rounded-full bg-[#E6F0EF] text-[#0F5C5A] w-fit mx-auto">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-[#102A2A]">Courses Coming Soon</h3>
            <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
              Our verified educators are actively recording new curriculum modules. Check back shortly or browse educators offering live classes.
            </p>
            <div className="pt-2">
              <Link href="/find-teachers">
                <GlassButton variant="primary" className="bg-[#0F5C5A] text-white text-xs font-extrabold">
                  Find Live Educators →
                </GlassButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
