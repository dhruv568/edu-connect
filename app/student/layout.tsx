import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "EduConnects for Students",
  description:
    "Connect with verified top-tier educators, join interactive live video classrooms with real-time digital whiteboards, and master structured self-paced courses on EduConnects.",
  alternates: {
    canonical: "https://students.educonnects.co.in/",
  },
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
