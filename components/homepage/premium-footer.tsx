"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  BookOpen,
  Compass,
  Sparkles,
  GraduationCap,
  Layers,
  Info,
  Mail,
  Award,
  FileText,
  ShieldCheck,
  RefreshCw,
  Truck,
  CreditCard,
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import { Logo } from "@/components/brand/logo";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.101-.477-.15-.678.15-.2.301-.777.978-.952 1.178-.175.201-.35.226-.651.076-.301-.15-1.272-.469-2.424-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.135-.135.301-.35.451-.526.15-.175.201-.301.301-.501.101-.201.05-.376-.025-.526-.075-.15-.678-1.634-.928-2.238-.244-.588-.492-.508-.678-.517-.175-.01-.376-.01-.577-.01-.201 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.507 0 1.479 1.078 2.908 1.229 3.109.15.201 2.12 3.238 5.137 4.542.718.31 1.279.496 1.716.635.721.23 1.377.198 1.896.12.578-.088 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.126-.276-.201-.577-.351z" />
      <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.954.56 3.784 1.528 5.334L2.25 21.75l4.546-1.246a9.96 9.96 0 0 0 5.208 1.496c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.275a8.23 8.23 0 0 1-4.22-1.164l-.303-.18-3.136.86.842-3.056-.197-.314a8.243 8.243 0 1 1 15.258-4.425 8.28 8.28 0 0 1-8.244 8.279z" />
    </svg>
  );
}

const normalizeSocialUrl = (url?: string, platform?: string) => {
  if (!url || typeof url !== "string" || !url.trim()) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (platform === "whatsapp") {
    const cleanDigits = trimmed.replace(/[^0-9]/g, "");
    if (cleanDigits) return `https://wa.me/${cleanDigits}`;
    return `https://${trimmed}`;
  }
  if (platform === "youtube") return `https://youtube.com/@${trimmed.replace(/^@/, "")}`;
  if (platform === "facebook") return `https://facebook.com/${trimmed}`;
  if (platform === "instagram") return `https://instagram.com/${trimmed.replace(/^@/, "")}`;
  if (platform === "linkedin") return `https://linkedin.com/in/${trimmed}`;
  return `https://${trimmed}`;
};

export interface PremiumFooterProps {
  showCta?: boolean;
  variant?: "default" | "student" | "teacher";
}

