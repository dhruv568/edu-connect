# EduConnect — Technical Foundation & Architecture

EduConnect is a next-generation education platform connecting **Teachers**, **Students**, and **Administrators** across three independent learning models: **Demo Bookings**, **Live Class Slots**, and **Pre-recorded Courses**, with a production-grade WebRTC **Virtual Classroom**.

---

## 🌟 Technology Stack

- **Frontend Framework**: Next.js 14/15 (App Router) & React 18
- **Language**: TypeScript (Strict Mode)
- **Styling & System**: Tailwind CSS & Custom **"EduConnect Playful Learning System"**
- **Animations**: Framer Motion & GSAP
- **Real-Time Video**: WebRTC Provider Abstraction (`ClassroomProvider`, `WebRTCAdapter`)
- **Icons**: Lucide React
- **Validation**: Zod & React Hook Form
- **Database & ORM**: Prisma ORM with PostgreSQL (Neon DB) / SQLite compatible
- **Auth & Hashing**: Bcryptjs & HMAC SHA-256 classroom token hashing
- **Email Service**: Flexible Email Provider Abstraction (Console Log Provider for Dev + SMTP Nodemailer Provider)

---

## 📂 Project Structure

```text
educonnect_company/
│
├── app/
│   ├── layout.tsx                # Root layout with ToastProvider and metadata
│   ├── page.tsx                  # Foundation Landing Page with Hero & Role Selection
│   ├── globals.css               # Design system variables & custom background patterns
│   ├── not-found.tsx             # Custom 404 page
│   ├── error.tsx                 # Global error boundary
│   │
│   ├── verify-email/             # Working Email Verification Page (OTP & Link)
│   │   └── page.tsx
│   │
│   ├── admin/                    # Protected Admin Governance Dashboard
│   │   └── page.tsx
│   ├── teacher/                  # Protected Teacher Portal Dashboard
│   │   └── page.tsx
│   ├── student/                  # Protected Student Hub Dashboard
│   │   └── page.tsx
│   ├── parent/                   # Protected Parent Monitor Dashboard
│   │   └── page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── verify-email/route.ts
│       │   ├── resend-verification/route.ts
│       │   ├── me/route.ts
│       │   └── logout/route.ts
│       └── health/route.ts
│
├── components/
│   ├── ui/                       # Reusable base components (Button, Input, Card, Badge, Toast)
│   ├── layout/                   # Navbar, Footer, DashboardLayout
│   ├── education/                # LearningCard, RoleCard, FloatingLearningElements
│   └── shared/                   # AuthModal, EmptyState, LoadingSkeleton
│
├── lib/
│   ├── prisma.ts                 # Singleton Prisma Client
│   ├── api-response.ts           # Standard API Envelope Helpers
│   ├── auth/
│   │   ├── password.ts           # Bcrypt hashing
│   │   ├── tokens.ts             # 6-digit OTP & SHA-256 token generation
│   │   ├── session.ts            # HTTP-only session cookie management
│   │   └── guards.ts             # Server-side authorization guards
│   └── email/
│       ├── email-service.ts      # Email Provider Interface & Factory
│       └── templates/
│           └── verification-email.ts # Responsive HTML Email Template
│
├── services/
│   └── auth-service.ts           # Registration, verification, & login business logic
│
├── schemas/
│   └── auth-schemas.ts           # Zod validation schemas
│
├── database/
│   └── seed/
│       └── seed.ts               # Database seed script for dev testing
│
├── tests/
│   └── auth.test.ts              # Architectural & validation test suite
│
├── prisma/
│   └── schema.prisma             # User, Profiles, Roles, & EmailVerification models
│
├── middleware.ts                 # Edge role route protection
├── tailwind.config.ts            # Design system tokens & playful animations
├── package.json
└── .env.example
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup & Migrations
Initialize the local SQLite database schema:
```bash
npx prisma db push
```

### 3. Seed Development Accounts
Populate demo accounts for testing:
```bash
npm run db:seed
```

**Seeded Credentials (Password for all: `Password123!`):**
- **Admin**: `admin@educonnect.com`
- **Teacher**: `teacher@educonnect.com`
- **Student**: `student@educonnect.com`
- **Parent**: `parent@educonnect.com`
- **Unverified Student**: `unverified@educonnect.com`

### 4. Run Architectural Verification Tests
```bash
npm test
```

### 5. Launch Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Email Verification Architecture

Email verification is a fully functional feature in Module 01:
1. **User Registration**: Creates `User` and `EmailVerification` record with hashed 6-digit OTP and hashed link token.
2. **Email Provider Abstraction**:
   - `EMAIL_PROVIDER="console"` (default): Formats and logs OTP and verification link directly to the terminal for instant zero-dependency local testing.
   - `EMAIL_PROVIDER="smtp"`: Sends transactional HTML emails via Nodemailer.
3. **Verification**: Users verify via 6-digit OTP input at `/verify-email` or by clicking the emailed link.
4. **Security Controls**:
   - 15-minute token expiry
   - 5 maximum attempt limit per verification code
   - 60-second resend rate-limiting cooldown
   - SHA-256 token hashing (no plain tokens stored in database)

---

## 🛡️ Role Architecture & Route Protection

Four roles are supported: `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`.

- **Middleware (`middleware.ts`)**: Redirects unauthorized role access (e.g. Non-Admin attempting to enter `/admin`).
- **Server Guards (`lib/auth/guards.ts`)**: Server-side functions `requireAuth()`, `requireRole()`, and `requireVerifiedEmail()` protecting API routes and server components.

---

## 🚀 Module 02 - 10 Extension Points

This foundation is ready for future modules without requiring architectural refactoring:
- **Module 02**: Public Marketplace & Teacher Search
- **Module 03**: Expanded Auth & User Profiles
- **Module 04**: Teacher Verification Workflows & Admin Panel
- **Module 05**: Marketplace, Demo Booking & Live Slots
- **Module 06**: Live Classroom Integration
- **Module 07**: Pre-recorded LMS Courses & Lessons
- **Module 08**: Payments, Subscriptions & Wallet
- **Module 09**: Dashboards & Integration
- **Module 10**: QA & Deployment Pipeline
