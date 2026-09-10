import { Metadata } from "next";
import { LivePageClient } from "./live-client";
import { getLiveDomain } from "@/lib/app-url";

const liveDomain = getLiveDomain();

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
  metadataBase: new URL(liveDomain),
  alternates: {
    canonical: liveDomain,
  },
  openGraph: {
    title: "EduConnects Live | Learn • Connect • Grow",
    description:
      "Join EduConnects Live for interactive learning, live sessions, educator connections and a stronger learning community.",
    url: liveDomain,
    siteName: "EduConnects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${liveDomain}/icon.svg`,
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
    images: [`${liveDomain}/icon.svg`],
  },
};

export default function LivePage() {
  return <LivePageClient />;
}