export function PremiumFooter({ showCta = false, variant }: PremiumFooterProps = {}) {
  const pathname = usePathname();
  const [socials, setSocials] = useState(OFFICIAL_COMPANY_INFO.socials);

  const isEducator =
    variant === "teacher" ||
    (variant !== "default" &&
      variant !== "student" &&
      (pathname === "/teacher" ||
        pathname?.startsWith("/teacher/") ||
        pathname === "/register/teacher" ||
        (typeof window !== "undefined" &&
          (window.location.hostname.startsWith("educators.") ||
            window.location.hostname.startsWith("educator.") ||
            window.location.hostname.startsWith("teachers.") ||
            window.location.hostname.startsWith("teacher.")))));

  const isLearner =
    !isEducator &&
    (pathname === "/student" ||
      pathname?.startsWith("/student/") ||
      pathname === "/exam" ||
      pathname?.startsWith("/exam/") ||
      (typeof window !== "undefined" &&
        (window.location.hostname.startsWith("learners.") ||
          window.location.hostname.startsWith("learner.") ||
          window.location.hostname.startsWith("students.") ||
          window.location.hostname.startsWith("student."))));

  useEffect(() => {
    let isMounted = true;
    fetch("/api/company")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.data?.company?.socials) {
          setSocials(json.data.company.socials);
        }
      })
      .catch(() => {
        // Fallback to initial state
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const socialLinks = [
    {
      name: "YouTube",
      url: normalizeSocialUrl(socials.youtube, "youtube"),
      icon: Youtube,
      hoverClass: "hover:text-red-400 hover:border-red-400/40",
    },
    {
      name: "Facebook",
      url: normalizeSocialUrl(socials.facebook, "facebook"),
      icon: Facebook,
      hoverClass: "hover:text-blue-400 hover:border-blue-400/40",
    },
    {
      name: "Instagram",
      url: normalizeSocialUrl(socials.instagram, "instagram"),
      icon: Instagram,
      hoverClass: "hover:text-pink-400 hover:border-pink-400/40",
    },
    {
      name: "WhatsApp",
      url: normalizeSocialUrl(socials.whatsapp, "whatsapp"),
      icon: WhatsAppIcon,
      hoverClass: "hover:text-emerald-400 hover:border-emerald-400/40",
    },
    {
      name: "LinkedIn",
      url: normalizeSocialUrl(socials.linkedin, "linkedin"),
      icon: Linkedin,
      hoverClass: "hover:text-sky-400 hover:border-sky-400/40",
    },
  ].filter((item) => item.url && item.url.trim() !== "");

  return (
    <footer
      className={`${
        isEducator
          ? "bg-[#0D5C41] border-t border-[#16805B]/40"
          : isLearner
          ? "bg-[#243B9B] border-t border-[#3157D5]/40"
          : "bg-[#083F3D] border-t border-[#1B6863]/40"
      } text-white pt-16 pb-12 relative overflow-hidden font-sans`}
    >
      {/* Background Subtle Accent Glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 ${
          isEducator
            ? "bg-[#16805B]/25"
            : isLearner
            ? "bg-[#3157D5]/20"
            : "bg-[#2A8C84]/15"
        } blur-3xl rounded-full pointer-events-none`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Main Grid: Brand + 3 Organized Columns */}
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b ${
            isEducator
              ? "border-[#16805B]/40"
              : isLearner
              ? "border-[#3157D5]/40"
              : "border-[#1B6863]/60"
          }`}
        >
          {/* Brand & Legal Info (md:col-span-4) */}
          <div className="space-y-4 md:col-span-4">
            <Logo
              variant="compact"
              size="lg"
              roleContext={isEducator ? "teacher" : isLearner ? "student" : "default"}
              theme="dark"
              href={isEducator ? "/teacher" : isLearner ? "/student" : "/"}
              showTagline={false}
            />
            {(isEducator || isLearner) && (
              <p
                className={`text-xs ${
                  isEducator
                    ? "text-[#35A979]"
                    : "text-blue-200"
                } font-bold uppercase tracking-wider`}
              >
                {isEducator ? "Teach • Connect • Grow" : "Learn • Grow • Belong"}
              </p>
            )}
            <p
              className={`text-xs sm:text-[13px] ${
                isEducator
                  ? "text-emerald-100"
                  : isLearner
                  ? "text-blue-100"
                  : "text-teal-100"
              } leading-relaxed font-normal`}
            >
              {isEducator
                ? "EduConnects empowers educators across India to teach, earn, and mentor the next generation with verified credentials, modern virtual tools, and dedicated student reach."
                : "EduConnects is India's premier educational platform connecting learners with verified educators for personalized 1-on-1 sessions, interactive group workshops, and accredited courses."}
            </p>

            {/* Official Legal Details Card */}
            <div
              className={`p-4 rounded-2xl ${
                isEducator
                  ? "bg-[#08422F] border border-[#16805B]/60"
                  : isLearner
                  ? "bg-[#1A2C76] border border-[#3157D5]/50"
                  : "bg-[#052C2A]/90 border border-[#1B6863]"
              } text-xs space-y-1.5 shadow-sm`}
            >
              <div className="space-y-0.5">
                <p
                  className={`text-[11px] font-medium tracking-wide ${
                    isEducator
                      ? "text-emerald-300/85"
                      : isLearner
                      ? "text-blue-300/85"
                      : "text-teal-300/85"
                  }`}
                >
                  Parent Company
                </p>
                <p className="font-bold text-white text-xs sm:text-sm">
                  Shrivastava ProFunnels Ventures Pvt Ltd
                </p>
              </div>
              <p
                className={`font-mono ${
                  isEducator
                    ? "text-emerald-200"
                    : isLearner
                    ? "text-blue-200"
                    : "text-teal-200"
                } text-xs font-semibold`}
              >
                CIN: U85499UP2024PTC212061
              </p>
              <p
                className={`${
                  isEducator
                    ? "text-emerald-100"
                    : isLearner
                    ? "text-blue-100"
                    : "text-teal-100"
                } text-xs leading-relaxed font-normal`}
              >
                Registered Office: Bard No. 8, Basundhara Colony, Chandmari, Lalitpur (UP), 284403
              </p>
            </div>

            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <p
                  className={`text-[11px] uppercase tracking-wider font-extrabold ${
                    isEducator
                      ? "text-emerald-200"
                      : isLearner
                      ? "text-blue-200"
                      : "text-teal-200"
                  } mb-2.5`}
                >
                  Connect With Us
                </p>
                <div className="flex items-center gap-2.5">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`EduConnects on ${item.name}`}
                        className={`h-9 w-9 rounded-xl ${
                          isEducator
                            ? "bg-[#16805B]/60 border border-[#35A979]/40 hover:bg-[#16805B]"
                            : isLearner
                            ? "bg-[#1E3185] border border-[#3157D5]/50 hover:bg-[#152366]"
                            : "bg-[#0F5C5A] border border-[#2A8C84]/50 hover:bg-[#052C2A]"
                        } flex items-center justify-center text-white transition-all duration-200 ${item.hoverClass} hover:border-white shadow-xs`}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Column 1: Explore (md:col-span-2) */}
          <div className="md:col-span-2">
            <h4
              className={`text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b ${
                isEducator
                  ? "border-[#16805B]/50"
                  : isLearner
                  ? "border-[#3157D5]/50"
                  : "border-[#2A8C84]/40"
              } pb-2.5`}
            >
              Explore
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-[13px] font-medium">
              {isEducator ? (
                <>
                  <li>
                    <Link
                      href="/teacher#benefits"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>Educator Benefits</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher#how-it-works"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>How It Works?</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher#success-stories"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <Award className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>Success Stories</span>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/find-teachers"
                      className={`${
                        isLearner ? "text-blue-100 hover:text-white" : "text-teal-100 hover:text-white"
                      } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                    >
                      <Users className={`h-3.5 w-3.5 ${isLearner ? "text-blue-300" : "text-[#2A8C84]"} shrink-0`} />
                      <span>Find an Educator</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/courses"
                      className={`${
                        isLearner ? "text-blue-100 hover:text-white" : "text-teal-100 hover:text-white"
                      } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                    >
                      <BookOpen className={`h-3.5 w-3.5 ${isLearner ? "text-blue-300" : "text-[#2A8C84]"} shrink-0`} />
                      <span>Explore Courses</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/courses"
                      className={`${
                        isLearner ? "text-blue-100 hover:text-white" : "text-teal-100 hover:text-white"
                      } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                    >
                      <Compass className={`h-3.5 w-3.5 ${isLearner ? "text-blue-300" : "text-[#2A8C84]"} shrink-0`} />
                      <span>Browse Subjects</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 2: For Educators / Learning Resources / Portals */}
          <div className="md:col-span-3">
            <h4
              className={`text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b ${
                isEducator
                  ? "border-[#16805B]/50"
                  : isLearner
                  ? "border-[#3157D5]/50"
                  : "border-[#2A8C84]/40"
              } pb-2.5`}
            >
              {isEducator
                ? "For Educators"
                : isLearner
                ? "Learning Resources"
                : "Portals & Programs"}
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-[13px] font-medium">
              {isEducator ? (
                <>
                  <li>
                    <Link
                      href="/teacher/register"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <GraduationCap className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>Become an Educator</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/login"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <Users className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>Educator Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/register"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>Educator Registration</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/training"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <Award className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>15-Day Training Program</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher"
                      className="text-emerald-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#35A979] shrink-0" />
                      <span>Educator Portal</span>
                    </Link>
                  </li>
                </>
              ) : isLearner ? (
                <>
                  <li>
                    <Link href="/find-teachers" className="text-blue-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5">
                      <Users className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                      <span>Find Verified Educators</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="text-blue-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5">
                      <BookOpen className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                      <span>Explore Courses</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/exam" className="text-blue-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5">
                      <Award className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                      <span>Take a Free Exam</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="text-blue-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5">
                      <Compass className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                      <span>How Learning Works</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-blue-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5">
                      <CreditCard className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                      <span>Pricing & Guarantee</span>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a
                      href="https://learners.educonnects.co.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <GraduationCap className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                      <span>Learner Portal</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://educators.educonnects.co.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                      <span>Educator Portal</span>
                    </a>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="text-teal-100 hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2.5">
                      <Compass className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                      <span>How It Works</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Company & Policies (md:col-span-3) */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h4
                className={`text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b ${
                  isEducator
                    ? "border-[#16805B]/50"
                    : isLearner
                    ? "border-[#3157D5]/50"
                    : "border-[#2A8C84]/40"
                } pb-2.5`}
              >
                Company
              </h4>
              <ul className="space-y-3 text-xs sm:text-[13px] font-medium">
                <li>
                  <Link
                    href="/about"
                    className={`${
                      isEducator
                        ? "text-emerald-100 hover:text-white"
                        : isLearner
                        ? "text-blue-100 hover:text-white"
                        : "text-teal-100 hover:text-white"
                    } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                  >
                    <Info
                      className={`h-3.5 w-3.5 ${
                        isEducator
                          ? "text-[#35A979]"
                          : isLearner
                          ? "text-blue-300"
                          : "text-[#2A8C84]"
                      } shrink-0`}
                    />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className={`${
                      isEducator
                        ? "text-emerald-100 hover:text-white"
                        : isLearner
                        ? "text-blue-100 hover:text-white"
                        : "text-teal-100 hover:text-white"
                    } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                  >
                    <Mail
                      className={`h-3.5 w-3.5 ${
                        isEducator
                          ? "text-[#35A979]"
                          : isLearner
                          ? "text-blue-300"
                          : "text-[#2A8C84]"
                      } shrink-0`}
                    />
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={isEducator ? "/teacher#success-stories" : "/#success-stories"}
                    className={`${
                      isEducator
                        ? "text-emerald-100 hover:text-white"
                        : isLearner
                        ? "text-blue-100 hover:text-white"
                        : "text-teal-100 hover:text-white"
                    } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                  >
                    <Award
                      className={`h-3.5 w-3.5 ${
                        isEducator
                          ? "text-[#35A979]"
                          : isLearner
                          ? "text-blue-300"
                          : "text-[#2A8C84]"
                      } shrink-0`}
                    />
                    <span>Success Stories</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className={`${
                      isEducator
                        ? "text-emerald-100 hover:text-white"
                        : isLearner
                        ? "text-blue-100 hover:text-white"
                        : "text-teal-100 hover:text-white"
                    } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                  >
                    <FileText
                      className={`h-3.5 w-3.5 ${
                        isEducator
                          ? "text-[#35A979]"
                          : isLearner
                          ? "text-blue-300"
                          : "text-[#2A8C84]"
                      } shrink-0`}
                    />
                    <span>Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className={`${
                      isEducator
                        ? "text-emerald-100 hover:text-white"
                        : isLearner
                        ? "text-blue-100 hover:text-white"
                        : "text-teal-100 hover:text-white"
                    } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                  >
                    <ShieldCheck
                      className={`h-3.5 w-3.5 ${
                        isEducator
                          ? "text-[#35A979]"
                          : isLearner
                          ? "text-blue-300"
                          : "text-[#2A8C84]"
                      } shrink-0`}
                    />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className={`${
                      isEducator
                        ? "text-emerald-100 hover:text-white"
                        : isLearner
                        ? "text-blue-100 hover:text-white"
                        : "text-teal-100 hover:text-white"
                    } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        isEducator
                          ? "text-[#35A979]"
                          : isLearner
                          ? "text-blue-300"
                          : "text-[#2A8C84]"
                      } shrink-0`}
                    />
                    <span>Cancellation & Refund</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping-policy"
                    className={`${
                      isEducator
                        ? "text-emerald-100 hover:text-white"
                        : isLearner
                        ? "text-blue-100 hover:text-white"
                        : "text-teal-100 hover:text-white"
                    } hover:translate-x-0.5 transition-all flex items-center gap-2.5`}
                  >
                    <Truck
                      className={`h-3.5 w-3.5 ${
                        isEducator
                          ? "text-[#35A979]"
                          : isLearner
                          ? "text-blue-300"
                          : "text-[#2A8C84]"
                      } shrink-0`}
                    />
                    <span>Shipping Policy</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cashfree Payment Gateway Card */}
            <div
              className={`p-4 ${
                isEducator
                  ? "bg-[#08422F] border border-[#16805B]/60"
                  : isLearner
                  ? "bg-[#1A2C76] border border-[#3157D5]/50"
                  : "bg-[#052C2A]/90 border border-[#1B6863]"
              } rounded-2xl text-xs space-y-1.5 shadow-sm`}
            >
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <CreditCard
                  className={`h-4 w-4 ${
                    isEducator
                      ? "text-[#35A979]"
                      : isLearner
                      ? "text-blue-300"
                      : "text-[#2A8C84]"
                  } shrink-0`}
                />
                <span>Cashfree Payment Gateway</span>
              </div>
              <p
                className={`text-[12px] ${
                  isEducator
                    ? "text-emerald-100"
                    : isLearner
                    ? "text-blue-100"
                    : "text-teal-100"
                } leading-relaxed font-normal`}
              >
                Secure online payments.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Powered by */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            isEducator
              ? "text-emerald-200"
              : isLearner
              ? "text-blue-100"
              : "text-teal-100"
          } pt-4`}
        >
          <p className="text-center sm:text-left font-medium">
            &copy; 2026 EduConnects. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Powered by</span>
            <a
              href="https://automation.myprofunnels.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold ${
                isEducator
                  ? "text-[#35A979]"
                  : isLearner
                  ? "text-blue-300"
                  : "text-[#2A8C84]"
              } hover:text-white hover:underline transition-colors inline-flex items-center gap-1`}
            >
              MyProFunnels
              <span className="text-red-500" role="img" aria-label="love">
                ❤️
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
