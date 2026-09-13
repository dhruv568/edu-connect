import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { MAX_HISTORY_MESSAGES } from "@/lib/ai/rate-limiter";

export type AssistantRole = "ADMIN" | "EDUCATOR" | "LEARNER" | "guest";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiChatOptions {
  message: string;
  conversationId?: string;
  userId?: string;
  role: AssistantRole;
  userEmail?: string;
  userName?: string;
}

export interface AiChatResult {
  response: string;
  conversationId: string;
  role: AssistantRole;
  isFallback?: boolean;
}

const DEFAULT_MODEL = "gpt-4o-mini";
const TEMPORARY_UNAVAILABLE_MESSAGE =
  "Sorry, the EduConnects Assistant is temporarily unavailable. Please try again in a moment.";

/**
 * Filter out sensitive patterns like passwords, OTPs, Aadhaar, bank numbers
 */
function sanitizeContent(text: string): string {
  if (!text) return "";
  return text
    .replace(/\b\d{6}\b/g, "[REDACTED_OTP]") // 6-digit OTPs
    .replace(/\b\d{12}\b/g, "[REDACTED_AADHAAR]") // 12-digit Aadhaar
    .replace(/\b[A-Z]{4}0[A-Z0-9]{6}\b/gi, "[REDACTED_IFSC]") // IFSC
    .replace(/password\s*[:=]\s*\S+/gi, "password: [REDACTED]");
}

/**
 * Build dynamic role-specific system prompt with verified platform context
 */
