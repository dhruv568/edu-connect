"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, CheckCircle2, ArrowRight, Calendar, Clock, Phone, User } from "lucide-react";
import { liveEventConfig } from "@/lib/live-event-config";

export interface WhatsAppRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppRegistrationModal({
  isOpen,
  onClose,
}: WhatsAppRegistrationModalProps) {
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [nameError, setNameError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setWhatsappNumber("");
      setNameError("");
      setWhatsappError("");
      setIsSuccess(false);
      setServerMessage("");
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const validateForm = () => {
    let isValid = true;
    setNameError("");
    setWhatsappError("");

    if (!name.trim()) {
      setNameError("Please enter your name.");
      isValid = false;
    }

    const cleanNum = whatsappNumber.replace(/[\s\-\+\(\)]/g, "");
    const testNum = cleanNum.startsWith("91") && cleanNum.length === 12 ? cleanNum.slice(2) : cleanNum;

    if (!cleanNum) {
      setWhatsappError("Please enter a valid WhatsApp number.");
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(testNum)) {
      setWhatsappError("Please enter a valid 10-digit Indian WhatsApp number.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerMessage("");

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          whatsappNumber: whatsappNumber.trim(),
          eventSlug: liveEventConfig.slug,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setIsSuccess(true);
        setServerMessage(json.message || "🎉 You're Registered!");
      } else {
        const err = json.error || "Failed to register. Please try again.";
        if (err.toLowerCase().includes("name")) {
          setNameError(err);
        } else if (err.toLowerCase().includes("whatsapp") || err.toLowerCase().includes("number")) {
          setWhatsappError(err);
        } else {
          setServerMessage(err);
        }
      }
    } catch {
      setServerMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Dark Translucent Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl border-2 border-[#DCE5E4] shadow-2xl p-6 sm:p-8 overflow-hidden z-10 font-sans"
        >
          {/* Top Decorative Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0B4F4B] via-[#F2C14E] to-[#073F3C]" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#F5F7F8] text-[#102A2A] hover:bg-[#DCE5E4] transition-colors"
            aria-label="Close registration popup"
          >
            <X className="h-5 w-5" />
          </button>

          {!isSuccess ? (
            /* FORM STATE */
            <div className="space-y-5">
              {/* Header Icon & Title */}
              <div className="text-center space-y-2 pt-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0B4F4B] to-[#1B6863] p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-[0.9rem] bg-[#FBF7EE] flex items-center justify-center">
                    <Gift className="h-7 w-7 text-[#0B4F4B] animate-bounce" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#102A2A] tracking-tight flex items-center justify-center gap-1.5">
                  <span>Welcome to EduConnects</span>
                </h3>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#0B4F4B]">
                    Hum Aapka Tahe Dil Se Swagat Karte Hain
                  </p>
                  <p className="text-xs font-semibold text-[#5D7373]">
                    Kripya Hamein Apna Vivaran Dein
                  </p>
                </div>
              </div>

              {serverMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
                  {serverMessage}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* Aapka Naam */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#102A2A] uppercase tracking-wider">
                    Aapka Naam <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5D7373]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Apna naam likhiye"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-[#102A2A] text-sm font-semibold placeholder:text-[#5D7373] focus:outline-none transition-all ${
                        nameError
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#DCE5E4] focus:border-[#0B4F4B] focus:ring-2 focus:ring-[#0B4F4B]/20"
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-[11px] font-bold text-red-600 pl-1">{nameError}</p>
                  )}
                </div>

                {/* Aapka WhatsApp No. */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#102A2A] uppercase tracking-wider">
                    Aapka WhatsApp No. <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5D7373] font-bold text-xs">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="WhatsApp number"
                      maxLength={14}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-white text-[#102A2A] text-sm font-semibold placeholder:text-[#5D7373] focus:outline-none transition-all ${
                        whatsappError
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#DCE5E4] focus:border-[#0B4F4B] focus:ring-2 focus:ring-[#0B4F4B]/20"
                      }`}
                    />
                  </div>
                  {whatsappError && (
                    <p className="text-[11px] font-bold text-red-600 pl-1">{whatsappError}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-full bg-[#0B4F4B] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg hover:bg-[#073F3C] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <span>Submit & Join Us</span>
                      <ArrowRight className="h-4 w-4 text-[#F2C14E] group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Shagun note */}
              <div className="text-center pt-1">
                <p className="text-xs font-bold text-[#0B4F4B] italic">
                  Taki Shagun Ki Mithai Hum Aapko Bhijwa Saken. 🎁
                </p>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#DCE5E4] text-center">
                <p className="text-xs font-extrabold text-[#102A2A]">
                  Thank You! • EduConnects Family ❤️
                </p>
              </div>
            </div>
          ) : (
            /* SUCCESS STATE */
            <div className="text-center space-y-5 py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#102A2A]">🎉 You&apos;re Registered!</h3>
                <p className="text-sm font-semibold text-[#5D7373]">
                  Welcome to the EduConnects family.
                </p>
              </div>

              {/* Event Time Summary Card */}
              <div className="p-4 rounded-2xl bg-[#FBF7EE] border border-[#DCE5E4] text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#102A2A]">
                  <Calendar className="h-4 w-4 text-[#0B4F4B]" />
                  <span>{liveEventConfig.displayDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#102A2A]">
                  <Clock className="h-4 w-4 text-[#0B4F4B]" />
                  <span>{liveEventConfig.displayTime}</span>
                </div>
              </div>

              <p className="text-xs font-extrabold text-[#0B4F4B]">
                We&apos;ll see you at the Live Event! ❤️
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-full bg-[#0B4F4B] text-white font-extrabold text-xs uppercase tracking-wider hover:bg-[#073F3C] transition-colors"
              >
                Back to Event
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
