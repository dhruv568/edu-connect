"use client";

import React, { useState } from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { InteractiveHeroCanvas } from "@/components/homepage/interactive-hero-canvas";
import { TrustChips } from "@/components/homepage/trust-chips";
import { LiquidLearningModels } from "@/components/homepage/liquid-learning-models";
import { TeacherCarousel } from "@/components/homepage/teacher-carousel";
import { LiveClassroomPreview } from "@/components/homepage/live-classroom-preview";
import { CourseExperienceSection } from "@/components/homepage/course-experience-section";
import { LearningJourneyPath } from "@/components/homepage/learning-journey-path";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { AuthModal } from "@/components/shared/auth-modal";
import { UserRole } from "@/types/auth";

export default function EduConnectHomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");

  const handleOpenAuth = (role: UserRole) => {
    setSelectedRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50 overflow-hidden font-sans">
      {/* 1. Floating Glass Navbar */}
      <FloatingNavbar />

      <main className="flex-1">
        {/* 2. Interactive Living Learning Canvas Hero */}
        <InteractiveHeroCanvas onOpenAuth={handleOpenAuth} />

        {/* 3. Floating Trust Chips */}
        <TrustChips />

        {/* 4. Three Liquid Learning Models */}
        <LiquidLearningModels onOpenAuth={handleOpenAuth} />

        {/* 5. Teacher Discovery Carousel */}
        <TeacherCarousel onOpenAuth={handleOpenAuth} />

        {/* 6. Built-in Live Virtual Classroom Preview */}
        <LiveClassroomPreview onOpenAuth={handleOpenAuth} />

        {/* 7. Structured Pre-Recorded LMS Courses */}
        <CourseExperienceSection onOpenAuth={handleOpenAuth} />

        {/* 8. Flowing Animated Learning Journey */}
        <LearningJourneyPath />
      </main>

      {/* 9. Premium Glass Footer */}
      <PremiumFooter />

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={selectedRole}
      />
    </div>
  );
}
