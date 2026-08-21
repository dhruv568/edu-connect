/**
 * Provider-agnostic analytics event tracking abstraction.
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  const event: AnalyticsEvent = {
    name: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.log("📊 [ANALYTICS EVENT]:", event.name, event.properties || "");
  }

  // Integration point for Segment / PostHog / Mixpanel / Google Analytics
}