async function buildSystemPrompt(role: AssistantRole, userId?: string, userName?: string): Promise<string> {
  const baseIdentity = `You are the EduConnects AI Assistant, the official native assistant for the EduConnects learning and teaching platform.
Your identity:
- You are "EduConnects AI Assistant".
- You are NOT ChatGPT, OpenAI Assistant, or GPT Bot. Never mention OpenAI, GPT, or LLM.
- You speak as EduConnects' own helpful team member.
- Tone: Friendly, concise, professional, clear, and reassuring.
- Keep answers compact (usually 2 to 4 paragraphs or bullet points). Avoid long walls of text.
- STRICT RULE: You are informational and advisory only. NEVER claim you performed actions (e.g. "I booked your class", "I verified your account", "I refunded your payment"). You cannot modify database records. Explain the exact steps the user should take instead.
- If you lack specific details or do not know an answer: "I don't have enough information about that yet. Please contact EduConnects support at support@educonnects.co.in or visit the Contact page."
- NEVER mention parents, parent portal, or parent accounts. EduConnects supports Learners, Educators, and Admins.`;

  let roleInstructions = "";
  let dynamicContext = "";

  if (role === "ADMIN") {
    // Admin context
    let pendingTeachersCount = 0;
    let totalUsers = 0;
    let totalCourses = 0;
    try {
      [pendingTeachersCount, totalUsers, totalCourses] = await Promise.all([
        prisma.teacherProfile.count({ where: { verificationStatus: "PENDING" } }),
        prisma.user.count(),
        prisma.course.count(),
      ]);
      dynamicContext = `Platform Overview: Total Users: ${totalUsers}, Total Courses: ${totalCourses}, Educator Verification Queue Pending: ${pendingTeachersCount}.`;
    } catch {
      // Graceful fallback
    }

    roleInstructions = `
You are interacting with an authenticated EduConnects ADMINISTRATOR / STAFF MEMBER.
Your role is to help them navigate and manage the EduConnects Admin Portal.
${dynamicContext ? `Current System Context: ${dynamicContext}` : ""}

Admin Navigation & Platform Structure:
- Dashboard: /admin/dashboard - High-level metrics, revenue overview, recent signups.
- Educator Verification: /admin/verification - Review submitted teacher documents, qualifications, and approve or reject profiles with audit logging.
- User Management: /admin/users - Search users, view role status, suspend or reactivate accounts.
- Course Moderation: /admin/courses - Review published courses, check curriculum quality, and approve/unpublish courses.
- Live Classes Oversight: /admin/live-classes - Monitor ongoing/scheduled live sessions and LiveKit room status.
- Roles & Permissions: /admin/roles and /admin/staff - Manage custom dynamic RBAC roles, invite staff members with specific granular permissions.
- Payments & Financial Ledger: /admin/payments and /admin/refunds - Review Cashfree transactions, handle disputes, approve refunds.
- Analytics & Reports: /admin/analytics and /admin/reports - View platform trends, revenue breakdown, export CSV reports.
- System Health: /admin/system-health - Real-time diagnostics, background queues, email delivery logs.`;
  } else if (role === "EDUCATOR") {
    // Educator context
    let verificationStatus = "PENDING";
    let courseCount = 0;
    if (userId) {
      try {
        const teacherProfile = await prisma.teacherProfile.findUnique({
          where: { userId },
          select: { verificationStatus: true, courses: { select: { id: true } } },
        });
        if (teacherProfile) {
          verificationStatus = teacherProfile.verificationStatus;
          courseCount = teacherProfile.courses.length;
          dynamicContext = `Educator's Current Status: Verification is ${verificationStatus}. Courses created: ${courseCount}.`;
        }
      } catch {}
    }

    roleInstructions = `
You are interacting with an authenticated EDUCATOR (Teacher).
Your role is to help them teach, set up courses, manage live classes, and get verified on EduConnects.
${userName ? `Educator Name: ${userName}.` : ""}
${dynamicContext ? `Account Details: ${dynamicContext}` : ""}

Educator Navigation & Platform Features:
- Educator Dashboard: /teacher/dashboard (or /dashboard on educators.educonnects.co.in) - View class schedule, total earnings, active students, and course performance.
- Verification & Onboarding: /teacher/verification - Upload identity proof, degrees/qualifications, certificates, and bank account / cancelled cheque for payouts. Statuses: PENDING, VERIFIED, REJECTED.
- Course Management: /teacher/courses - Create new video courses, organize chapters/lessons, upload videos via Mux, set pricing in INR (₹).
- Live Classes: /teacher/live-classes - Schedule upcoming live classes, set 1-on-1 or group slots, configure trial lessons, and enter the LiveKit interactive classroom.
- Earnings & Payouts: /teacher/earnings - View accumulated student payments, commission breakdowns, completed payout transfers, and configure Cashfree payout details.
- Profile Settings: /profile - Update teaching headline, bio, subjects, hourly rates, and avatar.
- Support: /contact - Reach out to EduConnects team.
DO NOT disclose admin dashboard links or other educators' private financials.`;
  } else if (role === "LEARNER") {
    // Learner context
    let enrollmentsCount = 0;
    if (userId) {
      try {
        enrollmentsCount = await prisma.enrollment.count({ where: { studentId: userId } });
        dynamicContext = `Learner's Current Status: Enrolled in ${enrollmentsCount} courses.`;
      } catch {}
    }

    roleInstructions = `
You are interacting with an authenticated LEARNER (Student).
Your role is to help them learn, discover courses, book verified educators, join live classes, and manage their learning journey.
${userName ? `Learner Name: ${userName}.` : ""}
${dynamicContext ? `Account Details: ${dynamicContext}` : ""}

Learner Navigation & Platform Features:
- Learner Dashboard: /student/dashboard (or /dashboard on learners.educonnects.co.in) - View learning progress, upcoming live sessions, and recent announcements.
- My Courses: /student/courses - Access all purchased courses, watch lessons, track progress, download study resources.
- Live Classes & Trials: /student/live-classes - View booked live sessions, join active LiveKit classrooms, and schedule trial classes with teachers.
- Find Educators: /find-teachers - Search verified educators by subject, price, rating, and language. Book trial or regular sessions directly.
- Browse Courses: /courses - Explore comprehensive recorded courses with curriculum previews.
- Payments & Receipts: /student/payments - View invoice receipts, order history, and refund requests.
- Profile & Settings: /profile - Update personal information, learning goals, and notification preferences.
- Support: /contact - Reach out for technical or learning assistance.
DO NOT disclose educator payout information or admin features.`;
  } else {
    // Guest context
    roleInstructions = `
You are interacting with a PUBLIC VISITOR (Guest) browsing the EduConnects platform.
Your role is to welcome them, explain EduConnects, guide them to relevant learning or teaching options, and help them register or sign in.

Platform Features for Visitors:
- What is EduConnects: A next-generation education platform connecting learners with verified expert educators for both interactive live classes and on-demand recorded courses.
- Explore Courses: /courses - Browse all curated courses.
- Find Verified Educators: /find-teachers - Filter by subject, experience, and hourly rates.
- Join as a Learner: /register/student - Create a free learner account to book trials and enroll in courses.
- Teach on EduConnects: /register/teacher - Apply as an educator to earn by teaching online.
- How It Works: /how-it-works - Understand live classes, 1-on-1 trials, and secure payment workflows.
- Pricing & Guarantee: Transparent INR (₹) pricing, secure transactions, and money-back refund guarantee.
- Sign In: /login - Sign in with email and secure OTP.
- Contact Support: /contact or support@educonnects.co.in.
Encourage them to explore courses, find teachers, or sign up.`;
  }

  return `${baseIdentity}\n\n${roleInstructions}`;
}

/**
 * Rule-based fallback response engine for offline / unconfigured OpenAI environments
 */
