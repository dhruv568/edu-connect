import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { NavigationHistoryTracker } from "@/components/providers/navigation-history-tracker";
import { AIAssistantProvider } from "@/components/ai/ai-assistant-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_MAIN_DOMAIN || "https://educonnects.co.in"),
  title: "EduConnects — Learn Better. Teach Smarter.",
  description: "Next-generation education platform connecting educators and learners with flexible learning models.",
  alternates: {
    canonical: "https://educonnects.co.in/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo-mark.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden`}>
        <NavigationHistoryTracker />
        <ToastProvider>{children}</ToastProvider>
        <AIAssistantProvider />
      </body>
    </html>
  );
}
