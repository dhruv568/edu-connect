import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export interface SyntheticEducatorData {
  email: string;
  firstName: string;
  lastName: string;
  headline: string;
  subjects: string;
  experienceYears: number;
  hourlyRate: number;
  languages: string;
  location: string;
  rating: number;
  bio: string;
  avatarUrl: string;
  qualification: {
    degree: string;
    institution: string;
    specialization?: string;
    year: number;
  };
}

export const SYNTHETIC_EDUCATORS: SyntheticEducatorData[] = [
  {
    email: "synthetic.educator.01@sample.educonnects.internal",
    firstName: "Vikramaditya",
    lastName: "Sen",
    headline: "Senior Faculty of Theoretical & Applied Physics",
    subjects: "Physics, Mechanics, Electromagnetism",
    experienceYears: 18,
    hourlyRate: 850,
    languages: "English, Hindi, Bengali",
    location: "Kolkata, West Bengal",
    rating: 4.96,
    bio: "Specializes in conceptual physics and classical mechanics for advanced learners and Olympiad preparation. Focuses on intuitive first-principles understanding before mathematical formulation.",
    avatarUrl: "/images/educators/educator_01.jpg",
    qualification: {
      degree: "Ph.D. in Physics",
      institution: "Indian Institute of Technology (IIT) Delhi",
      specialization: "Applied Mechanics & Classical Fields",
      year: 2008,
    },
  },
  {
    email: "synthetic.educator.02@sample.educonnects.internal",
    firstName: "Sunita",
    lastName: "Natarajan",
    headline: "Advanced Mathematics & Calculus Lead Instructor",
    subjects: "Mathematics, Calculus, Linear Algebra",
    experienceYears: 16,
    hourlyRate: 750,
    languages: "English, Tamil, Hindi",
    location: "Chennai, Tamil Nadu",
    rating: 4.94,
    bio: "Dedicated mathematics educator with 16+ years of classroom and online pedagogy experience. Emphasizes step-by-step problem deconstruction, graphical visualization, and analytical rigor.",
    avatarUrl: "/images/educators/educator_02.jpg",
    qualification: {
      degree: "M.Sc. in Mathematics",
      institution: "University of Madras",
      specialization: "Real & Complex Analysis",
      year: 2010,
    },
  },
  {
    email: "synthetic.educator.03@sample.educonnects.internal",
    firstName: "Rajeshwar",
    lastName: "Kulkarni",
    headline: "Organic & Physical Chemistry Master Faculty",
    subjects: "Chemistry, Organic Chemistry, Biochemistry",
    experienceYears: 19,
    hourlyRate: 800,
    languages: "English, Marathi, Hindi",
    location: "Pune, Maharashtra",
    rating: 4.97,
    bio: "Passionate chemistry mentor bridging molecular theory with real-world biochemical phenomena. Renowned for visual reaction mechanism frameworks and systematic mnemonic techniques.",
    avatarUrl: "/images/educators/educator_03.jpg",
    qualification: {
      degree: "Ph.D. in Chemistry",
      institution: "Savitribai Phule Pune University",
      specialization: "Organic Synthesis & Kinetics",
      year: 2007,
    },
  },
  {
    email: "synthetic.educator.04@sample.educonnects.internal",
    firstName: "Meenakshi",
    lastName: "Sundaram",
    headline: "Senior Computer Science & Systems Architect Mentor",
    subjects: "Computer Science, Programming, Data Structures & Algorithms",
    experienceYears: 14,
    hourlyRate: 900,
    languages: "English, Hindi, Kannada",
    location: "Bengaluru, Karnataka",
    rating: 4.93,
    bio: "Industry practitioner turned educator with 14+ years in software architecture and computer science fundamentals. Guides students through modular thinking, algorithmic efficiency, and clean code principles.",
    avatarUrl: "/images/educators/educator_04.jpg",
    qualification: {
      degree: "M.Tech in Computer Science",
      institution: "National Institute of Technology (NIT) Trichy",
      specialization: "Algorithms & Distributed Systems",
      year: 2012,
    },
  },
  {
    email: "synthetic.educator.05@sample.educonnects.internal",
    firstName: "Anand",
    lastName: "Vardhan",
    headline: "Economics, Econometrics & Public Policy Educator",
    subjects: "Economics, Microeconomics, Macroeconomics, Statistics",
    experienceYears: 15,
    hourlyRate: 700,
    languages: "English, Hindi",
    location: "New Delhi, NCR",
    rating: 4.91,
    bio: "Experienced economics tutor helping students grasp market dynamics, game theory, and macroeconomic models. Integrates case studies from emerging economies with rigorous analytical problem sets.",
    avatarUrl: "/images/educators/educator_05.jpg",
    qualification: {
      degree: "M.A. in Economics",
      institution: "Delhi School of Economics",
      specialization: "Econometrics & Quantitative Policy",
      year: 2011,
    },
  },
  {
    email: "synthetic.educator.06@sample.educonnects.internal",
    firstName: "Kavita",
    lastName: "Deshmukh",
    headline: "Cell Biology, Genetics & Physiology Specialist",
    subjects: "Biology, Genetics, Human Physiology",
    experienceYears: 13,
    hourlyRate: 650,
    languages: "English, Marathi, Hindi",
    location: "Mumbai, Maharashtra",
    rating: 4.95,
    bio: "Dedicated biology instructor who transforms complex physiological cycles into vivid structural narratives. Specializes in cell biology, genetic inheritance models, and clinical case contexts.",
    avatarUrl: "/images/educators/educator_06.jpg",
    qualification: {
      degree: "M.Sc. in Life Sciences",
      institution: "University of Mumbai",
      specialization: "Molecular Genetics & Cellular Biology",
      year: 2013,
    },
  },
  {
    email: "synthetic.educator.07@sample.educonnects.internal",
    firstName: "Harish",
    lastName: "Parthasarathy",
    headline: "Accountancy & Financial Accounting Lead Educator",
    subjects: "Accountancy, Financial Accounting, Cost Accounting",
    experienceYears: 17,
    hourlyRate: 750,
    languages: "English, Tamil, Hindi",
    location: "Coimbatore, Tamil Nadu",
    rating: 4.92,
    bio: "Chartered Accountant and veteran academician simplifying balance sheets, cash flows, and corporate accounting frameworks. Believes accounting is the language of enterprise decision-making.",
    avatarUrl: "/images/educators/educator_07.jpg",
    qualification: {
      degree: "M.Com & FCA",
      institution: "The Institute of Chartered Accountants of India",
      specialization: "Corporate Financial Accounting",
      year: 2009,
    },
  },
  {
    email: "synthetic.educator.08@sample.educonnects.internal",
    firstName: "Shalini",
    lastName: "Bannerjee",
    headline: "English Literature & Rhetorical Communication Mentor",
    subjects: "English, Communication Skills, Academic Writing",
    experienceYears: 15,
    hourlyRate: 600,
    languages: "English, Bengali, Hindi",
    location: "Kolkata, West Bengal",
    rating: 4.89,
    bio: "Academic writing scholar and communications coach focusing on critical literary analysis, articulate oral rhetoric, and structured persuasive prose for competitive and university examinations.",
    avatarUrl: "/images/educators/educator_08.jpg",
    qualification: {
      degree: "Ph.D. in English Literature",
      institution: "Jadavpur University",
      specialization: "Literary Theory & Rhetoric",
      year: 2011,
    },
  },
  {
    email: "synthetic.educator.09@sample.educonnects.internal",
    firstName: "Manoj",
    lastName: "Tiwari",
    headline: "Mathematics & Quantitative Aptitude Specialist",
    subjects: "Mathematics, Statistics, Quantitative Reasoning",
    experienceYears: 18,
    hourlyRate: 700,
    languages: "English, Hindi",
    location: "Varanasi, Uttar Pradesh",
    rating: 4.95,
    bio: "Specializes in competitive quantitative problem-solving, speed mathematics, and probabilistic thinking. Emphasizes systematic pattern identification to eliminate exam fatigue.",
    avatarUrl: "/images/educators/educator_09.jpg",
    qualification: {
      degree: "M.Sc. in Applied Mathematics",
      institution: "Banaras Hindu University (BHU)",
      specialization: "Computational Mathematics",
      year: 2008,
    },
  },
  {
    email: "synthetic.educator.10@sample.educonnects.internal",
    firstName: "Arundhati",
    lastName: "Mukherjee",
    headline: "Chemistry & Thermodynamics Faculty",
    subjects: "Chemistry, Physical Chemistry, Chemical Kinetics",
    experienceYears: 12,
    hourlyRate: 650,
    languages: "English, Bengali, Hindi",
    location: "Howrah, West Bengal",
    rating: 4.90,
    bio: "Guides students through equilibrium, electrochemistry, and thermodynamics with crystal-clear mathematical derivations and laboratory analogies that demystify physical chemistry.",
    avatarUrl: "/images/educators/educator_10.jpg",
    qualification: {
      degree: "M.Sc. in Chemistry",
      institution: "University of Calcutta",
      specialization: "Physical Chemistry & Thermodynamics",
      year: 2014,
    },
  },
  {
    email: "synthetic.educator.11@sample.educonnects.internal",
    firstName: "Suresh",
    lastName: "Venkatesh",
    headline: "Python, Web Technologies & Database Systems Instructor",
    subjects: "Programming, Python, Database Systems, Computer Science",
    experienceYears: 16,
    hourlyRate: 850,
    languages: "English, Telugu, Tamil",
    location: "Hyderabad, Telangana",
    rating: 4.93,
    bio: "Veteran software mentor teaching clean coding paradigms, relational database normalization, and full-stack computational logic. Passionate about empowering learners with practical problem-solving.",
    avatarUrl: "/images/educators/educator_11.jpg",
    qualification: {
      degree: "M.Tech in Information Technology",
      institution: "Anna University",
      specialization: "Database Management & Software Engineering",
      year: 2010,
    },
  },
  {
    email: "synthetic.educator.12@sample.educonnects.internal",
    firstName: "Radhika",
    lastName: "Menon",
    headline: "Business Studies & Organizational Management Mentor",
    subjects: "Business Studies, Commerce, Management Principles",
    experienceYears: 14,
    hourlyRate: 700,
    languages: "English, Malayalam, Hindi",
    location: "Kochi, Kerala",
    rating: 4.92,
    bio: "Corporate strategist turned educator bringing boardroom reality to business management concepts. Focuses on case-study pedagogy, consumer behavior frameworks, and organizational dynamics.",
    avatarUrl: "/images/educators/educator_12.jpg",
    qualification: {
      degree: "MBA in Management & Strategy",
      institution: "Indian Institute of Management (IIM) Kozhikode",
      specialization: "Strategic Management & Organizational Behavior",
      year: 2012,
    },
  },
  {
    email: "synthetic.educator.13@sample.educonnects.internal",
    firstName: "Pradeep",
    lastName: "Chandran",
    headline: "Senior Faculty of Optics, Waves & Quantum Mechanics",
    subjects: "Physics, Waves & Optics, Modern Physics",
    experienceYears: 20,
    hourlyRate: 800,
    languages: "English, Kannada, Hindi",
    location: "Mysuru, Karnataka",
    rating: 4.96,
    bio: "Two decades of expertise mentoring science scholars through wave optics, wave-particle duality, and atomic physics. Utilizes simulation tools and step-by-step problem breakdowns.",
    avatarUrl: "/images/educators/educator_13.jpg",
    qualification: {
      degree: "M.Sc. in Physics & M.Phil.",
      institution: "University of Mysore",
      specialization: "Quantum Mechanics & Wave Optics",
      year: 2006,
    },
  },
  {
    email: "synthetic.educator.14@sample.educonnects.internal",
    firstName: "Geeta",
    lastName: "Ramaswamy",
    headline: "Applied Statistics, Data Interpretation & Probability Coach",
    subjects: "Statistics, Mathematics, Data Analysis",
    experienceYears: 15,
    hourlyRate: 750,
    languages: "English, Tamil, Hindi",
    location: "Chennai, Tamil Nadu",
    rating: 4.94,
    bio: "Statistician and academic coach passionate about distribution theory, statistical inference, and hypothesis testing. Translates abstract probability into tangible real-world decision metrics.",
    avatarUrl: "/images/educators/educator_14.jpg",
    qualification: {
      degree: "M.Stat. in Applied Statistics",
      institution: "Indian Statistical Institute (ISI)",
      specialization: "Inference & Probability Modeling",
      year: 2011,
    },
  },
  {
    email: "synthetic.educator.15@sample.educonnects.internal",
    firstName: "Sanjay",
    lastName: "Bhattacharya",
    headline: "Inorganic Chemistry & Coordination Compounds Specialist",
    subjects: "Chemistry, Inorganic Chemistry, Periodic Properties",
    experienceYears: 17,
    hourlyRate: 700,
    languages: "English, Bengali, Hindi",
    location: "Kolkata, West Bengal",
    rating: 4.91,
    bio: "Demystifies transition elements, metallurgy, and coordination compounds through structural geometry models and periodic trends. Known for interactive diagnostic quizzes.",
    avatarUrl: "/images/educators/educator_15.jpg",
    qualification: {
      degree: "M.Sc. in Inorganic Chemistry",
      institution: "Jadavpur University",
      specialization: "Coordination Chemistry & Transition Metals",
      year: 2009,
    },
  },
  {
    email: "synthetic.educator.16@sample.educonnects.internal",
    firstName: "Nandini",
    lastName: "Kulkarni",
    headline: "Ecology, Plant Physiology & Botany Educator",
    subjects: "Biology, Botany, Environmental Science",
    experienceYears: 13,
    hourlyRate: 600,
    languages: "English, Marathi, Hindi",
    location: "Nagpur, Maharashtra",
    rating: 4.88,
    bio: "Naturalist and botany educator specializing in plant physiology, photosynthesis biochemistry, and ecological conservation principles. Inspires students with structured comparative notes.",
    avatarUrl: "/images/educators/educator_16.jpg",
    qualification: {
      degree: "M.Sc. in Botany",
      institution: "Savitribai Phule Pune University",
      specialization: "Plant Physiology & Ecology",
      year: 2013,
    },
  },
  {
    email: "synthetic.educator.17@sample.educonnects.internal",
    firstName: "Bhupendra",
    lastName: "Rawat",
    headline: "Algebra, Trigonometry & Coordinate Geometry Expert",
    subjects: "Mathematics, Coordinate Geometry, Trigonometry",
    experienceYears: 16,
    hourlyRate: 700,
    languages: "English, Hindi",
    location: "Dehradun, Uttarakhand",
    rating: 4.93,
    bio: "Mathematics coach dedicated to geometric reasoning, coordinate geometry transformations, and trigonometric identities. Builds deep analytical rigor with structured problem ladders.",
    avatarUrl: "/images/educators/educator_17.jpg",
    qualification: {
      degree: "M.Sc. in Mathematics",
      institution: "University of Delhi",
      specialization: "Higher Geometry & Linear Systems",
      year: 2010,
    },
  },
  {
    email: "synthetic.educator.18@sample.educonnects.internal",
    firstName: "Anuradha",
    lastName: "Sengupta",
    headline: "Hindi Literature, Grammar & Applied Linguistics Faculty",
    subjects: "Hindi, Communication Skills, Applied Linguistics",
    experienceYears: 15,
    hourlyRate: 550,
    languages: "Hindi, English, Bengali",
    location: "Lucknow, Uttar Pradesh",
    rating: 4.90,
    bio: "Prominent language educator combining classical literary appreciation with rigorous modern functional grammar. Inspires eloquent written expression and analytical comprehension.",
    avatarUrl: "/images/educators/educator_18.jpg",
    qualification: {
      degree: "M.A. in Hindi Literature & B.Ed.",
      institution: "University of Lucknow",
      specialization: "Applied Linguistics & Classical Prose",
      year: 2011,
    },
  },
  {
    email: "synthetic.educator.19@sample.educonnects.internal",
    firstName: "Tarun",
    lastName: "Singhania",
    headline: "Mercantile Law, Corporate Governance & Business Economics Lead",
    subjects: "Commerce, Economics, Business Studies",
    experienceYears: 18,
    hourlyRate: 800,
    languages: "English, Hindi",
    location: "Jaipur, Rajasthan",
    rating: 4.95,
    bio: "Corporate legal consultant and senior commerce lecturer delivering crisp insights into contracts, corporate governance, and economic regulation for commerce students.",
    avatarUrl: "/images/educators/educator_19.jpg",
    qualification: {
      degree: "M.Com & LL.B.",
      institution: "University of Delhi",
      specialization: "Commercial & Corporate Law",
      year: 2008,
    },
  },
  {
    email: "synthetic.educator.20@sample.educonnects.internal",
    firstName: "Jayashree",
    lastName: "Pillai",
    headline: "Electrostatics, Current Electricity & Magnetism Specialist",
    subjects: "Physics, Electromagnetism, Electronics",
    experienceYears: 17,
    hourlyRate: 800,
    languages: "English, Malayalam, Hindi",
    location: "Thiruvananthapuram, Kerala",
    rating: 4.96,
    bio: "Former university researcher dedicated to pre-university and undergraduate physics education. Clarifies electromagnetic field theory through vector calculus and hands-on circuit diagrams.",
    avatarUrl: "/images/educators/educator_20.jpg",
    qualification: {
      degree: "Ph.D. in Applied Physics",
      institution: "University of Kerala",
      specialization: "Electromagnetic Theory & Solid State Devices",
      year: 2009,
    },
  },
];

