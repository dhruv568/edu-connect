"use client";

import React, { useState, useEffect } from "react";
import { LiveHeader } from "@/components/live/live-header";
import { LiveHero } from "@/components/live/live-hero";
import { LiveSessionSection } from "@/components/live/live-session-section";
import { LiveExperienceSection } from "@/components/live/live-experience-section";
import { WhyLiveSection } from "@/components/live/why-live-section";
import { LiveScheduleSection } from "@/components/live/live-schedule-section";
import { WhatsAppRegistrationModal } from "@/components/live/whatsapp-registration-modal";
import { LiveFooter } from "@/components/live/live-footer";
import { liveEventConfig, getEventStatus, EventStatus } from "@/lib/live-event-config";

export function LivePageClient() {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [eventStatus, setEventStatus] = useState<EventStatus>("BEFORE_EVENT");

  useEffect(() => {
    // Evaluate event status initial & on timer tick
    const updateStatus = () => {
      setEventStatus(getEventStatus());
    };
    updateStatus();
    const interval = setInterval(updateStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true);
  };

  const handleScrollToLiveSession = () => {
    const el = document.getElementById("live-session");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F8] text-[#102A2A] overflow-x-hidden selection:bg-[#F2C14E]/30 selection:text-[#0B4F4B] font-sans">
      {/* 1. White Header with Live Event Pill Button */}
      <LiveHeader onRegisterClick={handleOpenRegisterModal} />

      <main className="flex-1">
        {/* 2. Hero Section with Deep Maroon Theme, Countdown & Artwork */}
        <LiveHero
          eventStatus={eventStatus}
          onOpenRegisterModal={handleOpenRegisterModal}
          onJoinLiveClick={handleScrollToLiveSession}
        />

        {/* 3. Live Session Container Section (Before / During / After) */}
        <LiveSessionSection
          eventStatus={eventStatus}
          onOpenRegisterModal={handleOpenRegisterModal}
        />

        {/* 4. "What You'll Experience" 4-Card Section (Light Cream Background) */}
        <LiveExperienceSection />

        {/* 5. "Why Join EduConnects Live?" 4-Block Section (Deep Maroon Theme, No Fake Stats) */}
        <WhyLiveSection />

        {/* 6. Data-driven Live Event Schedule Timeline Section */}
        <LiveScheduleSection />
      </main>

      {/* 7. Dark Footer without Parents section */}
      <LiveFooter />

      {/* 8. WhatsApp Registration Popup Modal */}
      <WhatsAppRegistrationModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}