function generateFallbackResponse(userMessage: string, role: AssistantRole): string {
  const query = userMessage.toLowerCase().trim();

  // Guest / General Queries
  if (query.includes("what is educonnects") || query.includes("about educonnects")) {
    return "EduConnects is a next-generation education platform connecting passionate learners with verified expert educators. We offer interactive 1-on-1 and group live classes, trial lessons, and comprehensive self-paced video courses with transparent pricing in INR (₹).";
  }

  if (query.includes("find an educator") || query.includes("find a teacher") || query.includes("find teachers")) {
    return "You can find verified educators by visiting our [Find Educators](/find-teachers) page. You can filter educators by subject, experience, rating, and hourly rate, and view their qualifications before booking a trial class.";
  }

  if (query.includes("find a course") || query.includes("find courses") || query.includes("browse courses")) {
    return "Explore our complete catalog of video courses on the [Courses](/courses) page. Each course features an in-depth curriculum preview, instructor background, and lifetime access to study materials.";
  }

  if (query.includes("become an educator") || query.includes("teach on educonnects") || query.includes("how do i join as a teacher")) {
    return "To start teaching on EduConnects, register as an educator at [Join as Educator](/register/teacher). Once registered, complete your onboarding and verification profile by uploading your qualifications and documents to get verified.";
  }

  if (query.includes("contact support") || query.includes("help") || query.includes("support")) {
    return "You can reach our support team anytime via our [Contact Page](/contact) or email us directly at support@educonnects.co.in. We're here to help!";
  }

  // Learner Specific Queries
  if (query.includes("how do live classes work")) {
    return "Live classes on EduConnects take place in our built-in interactive classroom powered by HD video, screen sharing, real-time chat, and collaborative tools. You can book scheduled sessions from your [Live Classes](/student/live-classes) page and join when the session begins.";
  }

  if (query.includes("book a trial") || query.includes("trial lesson")) {
    return "To book a trial lesson, head over to [Find Educators](/find-teachers), choose an educator who offers trial sessions, and click **Book Trial**. You can pick a convenient time slot from their availability calendar.";
  }

  if (query.includes("see my courses") || query.includes("where are my courses") || query.includes("my courses")) {
    return role === "LEARNER"
      ? "You can view all your enrolled courses and watch lessons on your [My Courses](/student/courses) page."
      : "Learners can view all their enrolled courses on their [My Courses](/student/courses) dashboard.";
  }

  if (query.includes("update my profile") || query.includes("edit profile")) {
    return "You can update your personal details, bio, photo, and notification preferences anytime on your [Profile Settings](/profile) page.";
  }

  // Educator Specific Queries
  if (query.includes("create a course") || query.includes("upload course")) {
    return "To create a course, navigate to your [Educator Courses](/teacher/courses) dashboard and click **Create Course**. You can add chapters, upload video lessons with streaming optimization, and set your course pricing.";
  }

  if (query.includes("become verified") || query.includes("verification") || query.includes("upload documents")) {
    return "To get verified as an educator, visit your [Verification Dashboard](/teacher/verification). Upload your government ID, degree certificates, and cancelled cheque/bank details. Our admin team reviews submissions promptly!";
  }

  if (query.includes("create a live class") || query.includes("schedule a class")) {
    return "You can schedule live classes from your [Live Classes Manager](/teacher/live-classes). Set the date, time, duration, maximum learner capacity, and fee per student.";
  }

  if (query.includes("how do payouts work") || query.includes("payouts") || query.includes("earnings")) {
    return "Educator payouts are tracked in your [Earnings Dashboard](/teacher/earnings). Once verified, your earnings are deposited directly into your linked bank account according to our scheduled payout cycles.";
  }

  // Admin Specific Queries
  if (query.includes("admin dashboard") || query.includes("explain admin")) {
    return "The [Admin Dashboard](/admin/dashboard) gives you real-time visibility over user registrations, revenue streams, educator verification queues, and active live sessions across EduConnects.";
  }

  if (query.includes("verify educators") || query.includes("educator verification queue")) {
    return "You can review pending educator verification requests on the [Educator Verification](/admin/verification) page. Inspect uploaded ID cards, degrees, and certificates, then approve or reject with comments.";
  }

  if (query.includes("user management")) {
    return "Manage learners, educators, and staff accounts from the [User Management](/admin/users) panel. You can search users, inspect activity logs, and manage account statuses.";
  }

  // Default fallback answer for known context
  if (role === "ADMIN") {
    return "I'm here to help you navigate the EduConnects Admin Portal. You can manage verification queues, monitor live classes, inspect user accounts, review courses, or check system health. What would you like to explore?";
  }

  if (role === "EDUCATOR") {
    return "Welcome to the Educator Portal! I can guide you through course creation, scheduling live classes, uploading verification documents, and tracking your earnings. How can I assist your teaching today?";
  }

  if (role === "LEARNER") {
    return "Welcome to EduConnects! I can help you find courses, book trial lessons with top educators, join your live classes, or navigate your learner dashboard. What are you looking to learn today?";
  }

  return "Hi! I'm the EduConnects Assistant. I can help you find courses, educators, understand live classes, and navigate the platform. What can I help you with?";
}

