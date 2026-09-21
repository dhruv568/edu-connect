import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: {
    key: "A" | "B" | "C" | "D";
    text: string;
  }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface ClientExamQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: {
    key: "A" | "B" | "C" | "D";
    text: string;
  }[];
}

export interface ExamSession {
  examId: string;
  subject: string;
  difficulty: string;
  totalQuestions: number;
  questions: ExamQuestion[];
  createdAt: number;
}

// In-memory cache for generated questions to control AI cost and protect latency
// Key: `${subject.toLowerCase()}_${difficulty.toLowerCase()}_${count}`
const examQuestionCache = new Map<string, { questions: ExamQuestion[]; cachedAt: number }>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Active exam sessions store (stores correct answers server-side)
const activeExamSessions = new Map<string, ExamSession>();

// Cleanup old sessions every 15 minutes
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of activeExamSessions.entries()) {
      if (session.createdAt < oneHourAgo) {
        activeExamSessions.delete(id);
      }
    }
  }, 15 * 60 * 1000);
  if (cleanupTimer && typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

/**
 * Built-in high quality question banks for active subjects as guaranteed fast fallback
 */
const FALLBACK_QUESTION_BANKS: Record<string, ExamQuestion[]> = {
  mathematics: [
    {
      id: "math-1",
      questionNumber: 1,
      question: "What is the value of 12 × 8?",
      options: [
        { key: "A", text: "86" },
        { key: "B", text: "96" },
        { key: "C", text: "108" },
        { key: "D", text: "112" },
      ],
      correctAnswer: "B",
      explanation: "12 multiplied by 8 equals 96.",
    },
    {
      id: "math-2",
      questionNumber: 2,
      question: "If 3x + 7 = 22, what is the value of x?",
      options: [
        { key: "A", text: "3" },
        { key: "B", text: "4" },
        { key: "C", text: "5" },
        { key: "D", text: "6" },
      ],
      correctAnswer: "C",
      explanation: "Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5.",
    },
    {
      id: "math-3",
      questionNumber: 3,
      question: "What is the derivative of f(x) = x³ - 4x + 9 with respect to x?",
      options: [
        { key: "A", text: "3x² - 4" },
        { key: "B", text: "3x² + 4" },
        { key: "C", text: "x² - 4" },
        { key: "D", text: "3x³ - 4x" },
      ],
      correctAnswer: "A",
      explanation: "By power rule: d/dx(x³) = 3x², d/dx(-4x) = -4, and d/dx(9) = 0, giving 3x² - 4.",
    },
    {
      id: "math-4",
      questionNumber: 4,
      question: "What is the area of a right-angled triangle with base 8 cm and height 15 cm?",
      options: [
        { key: "A", text: "120 cm²" },
        { key: "B", text: "60 cm²" },
        { key: "C", text: "45 cm²" },
        { key: "D", text: "90 cm²" },
      ],
      correctAnswer: "B",
      explanation: "Area of a triangle = (1/2) × base × height = (1/2) × 8 × 15 = 60 cm².",
    },
    {
      id: "math-5",
      questionNumber: 5,
      question: "What is the sum of interior angles of a pentagon?",
      options: [
        { key: "A", text: "360°" },
        { key: "B", text: "480°" },
        { key: "C", text: "540°" },
        { key: "D", text: "720°" },
      ],
      correctAnswer: "C",
      explanation: "Formula = (n - 2) × 180°. For a pentagon (n = 5): (5 - 2) × 180° = 540°.",
    },
  ],
  physics: [
    {
      id: "phys-1",
      questionNumber: 1,
      question: "What is the SI unit of electric current?",
      options: [
        { key: "A", text: "Volt" },
        { key: "B", text: "Ohm" },
        { key: "C", text: "Ampere" },
        { key: "D", text: "Coulomb" },
      ],
      correctAnswer: "C",
      explanation: "The Ampere (A) is the base SI unit of electric current.",
    },
    {
      id: "phys-2",
      questionNumber: 2,
      question: "According to Newton's Second Law of Motion, what does force equal?",
      options: [
        { key: "A", text: "Mass × Velocity" },
        { key: "B", text: "Mass × Acceleration" },
        { key: "C", text: "Mass / Acceleration" },
        { key: "D", text: "Velocity / Time" },
      ],
      correctAnswer: "B",
      explanation: "Newton's Second Law defines Force as the rate of change of momentum: F = m × a.",
    },
    {
      id: "phys-3",
      questionNumber: 3,
      question: "What type of lens is used to correct myopia (short-sightedness)?",
      options: [
        { key: "A", text: "Convex lens" },
        { key: "B", text: "Concave lens" },
        { key: "C", text: "Cylindrical lens" },
        { key: "D", text: "Bifocal lens" },
      ],
      correctAnswer: "B",
      explanation: "A concave (diverging) lens is used to correct myopia by diverging light rays before they enter the eye.",
    },
    {
      id: "phys-4",
      questionNumber: 4,
      question: "What is the approximate acceleration due to gravity on the surface of the Earth?",
      options: [
        { key: "A", text: "8.9 m/s²" },
        { key: "B", text: "9.8 m/s²" },
        { key: "C", text: "10.8 m/s²" },
        { key: "D", text: "11.2 m/s²" },
      ],
      correctAnswer: "B",
      explanation: "Standard acceleration due to gravity on Earth is approximately 9.8 m/s².",
    },
    {
      id: "phys-5",
      questionNumber: 5,
      question: "Which of the following is a scalar quantity?",
      options: [
        { key: "A", text: "Velocity" },
        { key: "B", text: "Displacement" },
        { key: "C", text: "Speed" },
        { key: "D", text: "Acceleration" },
      ],
      correctAnswer: "C",
      explanation: "Speed has only magnitude and no directional vector, making it a scalar quantity.",
    },
  ],
  chemistry: [
    {
      id: "chem-1",
      questionNumber: 1,
      question: "What is the chemical formula of common table salt?",
      options: [
        { key: "A", text: "KCl" },
        { key: "B", text: "NaCl" },
        { key: "C", text: "Na2SO4" },
        { key: "D", text: "CaCO3" },
      ],
      correctAnswer: "B",
      explanation: "Common table salt is sodium chloride, with formula NaCl.",
    },
    {
      id: "chem-2",
      questionNumber: 2,
      question: "What is the pH of pure neutral water at 25°C?",
      options: [
        { key: "A", text: "5" },
        { key: "B", text: "7" },
        { key: "C", text: "9" },
        { key: "D", text: "14" },
      ],
      correctAnswer: "B",
      explanation: "At 25°C, pure water has equal concentrations of H+ and OH- ions, resulting in a pH of 7.",
    },
    {
      id: "chem-3",
      questionNumber: 3,
      question: "Which element has the atomic number 6?",
      options: [
        { key: "A", text: "Nitrogen" },
        { key: "B", text: "Oxygen" },
        { key: "C", text: "Carbon" },
        { key: "D", text: "Boron" },
      ],
      correctAnswer: "C",
      explanation: "Carbon has atomic number 6 with 6 protons in its nucleus.",
    },
    {
      id: "chem-4",
      questionNumber: 4,
      question: "What type of chemical bond involves the sharing of electron pairs?",
      options: [
        { key: "A", text: "Ionic bond" },
        { key: "B", text: "Covalent bond" },
        { key: "C", text: "Hydrogen bond" },
        { key: "D", text: "Metallic bond" },
      ],
      correctAnswer: "B",
      explanation: "Covalent bonding involves the mutual sharing of valence electron pairs between atoms.",
    },
    {
      id: "chem-5",
      questionNumber: 5,
      question: "Which gas is released when dilute hydrochloric acid reacts with zinc metal?",
      options: [
        { key: "A", text: "Oxygen" },
        { key: "B", text: "Chlorine" },
        { key: "C", text: "Hydrogen" },
        { key: "D", text: "Carbon Dioxide" },
      ],
      correctAnswer: "C",
      explanation: "Zn + 2HCl → ZnCl2 + H2↑. Hydrogen gas is liberated.",
    },
  ],
  biology: [
    {
      id: "bio-1",
      questionNumber: 1,
      question: "Which organelle is known as the powerhouse of the cell?",
      options: [
        { key: "A", text: "Nucleus" },
        { key: "B", text: "Ribosome" },
        { key: "C", text: "Mitochondria" },
        { key: "D", text: "Golgi apparatus" },
      ],
      correctAnswer: "C",
      explanation: "Mitochondria produce ATP through cellular respiration, earning the title 'powerhouse of the cell'.",
    },
    {
      id: "bio-2",
      questionNumber: 2,
      question: "Which blood group is universally known as the universal donor?",
      options: [
        { key: "A", text: "O Negative" },
        { key: "B", text: "AB Positive" },
        { key: "C", text: "A Positive" },
        { key: "D", text: "B Negative" },
      ],
      correctAnswer: "A",
      explanation: "O-negative blood lacks A, B, and Rh antigens, allowing it to be donated to any blood group.",
    },
    {
      id: "bio-3",
      questionNumber: 3,
      question: "What pigment gives plants their green color and absorbs light for photosynthesis?",
      options: [
        { key: "A", text: "Carotenoid" },
        { key: "B", text: "Chlorophyll" },
        { key: "C", text: "Anthocyanin" },
        { key: "D", text: "Hemoglobin" },
      ],
      correctAnswer: "B",
      explanation: "Chlorophyll absorbs blue and red wavelengths of light while reflecting green light.",
    },
    {
      id: "bio-4",
      questionNumber: 4,
      question: "What is the normal human body temperature in Celsius?",
      options: [
        { key: "A", text: "35.5°C" },
        { key: "B", text: "37.0°C" },
        { key: "C", text: "38.5°C" },
        { key: "D", text: "39.0°C" },
      ],
      correctAnswer: "B",
      explanation: "Standard normal average human body temperature is 37.0°C (98.6°F).",
    },
    {
      id: "bio-5",
      questionNumber: 5,
      question: "What is the basic functional and structural unit of the kidney?",
      options: [
        { key: "A", text: "Neuron" },
        { key: "B", text: "Alveolus" },
        { key: "C", text: "Nephron" },
        { key: "D", text: "Hepatocyte" },
      ],
      correctAnswer: "C",
      explanation: "Nephrons filter blood, regulate electrolyte balance, and form urine in the kidneys.",
    },
  ],
  english: [
    {
      id: "eng-1",
      questionNumber: 1,
      question: "Choose the correct antonym for the word 'METICULOUS':",
      options: [
        { key: "A", text: "Careful" },
        { key: "B", text: "Careless" },
        { key: "C", text: "Methodical" },
        { key: "D", text: "Diligent" },
      ],
      correctAnswer: "B",
      explanation: "'Meticulous' means showing great attention to detail; its opposite is 'careless'.",
    },
    {
      id: "eng-2",
      questionNumber: 2,
      question: "Identify the part of speech of the word 'QUICKLY' in: 'She solved the puzzle quickly.'",
      options: [
        { key: "A", text: "Adjective" },
        { key: "B", text: "Noun" },
        { key: "C", text: "Adverb" },
        { key: "D", text: "Conjunction" },
      ],
      correctAnswer: "C",
      explanation: "'Quickly' modifies the verb 'solved', making it an adverb of manner.",
    },
    {
      id: "eng-3",
      questionNumber: 3,
      question: "Complete the sentence: 'Neither of the students _____ submitted the assignment yet.'",
      options: [
        { key: "A", text: "have" },
        { key: "B", text: "has" },
        { key: "C", text: "were" },
        { key: "D", text: "are" },
      ],
      correctAnswer: "B",
      explanation: "'Neither' is singular and requires the singular verb 'has'.",
    },
    {
      id: "eng-4",
      questionNumber: 4,
      question: "What figure of speech is used in 'The classroom was a zoo'?",
      options: [
        { key: "A", text: "Simile" },
        { key: "B", text: "Metaphor" },
        { key: "C", text: "Personification" },
        { key: "D", text: "Hyperbole" },
      ],
      correctAnswer: "B",
      explanation: "A metaphor directly asserts that one thing is another without using 'like' or 'as'.",
    },
    {
      id: "eng-5",
      questionNumber: 5,
      question: "Select the correctly spelled word:",
      options: [
        { key: "A", text: "Accomodate" },
        { key: "B", text: "Acommodate" },
        { key: "C", text: "Accommodate" },
        { key: "D", text: "Acomodate" },
      ],
      correctAnswer: "C",
      explanation: "The correct spelling is 'Accommodate' with double 'c' and double 'm'.",
    },
  ],
  "computer-science": [
    {
      id: "cs-1",
      questionNumber: 1,
      question: "What is the time complexity of searching in a balanced Binary Search Tree (BST)?",
      options: [
        { key: "A", text: "O(1)" },
        { key: "B", text: "O(log n)" },
        { key: "C", text: "O(n)" },
        { key: "D", text: "O(n log n)" },
      ],
      correctAnswer: "B",
      explanation: "In a balanced BST, each comparison halves the search space, yielding O(log n) time.",
    },
    {
      id: "cs-2",
      questionNumber: 2,
      question: "Which of the following data structures operates on a Last-In, First-Out (LIFO) basis?",
      options: [
        { key: "A", text: "Queue" },
        { key: "B", text: "Stack" },
        { key: "C", text: "Array" },
        { key: "D", text: "Linked List" },
      ],
      correctAnswer: "B",
      explanation: "A Stack pushes and pops elements in LIFO order.",
    },
    {
      id: "cs-3",
      questionNumber: 3,
      question: "What will `print(type([]))` output in Python 3?",
      options: [
        { key: "A", text: "<class 'array'>" },
        { key: "B", text: "<class 'dict'>" },
        { key: "C", text: "<class 'list'>" },
        { key: "D", text: "<class 'tuple'>" },
      ],
      correctAnswer: "C",
      explanation: "Square brackets `[]` create a Python `list`.",
    },
    {
      id: "cs-4",
      questionNumber: 4,
      question: "In relational databases, which SQL clause is used to filter groups of rows?",
      options: [
        { key: "A", text: "WHERE" },
        { key: "B", text: "ORDER BY" },
        { key: "C", text: "HAVING" },
        { key: "D", text: "GROUP BY" },
      ],
      correctAnswer: "C",
      explanation: "HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping.",
    },
    {
      id: "cs-5",
      questionNumber: 5,
      question: "What does HTTP stand for in computer networking?",
      options: [
        { key: "A", text: "HyperText Transfer Protocol" },
        { key: "B", text: "High Tech Transfer Program" },
        { key: "C", text: "HyperText Translation Provider" },
        { key: "D", text: "Host Transfer Tool Protocol" },
      ],
      correctAnswer: "A",
      explanation: "HTTP stands for HyperText Transfer Protocol.",
    },
  ],
};

export class ExamService {
  /**
   * Generate objective exam questions for a subject
   */
  static async generateExam(params: {
    subject: string;
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
    count?: number;
    userIp?: string;
    academicLevel?: string;
    gradeLevel?: string;
    stream?: string;
    competitiveExam?: string;
    diplomaBranch?: string;
  }): Promise<{ examId: string; subject: string; difficulty: string; questions: ClientExamQuestion[] }> {
    const {
      subject,
      difficulty = "Intermediate",
      count = 5,
      userIp = "unknown",
      academicLevel,
      gradeLevel,
      stream,
      competitiveExam,
      diplomaBranch,
    } = params;
    const cleanSubject = subject.trim();
    const cleanDifficulty = difficulty;
    const questionCount = Math.min(Math.max(count, 3), 10);

    const academicFocusParts = [
      academicLevel === "DIPLOMA" ? `Diploma (${diplomaBranch || "Engineering"})` : null,
      gradeLevel && gradeLevel !== "all" ? gradeLevel : null,
      stream && stream !== "all" ? `Stream: ${stream}` : null,
      competitiveExam && competitiveExam !== "all" ? `Target: ${competitiveExam}` : null,
    ].filter(Boolean);
    const academicFocus = academicFocusParts.length > 0 ? academicFocusParts.join(" • ") : undefined;

    // Rate Limiting: 10 exam generations per hour per IP
    const rateLimitKey = `exam-gen-${userIp}`;
    const rateCheck = checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      throw new Error(
        `Rate limit exceeded: Please wait ${rateCheck.resetInSeconds} seconds before generating another exam.`
      );
    }

    // Cache Check
    const cacheKey = `${cleanSubject.toLowerCase()}_${cleanDifficulty.toLowerCase()}_${questionCount}_${academicFocus || "general"}`;
    const cached = examQuestionCache.get(cacheKey);
    let questions: ExamQuestion[] = [];

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      questions = cached.questions;
    } else {
      // Generate via OpenAI if configured, otherwise use fallback
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && apiKey.trim().length > 0 && !apiKey.includes("your_openai_api_key_here")) {
        try {
          questions = await this.generateWithOpenAI(cleanSubject, cleanDifficulty, questionCount, academicFocus);
          // Cache successful AI response
          examQuestionCache.set(cacheKey, { questions, cachedAt: Date.now() });
        } catch (aiErr) {
          console.warn("[ExamService] OpenAI generation failed, using curated bank:", aiErr);
          questions = this.getFallbackQuestions(cleanSubject, questionCount);
        }
      } else {
        questions = this.getFallbackQuestions(cleanSubject, questionCount);
      }
    }

    // Ensure questions exist
    if (!questions || questions.length === 0) {
      questions = this.getFallbackQuestions(cleanSubject, questionCount);
    }

    // Generate unique session ID and store full questions (with correct answers) server-side
    const examId = `exam-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    activeExamSessions.set(examId, {
      examId,
      subject: cleanSubject,
      difficulty: cleanDifficulty,
      totalQuestions: questions.length,
      questions,
      createdAt: Date.now(),
    });

    // Strip out correct answers and explanations before sending to client
    const clientQuestions: ClientExamQuestion[] = questions.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      question: q.question,
      options: q.options,
    }));

    return {
      examId,
      subject: cleanSubject,
      difficulty: cleanDifficulty,
      questions: clientQuestions,
    };
  }

  /**
   * Grade learner answers server-side
   */
  static async submitExam(params: {
    examId: string;
    answers: Record<string, "A" | "B" | "C" | "D">;
  }) {
    const { examId, answers = {} } = params;
    const session = activeExamSessions.get(examId);

    if (!session) {
      throw new Error("Exam session expired or invalid. Please take a new free exam.");
    }

    let correctCount = 0;
    const review = session.questions.map((q) => {
      const selected = answers[q.id] || null;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        id: q.id,
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = session.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    let performanceSummary = "";
    if (scorePercentage >= 80) {
      performanceSummary = `Outstanding! You demonstrated strong mastery of ${session.subject}. You are ready for advanced concepts and competitive test series.`;
    } else if (scorePercentage >= 60) {
      performanceSummary = `Good effort! You have a solid grasp of fundamental ${session.subject} principles, but can boost your score further with targeted 1-on-1 problem-solving sessions.`;
    } else {
      performanceSummary = `Foundational revision recommended. Learning with an expert verified ${session.subject} educator will help you master the key concepts step-by-step.`;
    }

    return {
      examId,
      subject: session.subject,
      difficulty: session.difficulty,
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      scorePercentage,
      performanceSummary,
      recommendedSubject: session.subject,
      recommendedNextStep: `Based on your performance, explore verified Educators who teach ${session.subject}.`,
      findTeachersUrl: `/find-teachers?subject=${encodeURIComponent(session.subject.toLowerCase())}`,
      review,
    };
  }

  /**
   * OpenAI Structured generation helper
   */
  private static async generateWithOpenAI(
    subject: string,
    difficulty: string,
    count: number,
    academicFocus?: string
  ): Promise<ExamQuestion[]> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const prompt = `Generate exactly ${count} objective multiple-choice questions for the subject "${subject}"${academicFocus ? ` specifically tailored for learners at: ${academicFocus}` : ""} at "${difficulty}" level.
