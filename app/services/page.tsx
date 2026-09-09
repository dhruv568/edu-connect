"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { OFFICIAL_COMPANY_INFO, OFFICIAL_SERVICES, ProductServiceItem } from "@/lib/company";
import {
  Layout,
  Globe,
  Users,
  MessageSquare,
  Mail,
  Zap,
  Calendar,
  GraduationCap,
  Video,
  Award,
  CreditCard,
  Receipt,
  Contact,
  Bell,
  TrendingUp,
  MapPin,
  Search,
  Share2,
  PlaySquare,
  Share,
  Smartphone,
  Film,
  ShoppingBag,
  CheckCircle,
  Compass,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout className="h-6 w-6" />,
  Globe: <Globe className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  MessageSquare: <MessageSquare className="h-6 w-6" />,
  Mail: <Mail className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Calendar: <Calendar className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
  Award: <Award className="h-6 w-6" />,
  CreditCard: <CreditCard className="h-6 w-6" />,
  Receipt: <Receipt className="h-6 w-6" />,
  Contact: <Contact className="h-6 w-6" />,
  Bell: <Bell className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  MapPin: <MapPin className="h-6 w-6" />,
  Search: <Search className="h-6 w-6" />,
  Share2: <Share2 className="h-6 w-6" />,
  PlaySquare: <PlaySquare className="h-6 w-6" />,
  Share: <Share className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  Film: <Film className="h-6 w-6" />,
  ShoppingBag: <ShoppingBag className="h-6 w-6" />,
  CheckCircle: <CheckCircle className="h-6 w-6" />,
  Compass: <Compass className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
};

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Digital Solutions", "Marketing & Growth", "Education & LMS", "Development & Media"];

  const filteredServices =
    selectedCategory === "ALL"
      ? OFFICIAL_SERVICES
      : OFFICIAL_SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Official Offerings & Solutions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Products & Services by{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {OFFICIAL_COMPANY_INFO.brandName}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {OFFICIAL_COMPANY_INFO.natureOfBusiness}
            <br />
            <span className="font-bold text-slate-800">
              Plans and services starting from ₹99 up to ₹2.99 Lakh based on custom package requirements.
            </span>
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat === "ALL" ? "All Offerings (27)" : cat}
            </button>
          ))}
        </div>

        {/* Grid of 27 Offerings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <GlassCard
              key={service.id}
              glowColor="rgba(37, 99, 235, 0.12)"
              className="p-6 space-y-4 border border-white/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 group-hover:scale-110 transition-transform">
                    {iconMap[service.iconName] || <Layout className="h-6 w-6" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    #{service.id}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Starting from ₹99</span>
                <Link href="/contact">
                  <GlassButton variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Get Started
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Footer Contact Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black">Need a Custom Business Solution?</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              We offer tailored done-for-you digital services, enterprise funnels, and custom marketing setups ranging from ₹99 to ₹2.99 Lakh.
            </p>
          </div>
          <Link href="/contact">
            <GlassButton variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Get a Custom Quote
            </GlassButton>
          </Link>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}