/**
 * Handle chat conversation request with OpenAI and database persistence
 */
export async function processAiChat(options: AiChatOptions): Promise<AiChatResult> {
  const { message, userId, role, userName } = options;
  const sanitizedMessage = sanitizeContent(message);

  // 1. Resolve or create conversation in DB if authenticated or conversation ID provided
  let conversationId = options.conversationId;
  let historyMessages: ChatMessage[] = [];

  if (conversationId) {
    try {
      const existing = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: MAX_HISTORY_MESSAGES,
          },
        },
      });

      if (existing) {
        historyMessages = existing.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      }
    } catch {
      // Non-blocking fallback
    }
  }

  // 2. Prepare OpenAI messages
  const systemPrompt = await buildSystemPrompt(role, userId, userName);
  const promptMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages.map((m) => ({
      role: m.role,
      content: sanitizeContent(m.content),
    })),
    { role: "user", content: sanitizedMessage },
  ];

  // 3. Check for OPENAI_API_KEY
  const apiKey = process.env.OPENAI_API_KEY;
  const configuredModel = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  let assistantResponse = "";
  let isFallback = false;

  if (apiKey && apiKey.trim().length > 0 && !apiKey.includes("your_openai_api_key_here")) {
    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: configuredModel,
        messages: promptMessages,
        max_tokens: 700,
        temperature: 0.7,
      });

      assistantResponse = completion.choices?.[0]?.message?.content?.trim() || "";
    } catch (err: any) {
      console.error("[AiService] OpenAI API error:", err?.message || err);
      // Fall back to rule-based contextual answer if possible, or friendly error message
      assistantResponse = generateFallbackResponse(sanitizedMessage, role);
      isFallback = true;
    }
  } else {
    // API key not configured: provide smart native fallback
    assistantResponse = generateFallbackResponse(sanitizedMessage, role);
    isFallback = true;
  }

  if (!assistantResponse) {
    assistantResponse = TEMPORARY_UNAVAILABLE_MESSAGE;
  }

  // 4. Persist conversation and messages to Prisma DB if user is authenticated or conversation exists
  try {
    if (!conversationId) {
      const newConv = await prisma.aiConversation.create({
        data: {
          userId: userId || null,
          role: role,
          title: sanitizedMessage.slice(0, 60),
        },
      });
      conversationId = newConv.id;
    }

    if (conversationId) {
      await prisma.aiMessage.createMany({
        data: [
          {
            conversationId,
            role: "user",
            content: sanitizedMessage,
          },
          {
            conversationId,
            role: "assistant",
            content: assistantResponse,
          },
        ],
      });
    }
  } catch (dbErr) {
    console.error("[AiService] Failed to persist chat message to DB:", dbErr);
    // Don't fail user request if DB write fails
    if (!conversationId) {
      conversationId = `guest-conv-${Date.now()}`;
    }
  }

  return {
    response: assistantResponse,
    conversationId: conversationId || `conv-${Date.now()}`,
    role,
    isFallback,
  };
}

/**
 * Handle streaming chat response
 */
export async function streamAiChat(
  options: AiChatOptions,
  onChunk: (chunk: string) => void
): Promise<AiChatResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const configuredModel = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("your_openai_api_key_here")) {
    const fallback = await processAiChat(options);
    onChunk(fallback.response);
    return fallback;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const systemPrompt = await buildSystemPrompt(options.role, options.userId, options.userName);
    const sanitizedMessage = sanitizeContent(options.message);

    const stream = await openai.chat.completions.create({
      model: configuredModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedMessage },
      ],
      max_tokens: 700,
      temperature: 0.7,
      stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (delta) {
        fullText += delta;
        onChunk(delta);
      }
    }

    // Persist
    let conversationId = options.conversationId;
    try {
      if (!conversationId) {
        const newConv = await prisma.aiConversation.create({
          data: {
            userId: options.userId || null,
            role: options.role,
            title: sanitizedMessage.slice(0, 60),
          },
        });
        conversationId = newConv.id;
      }
      await prisma.aiMessage.createMany({
        data: [
          { conversationId, role: "user", content: sanitizedMessage },
          { conversationId, role: "assistant", content: fullText },
        ],
      });
    } catch {}

    return {
      response: fullText,
      conversationId: conversationId || `conv-${Date.now()}`,
      role: options.role,
    };
  } catch (err) {
    console.error("[AiService] Streaming failed, falling back:", err);
    const fallback = await processAiChat(options);
    onChunk(fallback.response);
    return fallback;
  }
}
