import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { NavigationHistoryTracker } from "@/components/providers/navigation-history-tracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduConnects — Learn Better. Teach Smarter.",
  description: "Next-generation education platform connecting teachers and students with flexible learning models.",
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
      </body>
    </html>
  );
}
