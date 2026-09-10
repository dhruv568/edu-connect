import { Metadata } from "next";
import { LivePageClient } from "./live-client";

export const metadata: Metadata = {
  title: "EduConnects Live | Learn • Connect • Grow",
  description:
    "Join EduConnects Live for interactive learning, live sessions, educator connections and a stronger learning community.",
  keywords: [
    "EduConnects Live",
    "EduConnects Grand Opening",
    "Live Learning India",
    "Online Tutors India",
    "Interactive Classroom",
    "EduConnects Event",
  ],
  authors: [{ name: "EduConnects" }],
  metadataBase: new URL("https://educonnects.co.in"),
  alternates: {
    canonical: "https://educonnects.co.in/live",
  },
  openGraph: {
    title: "EduConnects Live | Learn • Connect • Grow",
    description:
      "Join EduConnects Live for interactive learning, live sessions, educator connections and a stronger learning community.",
    url: "https://educonnects.co.in/live",
    siteName: "EduConnects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://educonnects.co.in/icon.svg",
        width: 1200,
        height: 630,
        alt: "EduConnects Live Event",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduConnects Live | Learn • Connect • Grow",
    description:
      "Join EduConnects Live for interactive learning, live sessions, educator connections and a stronger learning community.",
    images: ["https://educonnects.co.in/icon.svg"],
  },
};

export default function LivePage() {
  return <LivePageClient />;
}
