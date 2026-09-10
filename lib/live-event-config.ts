export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  speaker?: string;
  icon?: string;
  isHighlight?: boolean;
}

export interface LiveEventConfig {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  startDateTime: string; // ISO String with IST timezone offset: 2026-09-14T10:10:00+05:30
  endDateTime: string;   // ISO String with IST timezone offset: 2026-09-14T12:00:00+05:30
  displayDate: string;   // "Monday, 14th September 2026"
  displayTime: string;   // "10:10 AM IST"
  timezone: string;      // "Asia/Kolkata"
  heroBadge: string;
  heroHeadline: string;
  heroHeadlineHighlight: string;
  heroSubheadline: string;
  heroDescription: string;
  liveUrl?: string | null;
  recordingUrl?: string | null;
  registrationEnabled: boolean;
  whatsappGroupUrl?: string;
  schedule: ScheduleItem[];
}

export const liveEventConfig: LiveEventConfig = {
  slug: "educonnects-grand-opening",
  title: "EduConnects Grand Opening on Ganesh Chaturthi",
  subtitle: "New Beginnings with Bappa's Blessings • Learn. Connect. Grow.",
  description:
    "Education Removes Every Obstacle. Join the live grand opening of EduConnects on the auspicious occasion of Ganesh Chaturthi with Founder Neeraj Shrivastava.",
  startDateTime: "2026-09-14T10:10:00+05:30",
  endDateTime: "2026-09-14T12:00:00+05:30",
  displayDate: "Monday, 14th September 2026",
  displayTime: "10:10 AM IST",
  timezone: "Asia/Kolkata",
  heroBadge: "🚩 GANESH CHATURTHI GRAND OPENING • EDUCONNECTS LIVE",
  heroHeadline: "New Beginnings with Bappa's Blessings",
  heroHeadlineHighlight: "Bappa's Blessings",
  heroSubheadline: "Education Removes Every Obstacle — Let's Build Brighter Futures Together",
  heroDescription:
    "Join Founder Neeraj Shrivastava & top educators live as we inaugurate EduConnects. Experience live interactive classrooms, instant Q&A, and empower learners across India.",
  liveUrl: null, // Will use internal LiveKit server session when available
  recordingUrl: null,
  registrationEnabled: true,
  whatsappGroupUrl: "https://wa.me/918062181499",
  schedule: [
    {
      time: "10:10 AM IST",
      title: "Festive Welcome & Bappa's Blessings",
      description: "Opening address by Founder Neeraj Shrivastava, Ganesh Chaturthi inauguration, and platform reveal.",
      speaker: "Neeraj Shrivastava (Founder)",
      isHighlight: true,
    },
    {
      time: "10:25 AM IST",
      title: "Welcome to EduConnects Live",
      description: "Discover how real-time live classrooms connect students with top tutors across India.",
      speaker: "Lead Educator Panel",
    },
    {
      time: "10:40 AM IST",
      title: "The Vision of Connected Education",
      description: "Interactive showcase of liquid learning models, 1-on-1 tutoring, and group classrooms.",
      speaker: "EduConnects Mentors",
    },
    {
      time: "10:55 AM IST",
      title: "Live Learning & Educator Showcase",
      description: "Live interactive class demo showcasing instant Q&A, digital whiteboard, and instant feedback.",
      isHighlight: true,
    },
    {
      time: "11:15 AM IST",
      title: "Quality Education & Growth Roadmaps",
      description: "Empowering educators and creating new opportunities for a stronger learning community.",
    },
    {
      time: "11:35 AM IST",
      title: "Open Q&A & Interactive Discussion",
      description: "Direct interaction with Founder Neeraj Shrivastava and mentors, answering student queries live.",
      speaker: "Neeraj Shrivastava & Mentors",
    },
  ],
};

/**
 * Determine current event state dynamically based on configured start and end timestamps.
 */
export type EventStatus = "BEFORE_EVENT" | "DURING_EVENT" | "AFTER_EVENT";

export function getEventStatus(
  config: LiveEventConfig = liveEventConfig,
  now: Date = new Date()
): EventStatus {
  const startTime = new Date(config.startDateTime).getTime();
  const endTime = new Date(config.endDateTime).getTime();
  const currentTime = now.getTime();

  if (currentTime < startTime) {
    return "BEFORE_EVENT";
  } else if (currentTime >= startTime && currentTime <= endTime) {
    return "DURING_EVENT";
  } else {
    return "AFTER_EVENT";
  }
}
