"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  User,
  BookOpen,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";
import { useToast } from "@/components/ui/toast";

interface TrainingSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  programConfig?: {
    batchDate?: string;
    seatsNotice?: string;
    price?: number;
    requiresPayment?: boolean;
  } | null;
  defaultRole?: string;
}

export function TrainingSeatModal({
  isOpen,
  onClose,
  programConfig,
  defaultRole = "Teacher",
}: TrainingSeatModalProps) {
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("3-5");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    reservationId: string;
    name: string;
    phone: string;
    message: string;
    alreadyRegistered?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill logged in user if available
  useEffect(() => {
    if (isOpen && !fullName && !email) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.data?.user) {
            const u = json.data.user;
            const combinedName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name || "";
            if (combinedName) setFullName(combinedName);
            if (u.email) setEmail(u.email);
            if (u.phone) setPhone(u.phone);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, fullName, email]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit Indian WhatsApp/mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teacher/training/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          role: role || "Teacher",
          subject: subject.trim() || "General",
          experienceYears: experience,
          notes: notes.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to process your registration.");
      }

      const data = json.data;

      // Check if Cashfree checkout is required
      if (data.requiresPayment && data.paymentSessionId) {
        showToast("Redirecting to Cashfree...", "Initiating secure training fee payment", "info");
        // In test mode / mock or production Cashfree SDK
        if (typeof window !== "undefined" && (window as any).Cashfree) {
          const cashfree = (window as any).Cashfree({ mode: data.env === "PRODUCTION" ? "production" : "sandbox" });
          cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_self",
          });
          return;
        } else {
          // Cashfree standard hosted checkout fallback
          const checkoutUrl =
            data.env === "PRODUCTION"
              ? `https://payments.cashfree.com/order/#${data.paymentSessionId}`
              : `https://sandbox.cashfree.com/order/#${data.paymentSessionId}`;
          window.location.href = checkoutUrl;
          return;
        }
      }

      // Seat Reservation successful
      setSuccessData({
        reservationId: data.reservationId || "EDU-TRN-CONFIRMED",
        name: data.name || fullName,
        phone: data.phone || cleanPhone,
        message: data.message || "Your seat is confirmed!",
        alreadyRegistered: data.alreadyRegistered,
      });

      showToast("Seat Reserved! 🎉", "Your 15-day training seat has been confirmed.", "success");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reserve seat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (successData?.reservationId) {
      navigator.clipboard.writeText(successData.reservationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden z-10 my-8"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0D5C41] to-[#16805B] px-6 py-6 text-white relative">
              <button
                type="button"
                onClick={handleResetAndClose}
                aria-label="Close modal"
                className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold mb-2">
                <Sparkles className="h-3.5 w-3.5 text-[#35A979]" />
                <span>EduConnects Educator Academy</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Reserve Your Training Seat
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                15 Days • Practical Online Teaching Mastery • Expert Guidance
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 bg-[#083F2C]/80 px-2.5 py-1 rounded-lg text-emerald-200 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-[#35A979]" />
                  {programConfig?.batchDate || "Next Batch Starting Soon"}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#083F2C]/80 px-2.5 py-1 rounded-lg text-emerald-200 font-medium">
                  <Clock className="h-3.5 w-3.5 text-[#35A979]" />
                  {programConfig?.seatsNotice || "Seats for the upcoming batch are limited."}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
              {successData ? (
                /* Success View */
                <div className="text-center py-4 space-y-6">
                  <div className="w-16 h-16 bg-[#F0FAF5] border-2 border-[#16805B] text-[#16805B] rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="h-9 w-9 text-[#16805B]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {successData.alreadyRegistered
                        ? "Reservation Already Confirmed!"
                        : "Seat Successfully Reserved!"}
                    </h3>
                    <p className="text-sm text-slate-650 leading-relaxed max-w-md mx-auto">
                      Congratulations <span className="font-bold text-slate-900">{successData.name}</span>!
                      Your seat for the 15-Day Teachers Training Program has been placed on the verified batch roster.
                    </p>
                  </div>

                  {/* Reservation Code Box */}
                  <div className="bg-[#F0FAF5] border border-emerald-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#0D5C41] font-bold uppercase tracking-wider">
                      <span>Seat Reservation ID</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-100 shadow-xs">
                      <span className="font-mono text-base sm:text-lg font-black text-[#16805B]">
                        {successData.reservationId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#16805B] bg-[#F0FAF5] hover:bg-emerald-100/60 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600">
                      Our educator relations team will connect with you via WhatsApp (
                      <span className="font-semibold text-slate-900">{successData.phone}</span>) with the syllabus preview, live classroom tools, and orientation link.
                    </p>
                  </div>

                  <div className="pt-2">
                    <GlassButton
                      variant="primary"
                      className="w-full justify-center py-3 text-sm font-bold bg-[#16805B] hover:bg-[#0D5C41] text-white rounded-xl shadow-md cursor-pointer"
                      onClick={handleResetAndClose}
                    >
                      Done & Return to Program
                    </GlassButton>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Sharma / Priya Nair"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16805B] focus:ring-2 focus:ring-[#16805B]/20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="teacher@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16805B] focus:ring-2 focus:ring-[#16805B]/20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        WhatsApp Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="10-digit mobile"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16805B] focus:ring-2 focus:ring-[#16805B]/20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Current Profile / Role
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16805B] focus:ring-2 focus:ring-[#16805B]/20 text-sm text-slate-900 outline-none transition-all bg-white"
                        >
                          <option value="School Teacher">School Teacher</option>
                          <option value="Private Tutor">Private Tutor / Home Tutor</option>
                          <option value="Coaching Faculty">Coaching Institute Faculty</option>
                          <option value="Subject Expert">Subject Matter Expert</option>
                          <option value="Corporate Trainer">Corporate / Skill Trainer</option>
                          <option value="College Lecturer">College Lecturer / Professor</option>
                          <option value="Aspiring Educator">Aspiring Online Educator</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Primary Subject / Domain
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Mathematics, Science, English"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16805B] focus:ring-2 focus:ring-[#16805B]/20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Teaching / Training Experience
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16805B] focus:ring-2 focus:ring-[#16805B]/20 text-sm text-slate-900 outline-none transition-all bg-white"
                    >
                      <option value="0-1">Less than 1 year</option>
                      <option value="1-3">1 to 3 years</option>
                      <option value="3-5">3 to 5 years</option>
                      <option value="5-10">5 to 10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  {/* Notice Box */}
                  <div className="p-3 bg-[#F0FAF5] rounded-xl border border-emerald-200/60 text-xs text-[#0D5C41] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#16805B] shrink-0" />
                    <span>
                      Guaranteed seat reservation for upcoming batch. No obligation, 100% educator-focused orientation.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#16805B] to-[#0D5C41] hover:from-[#137150] hover:to-[#094732] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Reserving Your Seat...</span>
                        </>
                      ) : (
                        <>
                          <span>RESERVE MY SEAT NOW</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-slate-650">
                    By submitting, you agree to receive training schedules and updates from EduConnects via WhatsApp & Email.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