Requirements:
1. Each question must have exactly 4 options labeled A, B, C, D.
2. Only ONE option must be correct.
3. Provide a concise, clear explanation for why the correct answer is right.
4. Output strictly valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "question": "What is ...?",
      "options": [
        {"key": "A", "text": "Option 1"},
        {"key": "B", "text": "Option 2"},
        {"key": "C", "text": "Option 3"},
        {"key": "D", "text": "Option 4"}
      ],
      "correctAnswer": "A",
      "explanation": "Explanation here..."
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are the EduConnects Examination Engine. You generate academically rigorous, high quality objective questions for school and university learners. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty OpenAI response");

    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions.map((q: any, i: number) => ({
        id: q.id || `q-${i + 1}`,
        questionNumber: i + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Correct answer identified by syllabus guidelines.",
      }));
    }

    throw new Error("Invalid structure returned by OpenAI");
  }

  /**
   * Retrieve fallback questions
   */
  private static getFallbackQuestions(subject: string, count: number): ExamQuestion[] {
    const subKey = subject.toLowerCase().replace(/[\s_-]+/g, "-");
    const matched =
      FALLBACK_QUESTION_BANKS[subKey] ||
      FALLBACK_QUESTION_BANKS["mathematics"];

    return matched.slice(0, count).map((q, idx) => ({
      ...q,
      questionNumber: idx + 1,
    }));
  }
}