export async function seedSyntheticEducators() {
  console.log("🇮🇳 Seeding 20 Natural-Looking Indian Educator Profiles (Idempotent)...");

  // Admin user lookup for creating audit notes
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  let createdCount = 0;
  let updatedCount = 0;

  for (const ed of SYNTHETIC_EDUCATORS) {
    const existingUser = await prisma.user.findUnique({
      where: { email: ed.email },
      include: { teacherProfile: true, profile: true },
    });

    // Unusable, locked random password hash so login is strictly impossible
    const lockedPasswordHash = `SYNTHETIC_ACCOUNT_NO_LOGIN_${crypto.randomBytes(32).toString("hex")}`;

    if (!existingUser) {
      // Create new user with profile and teacherProfile
      const user = await prisma.user.create({
        data: {
          email: ed.email,
          passwordHash: lockedPasswordHash,
          role: "TEACHER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          profile: {
            create: {
              firstName: ed.firstName,
              lastName: ed.lastName,
              avatarUrl: ed.avatarUrl,
              bio: ed.bio,
            },
          },
          teacherProfile: {
            create: {
              headline: ed.headline,
              bio: ed.bio,
              subjects: ed.subjects,
              experienceYears: ed.experienceYears,
              hourlyRate: ed.hourlyRate,
              languages: ed.languages,
              location: ed.location,
              teachingMode: "BOTH",
              verificationStatus: "VERIFIED",
              verifiedAt: new Date(),
              rating: ed.rating,
              teacherQualifications: {
                create: [
                  {
                    degree: ed.qualification.degree,
                    institution: ed.qualification.institution,
                    specialization: ed.qualification.specialization,
                    year: ed.qualification.year,
                  },
                ],
              },
            },
          },
        },
        include: { teacherProfile: true },
      });

      if (adminUser && user.teacherProfile) {
        await prisma.adminNote.create({
          data: {
            teacherId: user.teacherProfile.id,
            adminId: adminUser.id,
            content: "INTERNAL_SAMPLE_EDUCATOR: Synthetic profile for public educator discovery display only. Real person impersonation strictly prohibited. Insecure login disabled.",
          },
        });
      }

      createdCount++;
      console.log(`  + Created: ${ed.firstName} ${ed.lastName} (${ed.subjects.split(",")[0].trim()})`);
    } else {
      // Idempotently update existing synthetic record
      await prisma.profile.update({
        where: { userId: existingUser.id },
        data: {
          firstName: ed.firstName,
          lastName: ed.lastName,
          avatarUrl: ed.avatarUrl,
          bio: ed.bio,
        },
      });

      if (existingUser.teacherProfile) {
        await prisma.teacherProfile.update({
          where: { id: existingUser.teacherProfile.id },
          data: {
            headline: ed.headline,
            bio: ed.bio,
            subjects: ed.subjects,
            experienceYears: ed.experienceYears,
            hourlyRate: ed.hourlyRate,
            languages: ed.languages,
            location: ed.location,
            rating: ed.rating,
            verificationStatus: "VERIFIED",
          },
        });

        // Upsert qualification
        await prisma.teacherQualification.deleteMany({
          where: { teacherId: existingUser.teacherProfile.id },
        });

        await prisma.teacherQualification.create({
          data: {
            teacherId: existingUser.teacherProfile.id,
            degree: ed.qualification.degree,
            institution: ed.qualification.institution,
            specialization: ed.qualification.specialization,
            year: ed.qualification.year,
          },
        });
      }

      updatedCount++;
      console.log(`  ~ Updated: ${ed.firstName} ${ed.lastName} (${ed.email})`);
    }
  }

  console.log(`\n✅ Seeding finished: ${createdCount} created, ${updatedCount} updated.`);
}

if (require.main === module) {
  seedSyntheticEducators()
    .catch((err) => {
      console.error("❌ Seed Error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
