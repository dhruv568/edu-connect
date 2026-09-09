"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { GlassButton } from "@/components/glass/glass-button";
import { Settings, Percent, Layers, Shield, Save, Loader2, Plus, Check, Building2, Phone, FileText } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "company" | "commission" | "categories">("general");

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "EduConnects",
    supportEmail: "support@educonnects.com",
    allowRegistration: true,
    requireTeacherApproval: true,
    maintenanceMode: false,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Company Profile Settings State
  const [companySettings, setCompanySettings] = useState({
    brandName: OFFICIAL_COMPANY_INFO.brandName,
    legalName: OFFICIAL_COMPANY_INFO.legalName,
    cin: OFFICIAL_COMPANY_INFO.cin,
    pan: OFFICIAL_COMPANY_INFO.pan,
    founder: OFFICIAL_COMPANY_INFO.founder,
    authorizedSignatory: OFFICIAL_COMPANY_INFO.authorizedSignatory,
    registeredAddress: OFFICIAL_COMPANY_INFO.registeredAddress,
    website: OFFICIAL_COMPANY_INFO.website,
    tagline: OFFICIAL_COMPANY_INFO.tagline,
    governingLaw: OFFICIAL_COMPANY_INFO.governingLaw,
    whatsappNumber: OFFICIAL_COMPANY_INFO.whatsappNumber,
    refundPeriod: OFFICIAL_COMPANY_INFO.refundPeriod,
    pricingRange: OFFICIAL_COMPANY_INFO.pricingRange,
  });
  const [savingCompany, setSavingCompany] = useState(false);

  // Commission Settings State
  const [commissionRate, setCommissionRate] = useState(15.0);
  const [savingCommission, setSavingCommission] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchCommission();
    fetchCategories();
  }, []);

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.data) {
        setGeneralSettings({
          siteName: json.data.siteName || "EduConnects",
          supportEmail: json.data.supportEmail || "support@educonnects.com",
          allowRegistration: json.data.allowRegistration ?? true,
          requireTeacherApproval: json.data.requireTeacherApproval ?? true,
          maintenanceMode: json.data.maintenanceMode ?? false,
        });

        setCompanySettings({
          brandName: json.data.brandName || OFFICIAL_COMPANY_INFO.brandName,
          legalName: json.data.legalName || OFFICIAL_COMPANY_INFO.legalName,
          cin: json.data.cin || OFFICIAL_COMPANY_INFO.cin,
          pan: json.data.pan || OFFICIAL_COMPANY_INFO.pan,
          founder: json.data.founder || OFFICIAL_COMPANY_INFO.founder,
          authorizedSignatory: json.data.authorizedSignatory || OFFICIAL_COMPANY_INFO.authorizedSignatory,
          registeredAddress: json.data.registeredAddress || OFFICIAL_COMPANY_INFO.registeredAddress,
          website: json.data.website || OFFICIAL_COMPANY_INFO.website,
          tagline: json.data.tagline || OFFICIAL_COMPANY_INFO.tagline,
          governingLaw: json.data.governingLaw || OFFICIAL_COMPANY_INFO.governingLaw,
          whatsappNumber: json.data.whatsappNumber || OFFICIAL_COMPANY_INFO.whatsappNumber,
          refundPeriod: json.data.refundPeriod || OFFICIAL_COMPANY_INFO.refundPeriod,
          pricingRange: json.data.pricingRange || OFFICIAL_COMPANY_INFO.pricingRange,
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchCommission = async () => {
    try {
      const res = await fetch("/api/admin/payments/commission");
      const json = await res.json();
      if (json.data?.percentage !== undefined) setCommissionRate(json.data.percentage);
    } catch (err) {
      console.error("Failed to load commission:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/settings/categories");
      const json = await res.json();
      if (json.data?.categories) setCategories(json.data.categories);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const saveGeneralSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: generalSettings.siteName,
          support_email: generalSettings.supportEmail,
          allow_registration: generalSettings.allowRegistration,
          require_teacher_approval: generalSettings.requireTeacherApproval,
          maintenance_mode: generalSettings.maintenanceMode,
        }),
      });
      if (res.ok) alert("General settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const saveCompanySettings = async () => {
    setSavingCompany(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_brand_name: companySettings.brandName,
          company_legal_name: companySettings.legalName,
          company_cin: companySettings.cin,
          company_pan: companySettings.pan,
          company_founder: companySettings.founder,
          company_authorized_signatory: companySettings.authorizedSignatory,
          company_registered_address: companySettings.registeredAddress,
          company_website: companySettings.website,
          company_tagline: companySettings.tagline,
          company_governing_law: companySettings.governingLaw,
          company_whatsapp_number: companySettings.whatsappNumber,
          company_refund_period: companySettings.refundPeriod,
          company_pricing_range: companySettings.pricingRange,
        }),
      });
      if (res.ok) alert("Official company information updated successfully!");
    } catch (err) {
      console.error("Failed to save company settings:", err);
    } finally {
      setSavingCompany(false);
    }
  };

  const saveCommission = async () => {
    setSavingCommission(true);
    try {
      const res = await fetch("/api/admin/payments/commission", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentage: commissionRate }),
      });
      if (res.ok) alert("Platform commission updated successfully!");
    } catch (err) {
      console.error("Failed to save commission:", err);
    } finally {
      setSavingCommission(false);
    }
  };

  const createCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await fetch("/api/admin/settings/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, description: newCatDesc }),
      });
      const json = await res.json();
      if (res.ok) {
        setNewCatName("");
        setNewCatDesc("");
        fetchCategories();
      } else {
        alert(json.error?.message || "Failed to create category.");
      }
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setCreatingCat(false);
    }
  };

  const toggleCategoryActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/admin/settings/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      if (res.ok) fetchCategories();
    } catch (err) {
      console.error("Failed to toggle category active:", err);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="admin@educonnects.com">
      <div className="space-y-6 pb-16 font-sans">
        <div>
          <BackButton
            fallbackUrl="/admin"
            label="Back to Dashboard"
            variant="default"
            className="mb-3"
          />
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Platform Settings & Company Profile
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Centralized company identity, platform parameters, revenue commission rates, and course categories.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === "general"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Settings className="h-4 w-4" />
            General Settings
          </button>

          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === "company"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Company Profile
          </button>

          <button
            onClick={() => setActiveTab("commission")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === "commission"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Percent className="h-4 w-4" />
            Commission Settings
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === "categories"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="h-4 w-4" />
            Course Categories
          </button>
        </div>

        {/* Tab 1: General Settings */}
        {activeTab === "general" && (
          <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-6 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              General Configuration
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Platform Name</label>
                <input
                  type="text"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.allowRegistration}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, allowRegistration: e.target.checked })}
                    className="w-4 h-4 rounded-md text-blue-600"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Allow Public User Registrations</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.requireTeacherApproval}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, requireTeacherApproval: e.target.checked })}
                    className="w-4 h-4 rounded-md text-blue-600"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Require Admin Approval for Teacher Verification</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.maintenanceMode}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 rounded-md text-blue-600"
                  />
                  <span className="font-bold text-red-600">Enable Maintenance Mode (Restricts Student access)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <GlassButton
                variant="primary"
                size="sm"
                disabled={savingSettings}
                onClick={saveGeneralSettings}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save General Settings
              </GlassButton>
            </div>
          </Card>
        )}

        {/* Tab 2: Company Profile Settings */}
        {activeTab === "company" && (
          <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Official Company Profile Parameters</h3>
              <p className="text-xs text-slate-500">
                Manage business details displayed across footers, contact forms, pricing pages, and legal policies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={companySettings.brandName}
                  onChange={(e) => setCompanySettings({ ...companySettings, brandName: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Legal Company Name</label>
                <input
                  type="text"
                  value={companySettings.legalName}
                  onChange={(e) => setCompanySettings({ ...companySettings, legalName: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">CIN (Corporate Identification No.)</label>
                <input
                  type="text"
                  value={companySettings.cin}
                  onChange={(e) => setCompanySettings({ ...companySettings, cin: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-mono font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">PAN</label>
                <input
                  type="text"
                  value={companySettings.pan}
                  onChange={(e) => setCompanySettings({ ...companySettings, pan: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-mono font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Founder</label>
                <input
                  type="text"
                  value={companySettings.founder}
                  onChange={(e) => setCompanySettings({ ...companySettings, founder: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Authorized Signatory</label>
                <input
                  type="text"
                  value={companySettings.authorizedSignatory}
                  onChange={(e) => setCompanySettings({ ...companySettings, authorizedSignatory: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official WhatsApp Number</label>
                <input
                  type="text"
                  value={companySettings.whatsappNumber}
                  onChange={(e) => setCompanySettings({ ...companySettings, whatsappNumber: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official Website URL</label>
                <input
                  type="text"
                  value={companySettings.website}
                  onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={companySettings.tagline}
                  onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pricing Range Display</label>
                <input
                  type="text"
                  value={companySettings.pricingRange}
                  onChange={(e) => setCompanySettings({ ...companySettings, pricingRange: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Registered Address</label>
                <input
                  type="text"
                  value={companySettings.registeredAddress}
                  onChange={(e) => setCompanySettings({ ...companySettings, registeredAddress: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Refund Policy Period Note</label>
                <input
                  type="text"
                  value={companySettings.refundPeriod}
                  onChange={(e) => setCompanySettings({ ...companySettings, refundPeriod: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <GlassButton
                variant="primary"
                size="sm"
                disabled={savingCompany}
                onClick={saveCompanySettings}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Company Profile
              </GlassButton>
            </div>
          </Card>
        )}

        {/* Tab 3: Commission Settings */}
        {activeTab === "commission" && (
          <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-6 max-w-2xl">
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Platform Revenue Commission</h3>
              <p className="text-xs text-slate-500">
                Configure default percentage retained by EduConnects on course enrollments and live class bookings. Existing transactions maintain historical snapshot.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Platform Commission Rate (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-32 h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-bold text-base outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-extrabold text-slate-600 dark:text-slate-400">%</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-300 space-y-1">
                <span className="font-extrabold block">Commission Split Example:</span>
                <p>On a ₹1,000 booking with {commissionRate}% commission:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Platform Earns: ₹{(1000 * (commissionRate / 100)).toFixed(2)}</li>
                  <li>Educator Receives: ₹{(1000 * (1 - commissionRate / 100)).toFixed(2)}</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <GlassButton
                variant="primary"
                size="sm"
                disabled={savingCommission}
                onClick={saveCommission}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Update Commission Settings
              </GlassButton>
            </div>
          </Card>
        )}

        {/* Tab 4: Course Categories */}
        {activeTab === "categories" && (
          <div className="space-y-6 max-w-4xl">
            {/* Create Category Card */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-md font-black text-slate-900 dark:text-slate-100">Create New Course Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Data Science & AI"
                    className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Brief overview of category focus..."
                    className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <GlassButton
                variant="primary"
                size="sm"
                disabled={creatingCat || !newCatName.trim()}
                onClick={createCategory}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Category
              </GlassButton>
            </Card>

            {/* Categories Table */}
            <Card className="p-0 border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Courses Associated</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Toggle Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-bold">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-extrabold text-slate-900 dark:text-slate-100">{cat.name}</td>
                        <td className="p-4 text-slate-500 font-mono">{cat.slug}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{cat.courseCount} Courses</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              cat.isActive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {cat.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <GlassButton
                            variant="secondary"
                            className={!cat.isActive ? "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : ""}
                            size="sm"
                            onClick={() => toggleCategoryActive(cat.id, !cat.isActive)}
                          >
                            {cat.isActive ? "Deactivate" : "Activate"}
                          </GlassButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
