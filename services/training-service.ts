import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export interface QuizOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: QuizOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface DayResource {
  title: string;
  url: string;
  type: "PDF" | "LINK" | "TEMPLATE" | "GUIDE";
}

// 15 Comprehensive Training Days Seed Definition
export const DEFAULT_15_DAYS = [
  {
    dayNumber: 1,
    title: "Platform Onboarding & Setting Up Your Digital Classroom",
    description: "Learn how the EduConnects classroom architecture works, configure your camera, microphone, and workspace lighting, and test your system connection for high-definition streaming.",
    learningObjectives: [
      "Navigate the EduConnects Educator Workspace and Classroom Studio.",
      "Calibrate hardware settings (camera framing, directional mic, lighting angles).",
      "Understand platform bandwidth requirements and failover connectivity."
    ],
    instructions: "Watch the platform walkthrough video. Complete your workspace readiness checklist, then pass the Day 1 concept check quiz to unlock Day 2.",
    videoPlaybackId: "demo_playback_day_1",
    videoDuration: 720,
    resources: [
      { title: "EduConnects Digital Classroom Setup Guide", url: "#guide", type: "PDF" },
      { title: "Hardware Calibration Checklist", url: "#checklist", type: "GUIDE" }
    ],
    quizTitle: "Day 1 Assessment: Digital Classroom Foundations",
    quizQuestions: [
      {
        id: "d1-q1",
        questionNumber: 1,
        question: "What is the recommended camera position for maintaining natural eye contact with online learners?",
        options: [
          { key: "A", text: "Positioned at or slightly above eye level" },
          { key: "B", text: "Placed below your chin looking upward" },
          { key: "C", text: "Kept 90 degrees to your side" },
          { key: "D", text: "Resting flat on your laptop keyboard" }
        ],
        correctAnswer: "A",
        explanation: "Placing your webcam at or slightly above eye level simulates natural face-to-face eye contact, enhancing learner connection."
      },
      {
        id: "d1-q2",
        questionNumber: 2,
        question: "Why should primary key lighting be placed in front of you rather than behind you?",
        options: [
          { key: "A", text: "To prevent shadows on your computer screen" },
          { key: "B", text: "To avoid silhouette effect and keep your face clearly visible" },
          { key: "C", text: "To conserve webcam sensor battery" },
          { key: "D", text: "To keep the room completely dark" }
        ],
        correctAnswer: "B",
        explanation: "Backlighting turns the educator into a dark silhouette. Placing light in front illuminates your facial expressions clearly."
      },
      {
        id: "d1-q3",
        questionNumber: 3,
        question: "Which audio equipment provides the clearest vocal fidelity for live sessions?",
        options: [
          { key: "A", text: "Built-in laptop mic in an echoey room" },
          { key: "B", text: "A dedicated condenser, dynamic USB mic, or close lapel/headset mic" },
          { key: "C", text: "A speakerphone with maximum volume feedback" },
          { key: "D", text: "No microphone (typing only)" }
        ],
        correctAnswer: "B",
        explanation: "A close microphone isolates your voice from ambient room reverberation and background noise."
      },
      {
        id: "d1-q4",
        questionNumber: 4,
        question: "What minimum stable upload speed is recommended for smooth HD interactive streaming on EduConnects?",
        options: [
          { key: "A", text: "At least 5 to 10 Mbps stable upload" },
          { key: "B", text: "0.2 Mbps" },
          { key: "C", text: "100 Kbps" },
          { key: "D", text: "Internet is not required for live classes" }
        ],
        correctAnswer: "A",
        explanation: "A 5-10 Mbps stable upstream connection guarantees smooth video frames, clear audio, and zero lag screen sharing."
      },
      {
        id: "d1-q5",
        questionNumber: 5,
        question: "What should you do before starting any live class on EduConnects?",
        options: [
          { key: "A", text: "Open 50 browser tabs and start background file downloads" },
          { key: "B", text: "Run the pre-session audio/video check and close bandwidth-heavy background apps" },
          { key: "C", text: "Mute your own audio permanently" },
          { key: "D", text: "Disable your firewall entirely" }
        ],
        correctAnswer: "B",
        explanation: "Running a pre-session check ensures your equipment is verified and leaves maximum processing power for the class."
      }
    ]
  },
  {
    dayNumber: 2,
    title: "Mastering Interactive Whiteboard & Screen Presentation",
    description: "Learn how to use digital drawing pads, dynamic whiteboard annotations, visual highlighting, and dual-monitor workflows to deliver crystal-clear visual explanations.",
    learningObjectives: [
      "Operate the EduConnects interactive whiteboard with high precision.",
      "Switch fluidly between slide presentations, coding editors, and live canvas.",
      "Incorporate digital pen annotations without cluttering the screen."
    ],
    instructions: "Watch the whiteboard demonstration video. Practice using drawing tools, screen sharing regions, and take the Day 2 quiz.",
    videoPlaybackId: "demo_playback_day_2",
    videoDuration: 840,
    resources: [
      { title: "Whiteboard Keyboard Shortcuts & Gestures", url: "#shortcuts", type: "GUIDE" },
      { title: "Digital Pen Tablet Optimization Sheet", url: "#tablet", type: "PDF" }
    ],
    quizTitle: "Day 2 Assessment: Whiteboard & Screen Mastery",
    quizQuestions: [
      {
        id: "d2-q1",
        questionNumber: 1,
        question: "When sharing your screen during a live class, what is the best practice for student privacy and focus?",
        options: [
          { key: "A", text: "Share your entire desktop including personal chat notifications" },
          { key: "B", text: "Share only the specific application window or browser tab needed for the lesson" },
          { key: "C", text: "Never share any visual materials" },
          { key: "D", text: "Continuously minimize and maximize all open windows" }
        ],
        correctAnswer: "B",
        explanation: "Sharing a specific window prevents accidental display of personal messages and keeps learners focused on the relevant topic."
      },
      {
        id: "d2-q2",
        questionNumber: 2,
        question: "Why is a digital pen tablet advantageous compared to drawing with a standard computer mouse?",
        options: [
          { key: "A", text: "It offers natural handwriting, equation notation, and pressure sensitivity" },
          { key: "B", text: "It automatically answers student questions" },
          { key: "C", text: "It increases internet download speed" },
          { key: "D", text: "It replaces the computer monitor" }
        ],
        correctAnswer: "A",
        explanation: "Writing with a pen stylus allows fluid handwriting of formulas, diagrams, and notes just like a physical blackboard."
      },
      {
        id: "d2-q3",
        questionNumber: 3,
        question: "How should an educator use whiteboard colors effectively?",
        options: [
          { key: "A", text: "Use 15 random bright neon colors on every single line" },
          { key: "B", text: "Use high contrast colors systematically (e.g. primary for notes, accent for key terms/formulas)" },
          { key: "C", text: "Write light yellow text on a white canvas" },
          { key: "D", text: "Avoid all color contrast" }
        ],
        correctAnswer: "B",
        explanation: "Consistent semantic coloring (such as green for definitions and amber for formulas) reinforces cognitive structure."
      },
      {
        id: "d2-q4",
        questionNumber: 4,
        question: "What is the primary benefit of preparing pre-drawn whiteboard templates before the session?",
        options: [
          { key: "A", text: "Saves live class time and keeps delivery crisp and structured" },
          { key: "B", text: "Allows the educator to remain silent" },
          { key: "C", text: "Eliminates student questions entirely" },
          { key: "D", text: "Prevents students from taking notes" }
        ],
        correctAnswer: "A",
        explanation: "Pre-sketching diagrams or formulas in advance frees up instructional time for interactive discussion rather than tedious drawing."
      },
      {
        id: "d2-q5",
        questionNumber: 5,
        question: "How should an educator handle whiteboard clutter during a long explanation?",
        options: [
          { key: "A", text: "Write over previously written text without erasing" },
          { key: "B", text: "Use paginated whiteboard pages or clear the canvas after summarizing key takeaways" },
          { key: "C", text: "Zoom out until the font is microscopic" },
          { key: "D", text: "Stop using the whiteboard" }
        ],
        correctAnswer: "B",
        explanation: "Saving or paging through clean canvases keeps visual clarity intact without losing earlier reference notes."
      }
    ]
  },
  {
    dayNumber: 3,
    title: "Designing Modular Curriculum & Bite-Sized Lessons",
    description: "Transform vast textbooks into structured, bite-sized learning pathways. Master chunking theory, clear prerequisite mapping, and building measurable learning outcomes.",
    learningObjectives: [
      "Deconstruct complex subject domains into 10-15 minute digestible micro-units.",
      "Define measurable Bloom's Taxonomy learning objectives for each module.",
      "Establish coherent prerequisites so students never feel lost."
    ],
    instructions: "Study curriculum modularization frameworks. Review the sample syllabus template, then take the Day 3 quiz.",
    videoPlaybackId: "demo_playback_day_3",
    videoDuration: 900,
    resources: [
      { title: "Modular Course Blueprint & Bloom's Taxonomy Chart", url: "#bloom", type: "PDF" },
      { title: "Syllabus Breakdown Spreadsheet Template", url: "#syllabus", type: "TEMPLATE" }
    ],
    quizTitle: "Day 3 Assessment: Curriculum Architecture",
    quizQuestions: [
      {
        id: "d3-q1",
        questionNumber: 1,
        question: "What is 'chunking' in digital instructional design?",
        options: [
          { key: "A", text: "Breaking comprehensive topics into bite-sized, logically cohesive units" },
          { key: "B", text: "Deleting 50% of the syllabus at random" },
          { key: "C", text: "Speaking without pausing for 2 hours" },
          { key: "D", text: "Combining unrelated subjects together" }
        ],
        correctAnswer: "A",
        explanation: "Cognitive load theory indicates that breaking information into small, focused chunks significantly boosts student retention."
      },
      {
        id: "d3-q2",
        questionNumber: 2,
        question: "Which of the following is a well-defined, measurable learning objective?",
        options: [
          { key: "A", text: "'Learners will understand physics.'" },
          { key: "B", text: "'Learners will calculate the net force and acceleration for a 2-block pulley system using Newton's laws.'" },
          { key: "C", text: "'Learners will feel happy about math.'" },
          { key: "D", text: "'Learners will read a 300-page book.'" }
        ],
        correctAnswer: "B",
        explanation: "Measurable objectives use action verbs that clearly specify the skill, method, and standard of achievement."
      },
      {
        id: "d3-q3",
        questionNumber: 3,
        question: "What is the recommended maximum duration for a single recorded video lesson?",
        options: [
          { key: "A", text: "8 to 15 minutes of focused explanation per concept" },
          { key: "B", text: "3 to 4 continuous hours" },
          { key: "C", text: "45 seconds total" },
          { key: "D", text: "At least 180 minutes" }
        ],
        correctAnswer: "A",
        explanation: "Research shows that learner attention peaks in the 8-15 minute range for on-demand instructional modules."
      },
      {
        id: "d3-q4",
        questionNumber: 4,
        question: "Why should each module begin with a brief 'Why this matters' hook?",
        options: [
          { key: "A", text: "To connect abstract theory to real-world relevance and trigger curiosity" },
          { key: "B", text: "To fill extra time" },
          { key: "C", text: "To confuse the learner" },
          { key: "D", text: "To delay the start of teaching" }
        ],
        correctAnswer: "A",
        explanation: "Providing real-world context immediately answers 'Why should I learn this?' and activates intrinsic motivation."
      },
      {
        id: "d3-q5",
        questionNumber: 5,
        question: "What is prerequisite mapping?",
        options: [
          { key: "A", text: "Explicitly stating what concepts a learner must know before tackling the new topic" },
          { key: "B", text: "Listing the address of the student's home" },
          { key: "C", text: "Charging an extra fee before every lesson" },
          { key: "D", text: "Creating a geographical map of school campuses" }
        ],
        correctAnswer: "A",
        explanation: "Prerequisite mapping prevents learning roadblocks by ensuring foundational concepts are mastered before advanced ones."
      }
    ]
  },
  {
    dayNumber: 4,
    title: "Preparing Professional Digital Teaching Materials & Slide Decks",
    description: "Create visual, high-impact teaching slides and downloadable cheat sheets without spending hours in complex design tools. Learn contrast, typography, and asset reuse.",
    learningObjectives: [
      "Apply the 6x6 rule to eliminate text-heavy slides.",
      "Select high-contrast visual diagrams that reinforce retention.",
      "Export branded PDF summaries for student download."
    ],
    instructions: "Review slide design guidelines and downloadable asset layouts. Complete the Day 4 quiz.",
    videoPlaybackId: "demo_playback_day_4",
    videoDuration: 780,
    resources: [
      { title: "Educator Slide Deck Presentation Master Template", url: "#deck", type: "TEMPLATE" },
      { title: "Visual Assets & Diagram Library Recommendations", url: "#assets", type: "GUIDE" }
    ],
    quizTitle: "Day 4 Assessment: Digital Teaching Materials",
    quizQuestions: [
      {
        id: "d4-q1",
        questionNumber: 1,
        question: "What does the 6x6 guideline in presentation design recommend?",
        options: [
          { key: "A", text: "No more than 6 bullet points per slide, with roughly 6 words per bullet" },
          { key: "B", text: "Making your presentation 6 hours long with 6 slides" },
          { key: "C", text: "Using exactly 6 different font families on every slide" },
          { key: "D", text: "Testing slides on 6 different computer monitors" }
        ],
        correctAnswer: "A",
        explanation: "The 6x6 guideline prevents cognitive overload and encourages the educator to elaborate orally rather than reading paragraphs."
      },
      {
        id: "d4-q2",
        questionNumber: 2,
        question: "Why should educators avoid reading full paragraphs word-for-word from a slide?",
        options: [
          { key: "A", text: "Learners read faster than speaking speed, causing disengagement and split attention" },
          { key: "B", text: "Microphones cannot transmit written text" },
          { key: "C", text: "Slides will expire after 30 seconds" },
          { key: "D", text: "It is illegal to read words aloud" }
        ],
        correctAnswer: "A",
        explanation: "Reading slides creates the 'split-attention effect'; learners either read ahead or tune out the spoken narration."
      },
      {
        id: "d4-q3",
        questionNumber: 3,
        question: "What minimum font size is recommended for body bullet points on teaching slides?",
        options: [
          { key: "A", text: "At least 24pt to 28pt for readability on smaller mobile screens" },
          { key: "B", text: "8pt" },
          { key: "C", text: "10pt" },
          { key: "D", text: "6pt italic script" }
        ],
        correctAnswer: "A",
        explanation: "Many students access live or recorded classes on smartphones or tablets where sub-20pt text is illegible."
      },
      {
        id: "d4-q4",
        questionNumber: 4,
        question: "What is the best format to provide supplemental lesson notes to learners?",
        options: [
          { key: "A", text: "Searchable, downloadable PDF documents with clear section headings and visual diagrams" },
          { key: "B", text: "Low resolution blurry photos of unedited handwritten paper" },
          { key: "C", text: "Unformatted text files without punctuation" },
          { key: "D", text: "Audio files with no notes" }
        ],
        correctAnswer: "A",
        explanation: "Clean PDFs are device-agnostic, searchable, easy to print, and reflect professional instructional standards."
      },
      {
        id: "d4-q5",
        questionNumber: 5,
        question: "How can visual diagrams and real-life photographs help abstract technical lessons?",
        options: [
          { key: "A", text: "They anchor abstract formulas into tangible mental models" },
          { key: "B", text: "They increase file download size unnecessarily" },
          { key: "C", text: "They prevent the teacher from having to prepare anything" },
          { key: "D", text: "They hide the topic from the students" }
        ],
        correctAnswer: "A",
        explanation: "Visual representations trigger dual coding in the brain, pairing visual and verbal memory channels."
      }
    ]
  },
  {
    dayNumber: 5,
    title: "Structuring Live HD Classes & Overcoming Camera Anxiety",
    description: "Master the 3-part live lesson architecture: Warm-up & Hook (5 mins), Interactive Core Delivery (35 mins), and Synthesis & Q&A (10 mins). Build effortless on-camera presence.",
    learningObjectives: [
      "Execute the classic 3-stage live class pacing structure.",
      "Overcome camera hesitation with conversational pacing and eye-line projection.",
      "Gracefully handle unforeseen technical interruptions during live streaming."
    ],
    instructions: "Watch the camera delivery workshop. Practice the 60-second introductory hook and pass the Day 5 quiz.",
    videoPlaybackId: "demo_playback_day_5",
    videoDuration: 850,
    resources: [
      { title: "Live Class Lesson Pacing Framework & Timer Sheet", url: "#pacing", type: "PDF" },
      { title: "Live Emergency Contingency Checklist", url: "#emergency", type: "GUIDE" }
    ],
    quizTitle: "Day 5 Assessment: Live Class Pacing & Presence",
    quizQuestions: [
      {
        id: "d5-q1",
        questionNumber: 1,
        question: "What is the ideal purpose of the first 5 minutes of a live online class?",
        options: [
          { key: "A", text: "Welcome students, recap previous concepts, and deliver an engaging hook question" },
          { key: "B", text: "Scold late arrivals and test audio in silence" },
          { key: "C", text: "Immediately assign a 50-question test with no introduction" },
          { key: "D", text: "Keep the camera off and wait for 15 minutes" }
        ],
        correctAnswer: "A",
        explanation: "A structured warm-up welcomes students by name, activates prior knowledge, and sets a welcoming, energetic classroom tone."
      },
      {
        id: "d5-q2",
        questionNumber: 2,
        question: "How does an educator overcome initial on-camera nervousness?",
        options: [
          { key: "A", text: "Speak to the webcam lens as if having a conversation with one individual student" },
          { key: "B", text: "Stare at your own self-preview window constantly" },
          { key: "C", text: "Avoid smiling or moving your hands entirely" },
          { key: "D", text: "Wear dark sunglasses indoors" }
        ],
        correctAnswer: "A",
        explanation: "Treating the camera lens as a single engaged learner normalizes delivery and projects authentic empathy."
      },
      {
        id: "d5-q3",
        questionNumber: 3,
        question: "If your home Wi-Fi briefly drops for 15 seconds during a live class, what is the best response?",
        options: [
          { key: "A", text: "Stay calm, switch to mobile hotspot failover, reconnect, briefly apologize, and resume where you left off" },
          { key: "B", text: "Panic and delete your educator account" },
          { key: "C", text: "Blame the students for the disconnection" },
          { key: "D", text: "End the entire course permanently" }
        ],
        correctAnswer: "A",
        explanation: "Minor network hiccups are normal. Having a secondary phone hotspot ready ensures swift, professional recovery."
      },
      {
        id: "d5-q4",
        questionNumber: 4,
        question: "What role does vocal variety (pitch, pacing, pauses) play in online classes?",
        options: [
          { key: "A", text: "Maintains learner alertness and signals conceptual shifts" },
          { key: "B", text: "Distracts the microphone audio filter" },
          { key: "C", text: "Is discouraged; monotone speaking is preferred" },
          { key: "D", text: "Causes video latency" }
        ],
        correctAnswer: "A",
        explanation: "Strategic vocal modulation and deliberate micro-pauses capture attention and emphasize critical points."
      },
      {
        id: "d5-q5",
        questionNumber: 5,
        question: "What should an educator accomplish in the final 5-10 minutes of a live class?",
        options: [
          { key: "A", text: "Summarize 3 core takeaways, answer priority questions, and announce next steps/homework" },
          { key: "B", text: "Abruptly disconnect the video call mid-sentence" },
          { key: "C", text: "Start teaching an entirely new 45-minute topic" },
          { key: "D", text: "Ask students to teach the next class" }
        ],
        correctAnswer: "A",
        explanation: "Synthesis reinforces what was learned, clarifies lingering confusion, and provides closure."
      }
    ]
  },
  {
    dayNumber: 6,
    title: "Interactive Student Engagement, Polls & Live Chat Management",
    description: "Prevent passive learner disengagement. Learn rapid polling strategies, cold-call protocols, chat prompt formulations, and creating an inclusive participation culture.",
    learningObjectives: [
      "Formulate rapid 30-second live check-in polls.",
      "Moderate live text chat without getting derailed from your lesson plan.",
      "Encourage hesitant learners to participate actively."
    ],
    instructions: "Watch live classroom interaction drills. Review chat management techniques and take the Day 6 quiz.",
    videoPlaybackId: "demo_playback_day_6",
    videoDuration: 810,
    resources: [
      { title: "20 Live Chat Prompts for Maximum Interaction", url: "#prompts", type: "PDF" },
      { title: "Classroom Chat Moderation Protocol", url: "#moderation", type: "GUIDE" }
    ],
    quizTitle: "Day 6 Assessment: Learner Interaction & Engagement",
    quizQuestions: [
      {
        id: "d6-q1",
        questionNumber: 1,
        question: "How often should an educator include an active learner touchpoint (e.g. chat question, poll, emoji reaction)?",
        options: [
          { key: "A", text: "Every 5 to 7 minutes" },
          { key: "B", text: "Once every 2 hours only" },
          { key: "C", text: "Never; students should strictly listen" },
          { key: "D", text: "Every 5 seconds continuously" }
        ],
        correctAnswer: "A",
        explanation: "Embedding interaction every 5-7 minutes prevents passive 'zoning out' and keeps learners actively processing ideas."
      },
      {
        id: "d6-q2",
        questionNumber: 2,
        question: "What is an effective strategy to manage a flurry of rapid chat messages while speaking?",
        options: [
          { key: "A", text: "Pause at designated checkpoint intervals (e.g. after each problem) to review and address questions" },
          { key: "B", text: "Stop your sentence every time a single word is typed" },
          { key: "C", text: "Ignore the chat completely throughout the entire semester" },
          { key: "D", text: "Disable chat permanently for all students" }
        ],
        correctAnswer: "A",
        explanation: "Setting deliberate 'Chat Checkpoint' breaks allows you to stay focused during explanation, then address questions together."
      },
      {
        id: "d6-q3",
        questionNumber: 3,
        question: "How can an educator encourage participation from shy or introverted learners?",
        options: [
          { key: "A", text: "Provide low-stakes participation options like multiple choice chat polls, 1-word answers, or emoji reactions" },
          { key: "B", text: "Force them onto video and scold them publicly" },
          { key: "C", text: "Exclude them from future classes" },
          { key: "D", text: "Deduct grades automatically" }
        ],
        correctAnswer: "A",
        explanation: "Low-barrier responses (e.g. 'Type 1 if you agree or 2 if you disagree') create a psychological safety net for all students."
      },
      {
        id: "d6-q4",
        questionNumber: 4,
        question: "What should an educator do if an off-topic debate arises in the live chat?",
        options: [
          { key: "A", text: "Politely acknowledge curiosity, state that it can be discussed in office hours, and refocus on the lesson goal" },
          { key: "B", text: "Join the off-topic debate and forget the lesson" },
          { key: "C", text: "Shout at the students" },
          { key: "D", text: "Close the meeting immediately" }
        ],
        correctAnswer: "A",
        explanation: "Graceful redirection preserves instructional momentum while showing respect for learner enthusiasm."
      },
      {
        id: "d6-q5",
        questionNumber: 5,
        question: "What is the primary benefit of live in-class micro-quizzes or polls?",
        options: [
          { key: "A", text: "Instant diagnostic insight into whether the cohort grasped the concept before moving forward" },
          { key: "B", text: "Ranking students against one another" },
          { key: "C", text: "Creating penalties for wrong answers" },
          { key: "D", text: "Saving the educator from having to speak" }
        ],
        correctAnswer: "A",
        explanation: "Live polls provide real-time formative data, showing the educator immediately if remediation is required."
      }
    ]
  },
  {
    dayNumber: 7,
    title: "Creating Effective Formative Quizzes & Diagnostic Assessments",
    description: "Learn how to formulate unambiguous multiple-choice questions, diagnostic distractors, and targeted explanations that turn assessments into learning opportunities.",
    learningObjectives: [
      "Draft objective questions with plausible, diagnostic distractors.",
      "Avoid common assessment pitfalls (double negatives, leading clues).",
      "Write formative answer explanations that clarify root misconceptions."
    ],
    instructions: "Study quiz construction best practices. Examine distractor analysis methods and complete the Day 7 quiz.",
    videoPlaybackId: "demo_playback_day_7",
    videoDuration: 750,
    resources: [
      { title: "Multiple-Choice Question Crafting Rubric", url: "#mcq", type: "PDF" },
      { title: "Diagnostic Distractor Checklist", url: "#distractors", type: "GUIDE" }
    ],
    quizTitle: "Day 7 Assessment: Diagnostic Quiz Design",
    quizQuestions: [
      {
        id: "d7-q1",
        questionNumber: 1,
        question: "What is a 'diagnostic distractor' in a multiple-choice question?",
        options: [
          { key: "A", text: "An incorrect option designed to mirror a common student misconception" },
          { key: "B", text: "A trick question that nobody can solve" },
          { key: "C", text: "A typo in the question text" },
          { key: "D", text: "An option written in a foreign language" }
        ],
        correctAnswer: "A",
        explanation: "Diagnostic distractors reveal exactly which calculation mistake or conceptual misconception a student made."
      },
      {
        id: "d7-q2",
        questionNumber: 2,
        question: "Why should educators generally avoid 'All of the above' or 'None of the above' options?",
        options: [
          { key: "A", text: "They encourage guessing and reduce the diagnostic precision of the question" },
          { key: "B", text: "They take too long to print" },
          { key: "C", text: "Prisma database rejects them" },
          { key: "D", text: "They are technically forbidden by web browsers" }
        ],
        correctAnswer: "A",
        explanation: "Learners often recognize partial clues, allowing them to guess 'All of the above' without true conceptual mastery."
      },
      {
        id: "d7-q3",
        questionNumber: 3,
        question: "What makes an explanation useful on an auto-graded digital quiz?",
        options: [
          { key: "A", text: "It explains WHY the right answer is correct and WHY common mistakes occur" },
          { key: "B", text: "It simply restates 'Option B is correct' with no detail" },
          { key: "C", text: "It insults the student for getting it wrong" },
          { key: "D", text: "It links to an unrelated website" }
        ],
        correctAnswer: "A",
        explanation: "Comprehensive explanations transform an assessment from a passive scoring sheet into an active learning moment."
      },
      {
        id: "d7-q4",
        questionNumber: 4,
        question: "What is formative assessment as opposed to summative assessment?",
        options: [
          { key: "A", text: "Low-stakes checks DURING the learning process to guide improvement, rather than a final high-stakes exam" },
          { key: "B", text: "A paper test taken in an outdoor stadium" },
          { key: "C", text: "A test graded solely by parents" },
          { key: "D", text: "An assessment with no correct answers" }
        ],
        correctAnswer: "A",
        explanation: "Formative assessments inform ongoing instruction and allow students to correct misconceptions early."
      },
      {
        id: "d7-q5",
        questionNumber: 5,
        question: "How long should a standard post-lesson verification quiz be?",
        options: [
          { key: "A", text: "3 to 5 targeted questions focusing directly on that day's core objectives" },
          { key: "B", text: "100 questions every day" },
          { key: "C", text: "Zero questions always" },
          { key: "D", text: "At least 50 questions with 10 options each" }
        ],
        correctAnswer: "A",
        explanation: "A focused 3-5 question quiz checks daily retention without inducing survey fatigue or overwhelming busy students."
      }
    ]
  },
  {
    dayNumber: 8,
    title: "Designing Homework & Project-Based Assignments",
    description: "Structure meaningful homework assignments that build practical real-world problem-solving rather than rote memorization. Set clear deadlines, file submission types, and rubrics.",
    learningObjectives: [
      "Design project milestones that synthesize multiple lecture concepts.",
      "Specify unambiguous submission formats (PDF, GitHub, video recording).",
      "Formulate scaffolded homework tasks from simple application to complex synthesis."
    ],
    instructions: "Explore assignment scaffolding techniques and practical project briefs. Take the Day 8 quiz.",
    videoPlaybackId: "demo_playback_day_8",
    videoDuration: 780,
    resources: [
      { title: "Project Assignment Scaffold Template", url: "#scaffold", type: "TEMPLATE" },
      { title: "Student Submission Quality Checklist", url: "#submission", type: "GUIDE" }
    ],
    quizTitle: "Day 8 Assessment: Assignment Architecture",
    quizQuestions: [
      {
        id: "d8-q1",
        questionNumber: 1,
        question: "What is scaffolded homework design?",
        options: [
          { key: "A", text: "Starting with guided, low-difficulty practice and gradually escalating to independent, complex synthesis" },
          { key: "B", text: "Giving only impossible questions on Day 1" },
          { key: "C", text: "Asking students to build physical scaffolding" },
          { key: "D", text: "Assigning homework without instructions" }
        ],
        correctAnswer: "A",
        explanation: "Scaffolding builds learner confidence step-by-step, ensuring foundational mechanics are solid before complex synthesis."
      },
      {
        id: "d8-q2",
        questionNumber: 2,
        question: "Why should an assignment description explicitly include the grading rubric and criteria beforehand?",
        options: [
          { key: "A", text: "It gives students complete clarity on expectations and transparently guides their effort" },
          { key: "B", text: "It allows students to skip doing the work" },
          { key: "C", text: "It prevents the teacher from grading" },
          { key: "D", text: "It is a required government tax document" }
        ],
        correctAnswer: "A",
        explanation: "Clear criteria remove ambiguity, helping students self-assess their work against known benchmarks before submitting."
      },
      {
        id: "d8-q3",
        questionNumber: 3,
        question: "What makes project-based learning effective for online students?",
        options: [
          { key: "A", text: "It requires applying theoretical knowledge to create tangible, portfolio-ready deliverables" },
          { key: "B", text: "It requires zero instructor guidance" },
          { key: "C", text: "It removes all testing from schools" },
          { key: "D", text: "It guarantees 100% exam scores without studying" }
        ],
        correctAnswer: "A",
        explanation: "Working on realistic projects deepens problem-solving abilities and gives students tangible work they can showcase."
      },
      {
        id: "d8-q4",
        questionNumber: 4,
        question: "How should an educator handle assignment deadlines for working professionals or busy students?",
        options: [
          { key: "A", text: "Establish predictable weekly submission cycles (e.g. every Sunday 11:59 PM) with clear grace period policies" },
          { key: "B", text: "Change the deadline randomly every few hours" },
          { key: "C", text: "Refuse all submissions submitted 1 second late without notice" },
          { key: "D", text: "Never set any deadlines ever" }
        ],
        correctAnswer: "A",
        explanation: "Consistent, predictable cadence helps online students manage their weekly work-study-life balance effectively."
      },
      {
        id: "d8-q5",
        questionNumber: 5,
        question: "What is an effective way to verify authentic student work in the age of generative AI?",
        options: [
          { key: "A", text: "Ask students to articulate their reasoning in a brief 2-minute Loom/audio walk-through of their solution" },
          { key: "B", text: "Ban computers entirely" },
          { key: "C", text: "Assume all students are cheating and award zero grades" },
          { key: "D", text: "Only test mental arithmetic in silence" }
        ],
        correctAnswer: "A",
        explanation: "Brief oral or video reflections prove genuine understanding and communication ability far beyond simple text submission."
      }
    ]
  },
  {
    dayNumber: 9,
    title: "Rubric-Based Grading & Constructive Audio/Video Feedback",
    description: "Deliver feedback that inspires improvement rather than discouragement. Learn 60-second audio critique techniques, constructive 'sandwich' feedback, and rubric consistency.",
    learningObjectives: [
      "Construct 4-tier rubric evaluation matrices (Exemplary, Proficient, Developing, Incomplete).",
      "Deliver 60-second high-impact personal audio/video critiques.",
      "Turn common assignment errors into class-wide mini review lessons."
    ],
    instructions: "Review sample rubrics and feedback critique models. Take the Day 9 quiz.",
    videoPlaybackId: "demo_playback_day_9",
    videoDuration: 790,
    resources: [
      { title: "Standard 4-Tier Rubric Matrix Guide", url: "#rubric", type: "PDF" },
      { title: "Audio Feedback Script & critique Framework", url: "#critique", type: "GUIDE" }
    ],
    quizTitle: "Day 9 Assessment: Rubrics & Constructive Feedback",
    quizQuestions: [
      {
        id: "d9-q1",
        questionNumber: 1,
        question: "What is the primary advantage of using standardized rubrics for grading?",
        options: [
          { key: "A", text: "Ensures objective, consistent evaluation across all students while reducing grading fatigue" },
          { key: "B", text: "Automates 100% of teaching with no human involvement" },
          { key: "C", text: "Allows the teacher to award identical scores to everyone" },
          { key: "D", text: "Eliminates the need to read assignments" }
        ],
        correctAnswer: "A",
        explanation: "Rubrics ground evaluation in explicit criteria, preventing subconscious bias and ensuring consistent standards."
      },
      {
        id: "d9-q2",
        questionNumber: 2,
        question: "What is the 'feedback sandwich' technique?",
        options: [
          { key: "A", text: "Praising genuine strengths, delivering specific constructive critique, and closing with encouragement" },
          { key: "B", text: "Eating lunch while marking papers" },
          { key: "C", text: "Hiding criticism so the student thinks everything was perfect" },
          { key: "D", text: "Giving only harsh criticism with no suggestions" }
        ],
        correctAnswer: "A",
        explanation: "Bookending constructive critique with positive recognition keeps students motivated to implement the necessary improvements."
      },
      {
        id: "d9-q3",
        questionNumber: 3,
        question: "Why do students respond so positively to personalized 60-second audio/video voice notes from their educator?",
        options: [
          { key: "A", text: "Voice tone conveys warmth, nuance, and genuine mentorship that dry text comments often lack" },
          { key: "B", text: "Audio notes can only be played once" },
          { key: "C", text: "Voice notes are encrypted by government agencies" },
          { key: "D", text: "It prevents students from asking follow-up questions" }
        ],
        correctAnswer: "A",
        explanation: "Hearing an educator's encouraging voice humanizes remote learning and eliminates the perceived coldness of text-only corrections."
      },
      {
        id: "d9-q4",
        questionNumber: 4,
        question: "How should an educator handle an assignment where a student clearly misunderstood the entire premise?",
        options: [
          { key: "A", text: "Schedule a brief 1-on-1 check-in or send a diagnostic voice note explaining the core pivot, offering a resubmission opportunity" },
          { key: "B", text: "Post the student's submission publicly to shame them" },
          { key: "C", text: "Ignore the submission and give zero feedback" },
          { key: "D", text: "Expel the student from the class" }
        ],
        correctAnswer: "A",
        explanation: "Compassionate intervention identifies whether instructions were unclear and gives the student a growth mindset path to recovery."
      },
      {
        id: "d9-q5",
        questionNumber: 5,
        question: "What should an educator do when they notice 60% of the cohort made the exact same mistake on an assignment?",
        options: [
          { key: "A", text: "Spend the first 10 minutes of the next live session doing a dedicated 'Common Traps & Solutions' review" },
          { key: "B", text: "Assume the students are not trying and fail all of them" },
          { key: "C", text: "Delete the homework from history" },
          { key: "D", text: "Blame the textbook author" }
        ],
        correctAnswer: "A",
        explanation: "A cohort-wide mistake indicates an instructional blind spot that is best addressed collectively in the next session."
      }
    ]
  },
  {
    dayNumber: 10,
    title: "Tracking Learner Analytics & Early Learning Gap Detection",
    description: "Use platform attendance metrics, quiz distribution graphs, video watch drop-offs, and completion rates to diagnose at-risk students before they fall behind.",
    learningObjectives: [
      "Interpret student completion percentages and identify drop-off drop zones.",
      "Set up early-warning outreach for students who miss 2 consecutive sessions.",
      "Use data to refine pacing and clarify confusing syllabus sections."
    ],
    instructions: "Study analytics dashboards and student retention signals. Take the Day 10 quiz.",
    videoPlaybackId: "demo_playback_day_10",
    videoDuration: 740,
    resources: [
      { title: "Educator Retention Metrics & Intervention Framework", url: "#retention", type: "PDF" },
      { title: "Early Warning Outreach Email Templates", url: "#outreach", type: "GUIDE" }
    ],
    quizTitle: "Day 10 Assessment: Learner Analytics & Interventions",
    quizQuestions: [
      {
        id: "d10-q1",
        questionNumber: 1,
        question: "What is usually the earliest indicator that an online student is at risk of dropping out?",
        options: [
          { key: "A", text: "Declining video watch time or missing 2 consecutive assignments/live sessions" },
          { key: "B", text: "Asking too many high-level questions in class" },
          { key: "C", text: "Completing assignments 3 days before the deadline" },
          { key: "D", text: "Updating their profile picture" }
        ],
        correctAnswer: "A",
        explanation: "Disengagement begins with silent behavioral drop-offs (skipping videos or attendance) days before formal withdrawal."
      },
      {
        id: "d10-q2",
        questionNumber: 2,
        question: "What is an effective early intervention when an educator notices a student has stopped attending?",
        options: [
          { key: "A", text: "Send a friendly, supportive check-in message: 'Noticed you missed our last session—is everything okay? Here's the recording recap.'" },
          { key: "B", text: "Send an aggressive legal notice immediately" },
          { key: "C", text: "Deactivate their login credentials" },
          { key: "D", text: "Do nothing at all" }
        ],
        correctAnswer: "A",
        explanation: "A proactive, caring check-in lets the student know their absence was noticed and provides an easy path back into the cohort."
      },
      {
        id: "d10-q3",
        questionNumber: 3,
        question: "If a video analytics graph shows 70% of students rewind at minute 08:30, what does that signify?",
        options: [
          { key: "A", text: "That specific concept was confusing, dense, or requires a clearer visual explanation" },
          { key: "B", text: "Students disliked the video resolution" },
          { key: "C", text: "The video file has corrupted at that second" },
          { key: "D", text: "Students were playing video games" }
        ],
        correctAnswer: "A",
        explanation: "Video heatmaps showing frequent rewinds pinpoint the exact cognitive bottlenecks that warrant supplemental explanation."
      },
      {
        id: "d10-q4",
        questionNumber: 4,
        question: "Why should educators track quiz score distributions across the entire cohort?",
        options: [
          { key: "A", text: "To determine if difficulty was calibrated correctly (e.g. bell curve) or if questions had flaws" },
          { key: "B", text: "To sell the test data to advertisers" },
          { key: "C", text: "To guarantee that 50% of the class fails" },
          { key: "D", text: "To avoid teaching future classes" }
        ],
        correctAnswer: "A",
        explanation: "Analyzing the score distribution verifies whether questions were fair, well-understood, or poorly phrased."
      },
      {
        id: "d10-q5",
        questionNumber: 5,
        question: "How can analytics help an educator iteratively improve their course curriculum?",
        options: [
          { key: "A", text: "By identifying low-completion modules and rewriting lessons that consistently cause student hesitation" },
          { key: "B", text: "By deleting all modules that students find challenging" },
          { key: "C", text: "By replacing the educator with a bot" },
          { key: "D", text: "By charging double fees for hard lessons" }
        ],
        correctAnswer: "A",
        explanation: "Continuous data-driven refinement turns a good course into an exceptional, high-completion learning experience."
      }
    ]
  },
  {
    dayNumber: 11,
    title: "Professional Communication & Handling Parent/Learner Queries",
    description: "Establish clear boundaries, office hours, responsive Q&A protocols, and empathetic stakeholder communication that builds lifelong trust and stellar reviews.",
    learningObjectives: [
      "Define professional communication channels and expected response time SLAs.",
      "Craft empathetic responses to anxious parents or frustrated students.",
      "De-escalate conflict and protect personal boundaries."
    ],
    instructions: "Study communication protocols and boundary setting guidelines. Take the Day 11 quiz.",
    videoPlaybackId: "demo_playback_day_11",
    videoDuration: 730,
    resources: [
      { title: "Educator Communication Playbook & Email Templates", url: "#communication", type: "PDF" },
      { title: "Parent Conference & Progress Review Guidelines", url: "#parent", type: "GUIDE" }
    ],
    quizTitle: "Day 11 Assessment: Professional Communication",
    quizQuestions: [
      {
        id: "d11-q1",
        questionNumber: 1,
        question: "What is the best way to manage student expectations regarding email or message response times?",
        options: [
          { key: "A", text: "State clear communication hours in your syllabus (e.g. 'Replies within 24 hours Monday-Friday between 10am-6pm')" },
          { key: "B", text: "Promise to reply within 30 seconds 24/7/365" },
          { key: "C", text: "Never reply to messages under any circumstances" },
          { key: "D", text: "Give students your personal home landline number" }
        ],
        correctAnswer: "A",
        explanation: "Clear, upfront response SLAs prevent educator burnout while setting reliable, realistic expectations for students."
      },
      {
        id: "d11-q2",
        questionNumber: 2,
        question: "When communicating with a concerned parent about a learner's declining scores, how should you frame the discussion?",
        options: [
          { key: "A", text: "Focus on partnership: highlight student strengths, pinpoint specific gap areas, and propose an actionable 2-week plan" },
          { key: "B", text: "Blame the parent for bad parenting" },
          { key: "C", text: "Tell them their child will never succeed" },
          { key: "D", text: "Block the parent's email address" }
        ],
        correctAnswer: "A",
        explanation: "Collaborative, solution-oriented communication builds trust and enlists the parent as an ally in the student's success."
      },
      {
        id: "d11-q3",
        questionNumber: 3,
        question: "Why is it critical to conduct all student messaging through official EduConnects platform channels?",
        options: [
          { key: "A", text: "Maintains transparency, security, audit logging, and safeguards privacy for both educator and student" },
          { key: "B", text: "Because other apps are banned by law" },
          { key: "C", text: "To read personal private diaries" },
          { key: "D", text: "It prevents students from learning" }
        ],
        correctAnswer: "A",
        explanation: "Keeping communication inside the platform protects personal contact details and provides a verifiable record if disputes arise."
      },
      {
        id: "d11-q4",
        questionNumber: 4,
        question: "How should an educator respond if a student sends an aggressive or impatient message?",
        options: [
          { key: "A", text: "Take a pause, reply with calm professional courtesy, acknowledge their frustration, and clarify the factual path forward" },
          { key: "B", text: "Reply with equal aggression and insults" },
          { key: "C", text: "Post their message on social media" },
          { key: "D", text: "Challenge them to an argument" }
        ],
        correctAnswer: "A",
        explanation: "De-escalating emotional tension with neutral, supportive professionalism preserves authority and diffuses conflict."
      },
      {
        id: "d11-q5",
        questionNumber: 5,
        question: "What is the purpose of holding scheduled 'Open Office Hours'?",
        options: [
          { key: "A", text: "Offers a dedicated drop-in slot for 1-on-1 doubt clearing, mentorship, and deeper question exploration" },
          { key: "B", text: "Allows the educator to take a nap during work hours" },
          { key: "C", text: "To charge additional unlisted fees" },
          { key: "D", text: "To repeat the exact live lecture word-for-word" }
        ],
        correctAnswer: "A",
        explanation: "Office hours provide flexible personalized support without fragmenting the educator's focus throughout the week."
      }
    ]
  },
  {
    dayNumber: 12,
    title: "Motivating Struggling Learners & Gamified Milestones",
    description: "Incorporate intrinsic motivation principles, small milestone badges, progress tracking celebrations, and peer collaboration that drastically reduce course abandonment.",
    learningObjectives: [
      "Implement the 'Quick Win' milestone strategy to build early momentum.",
      "Use gamification elements (streaks, badges, recognition) ethically without trivia distraction.",
      "Re-engage passive cohorts through cooperative peer study activities."
    ],
    instructions: "Study motivational psychology and gamification models. Take the Day 12 quiz.",
    videoPlaybackId: "demo_playback_day_12",
    videoDuration: 760,
    resources: [
      { title: "Gamification & Quick-Win Milestone Guide", url: "#gamification", type: "PDF" },
      { title: "Peer Study Group Facilitator Kit", url: "#peer", type: "GUIDE" }
    ],
    quizTitle: "Day 12 Assessment: Learner Motivation & Milestones",
    quizQuestions: [
      {
        id: "d12-q1",
        questionNumber: 1,
        question: "What is a 'Quick Win' in digital learning design?",
        options: [
          { key: "A", text: "An achievable, rewarding exercise within the first 1-2 days that proves to the learner they CAN succeed" },
          { key: "B", text: "Passing the entire course without doing any lessons" },
          { key: "C", text: "Guessing answers on a test" },
          { key: "D", text: "Receiving a certificate on day zero" }
        ],
        correctAnswer: "A",
        explanation: "Experiencing tangible early success triggers dopamine and dismantles self-doubt, fueling long-term persistence."
      },
      {
        id: "d12-q2",
        questionNumber: 2,
        question: "How does progress visualization (e.g. '7/15 Days Completed — 47%') influence student completion?",
        options: [
          { key: "A", text: "Leverages the Goal Gradient Effect, where learners accelerate effort as they see the finish line approaching" },
          { key: "B", text: "Discourages students from continuing" },
          { key: "C", text: "Slows down internet connection speeds" },
          { key: "D", text: "Has zero psychological impact" }
        ],
        correctAnswer: "A",
        explanation: "Seeing visible incremental progress satisfies human competence needs and increases psychological commitment to finish."
      },
      {
        id: "d12-q3",
        questionNumber: 3,
        question: "What is the difference between intrinsic and extrinsic motivation in learning?",
        options: [
          { key: "A", text: "Intrinsic motivation comes from internal curiosity and pride in mastery; extrinsic relies on external rewards/points" },
          { key: "B", text: "Intrinsic is for science; extrinsic is for languages" },
          { key: "C", text: "They are completely identical concepts" },
          { key: "D", text: "Extrinsic motivation is illegal in India" }
        ],
        correctAnswer: "A",
        explanation: "While points and badges provide a helpful initial boost, fostering true curiosity and autonomy sustains lifelong learning."
      },
      {
        id: "d12-q4",
        questionNumber: 4,
        question: "How can public peer shout-outs in class help struggling learners?",
        options: [
          { key: "A", text: "Validating effort, perseverance, and improvement (not just innate genius) inspires the entire group" },
          { key: "B", text: "Makes other students jealous and angry" },
          { key: "C", text: "Wastes class time" },
          { key: "D", text: "Replaces teaching mathematics" }
        ],
        correctAnswer: "A",
        explanation: "Praising process and resilience reinforces a growth mindset culture where mistakes are viewed as necessary stepping stones."
      },
      {
        id: "d12-q5",
        questionNumber: 5,
        question: "What is peer accountability in an online cohort?",
        options: [
          { key: "A", text: "Pairing students as study buddies or small project teams to review each other's progress" },
          { key: "B", text: "Students grading each other with harsh penalties" },
          { key: "C", text: "Students spying on each other's web browsers" },
          { key: "D", text: "Eliminating the educator entirely" }
        ],
        correctAnswer: "A",
        explanation: "Knowing a classmate is counting on you dramatically reduces absenteeism and builds authentic community."
      }
    ]
  },
  {
    dayNumber: 13,
    title: "Organizing Your Repeatable Lesson Plans & Recording Archives",
    description: "Create an organized educator operating system. Tag class recordings, curate homework solutions libraries, and build reusable modular lesson vaults that save 10 hours every week.",
    learningObjectives: [
      "Architect a cloud-based lesson archive for rapid reuse across cohorts.",
      "Index video chapter markers so students can find specific problem explanations instantly.",
      "Document standard operating procedures for session prep."
    ],
    instructions: "Study lesson vault architectures and tagging workflows. Complete the Day 13 quiz.",
    videoPlaybackId: "demo_playback_day_13",
    videoDuration: 770,
    resources: [
      { title: "Educator Digital Vault & Asset Folder Structure", url: "#vault", type: "GUIDE" },
      { title: "Video Chaptering & Timecode Blueprint", url: "#chaptering", type: "PDF" }
    ],
    quizTitle: "Day 13 Assessment: Systems & Asset Organization",
    quizQuestions: [
      {
        id: "d13-q1",
        questionNumber: 1,
        question: "Why should an educator maintain a structured, tagged archive of past lesson plans and video recordings?",
        options: [
          { key: "A", text: "Allows rapid retrieval, seamless curriculum reuse across new batches, and massive time savings" },
          { key: "B", text: "To fill up hard drive storage" },
          { key: "C", text: "To avoid teaching ever again" },
          { key: "D", text: "To hide materials from new students" }
        ],
        correctAnswer: "A",
        explanation: "Having an organized repository transforms teaching from reinventing the wheel into compounding professional intellectual property."
      },
      {
        id: "d13-q2",
        questionNumber: 2,
        question: "What is the educational benefit of adding timestamped chapter markers to lesson recordings?",
        options: [
          { key: "A", text: "Learners can instantly jump to the exact formula or problem explanation they need during exam revision" },
          { key: "B", text: "It prevents students from watching the video in order" },
          { key: "C", text: "It increases video file size tenfold" },
          { key: "D", text: "It disables sound controls" }
        ],
        correctAnswer: "A",
        explanation: "Timestamped markers make long recordings functioning reference libraries that respect student study time."
      },
      {
        id: "d13-q3",
        questionNumber: 3,
        question: "What standard folder hierarchy is recommended for an online course repository?",
        options: [
          { key: "A", text: "Organized by Unit > Module Number > (Slides, Handouts, Recording, Solution Key)" },
          { key: "B", text: "One single desktop folder with 2,000 unlabelled files" },
          { key: "C", text: "Organized randomly by date with names like 'test1.pdf'" },
          { key: "D", text: "No files saved anywhere" }
        ],
        correctAnswer: "A",
        explanation: "Predictable, modular hierarchies allow educators and teaching assistants to locate any worksheet or asset in seconds."
      },
      {
        id: "d13-q4",
        questionNumber: 4,
        question: "How should an educator organize solution keys for past assignments?",
        options: [
          { key: "A", text: "Provide step-by-step annotated solutions released automatically after the homework deadline closes" },
          { key: "B", text: "Never provide any answers to homework" },
          { key: "C", text: "Send answers before assigning the homework" },
          { key: "D", text: "Only share answers verbally at 2am" }
        ],
        correctAnswer: "A",
        explanation: "Releasing clear, worked solutions after deadlines allows learners to compare their work and identify precise calculation steps."
      },
      {
        id: "d13-q5",
        questionNumber: 5,
        question: "What is a 'pre-class checklist' and why is it valuable?",
        options: [
          { key: "A", text: "A standard 5-minute routine (mic check, slides loaded, whiteboard cleared, water nearby) ensuring smooth launches" },
          { key: "B", text: "A list of students to ban" },
          { key: "C", text: "A payment bill sent to parents daily" },
          { key: "D", text: "An internet outage simulator" }
        ],
        correctAnswer: "A",
        explanation: "Checklists reduce cognitive overhead before going live, eliminating avoidable technical scrambles."
      }
    ]
  },
  {
    dayNumber: 14,
    title: "Monetizing Your Expertise & Pricing Live Batches vs 1-on-1s",
    description: "Transition from local hourly trading to scalable online education economics. Understand group batch pricing in INR (₹), high-ticket 1-on-1 coaching, and building recurring learner cohorts.",
    learningObjectives: [
      "Calculate optimal hourly pricing for 1-on-1 live tutoring in INR (₹).",
      "Model group batch economics (e.g. 15-student cohort @ ₹1,999 vs 1-on-1).",
      "Structure introductory trial sessions that convert into long-term enrollments."
    ],
    instructions: "Study online teaching financial models and pricing structures. Complete the Day 14 quiz.",
    videoPlaybackId: "demo_playback_day_14",
    videoDuration: 830,
    resources: [
      { title: "Educator Revenue Modeling & Batch Pricing Calculator", url: "#pricing", type: "PDF" },
      { title: "Introductory Trial Session Conversion Script", url: "#trial", type: "GUIDE" }
    ],
    quizTitle: "Day 14 Assessment: Pricing Strategy & Cohort Economics",
    quizQuestions: [
      {
        id: "d14-q1",
        questionNumber: 1,
        question: "What is the economic advantage of small group live cohorts compared to strictly 1-on-1 tutoring?",
        options: [
          { key: "A", text: "Multiplies your hourly earning rate while making the per-student price much more affordable for parents" },
          { key: "B", text: "Requires zero teaching effort" },
          { key: "C", text: "Eliminates all interaction with learners" },
          { key: "D", text: "Decreases total platform revenue" }
        ],
        correctAnswer: "A",
        explanation: "A 15-student cohort at ₹2,000 each yields ₹30,000 for the batch series, far outperforming single hourly billing while delivering great value."
      },
      {
        id: "d14-q2",
        questionNumber: 2,
        question: "How should an educator conduct an introductory 1-on-1 trial session with a prospective learner?",
        options: [
          { key: "A", text: "Diagnose their specific goal/weakness, deliver a breakthrough explanation on one topic, and present a structured learning roadmap" },
          { key: "B", text: "Conduct a hard-sales pitch without teaching anything" },
          { key: "C", text: "Give them a 3-hour lecture on your personal biography" },
          { key: "D", text: "Demand immediate payment before answering any questions" }
        ],
        correctAnswer: "A",
        explanation: "Demonstrating immediate, tangible pedagogical value builds confidence and makes enrolling in your full program the obvious choice."
      },
      {
        id: "d14-q3",
        questionNumber: 3,
        question: "Why is underpricing your courses or live sessions harmful to an online educator?",
        options: [
          { key: "A", text: "Significantly underpricing signals low quality and attracts non-committed learners who rarely complete assignments" },
          { key: "B", text: "It causes the website to crash" },
          { key: "C", text: "It is technically impossible on EduConnects" },
          { key: "D", text: "It doubles your physical tax rate" }
        ],
        correctAnswer: "A",
        explanation: "Fair, value-based pricing commands respect, attracts committed learners who value education, and sustains educator investment."
      },
      {
        id: "d14-q4",
        questionNumber: 4,
        question: "How does EduConnects process educator payouts securely?",
        options: [
          { key: "A", text: "Through automated direct bank transfers and verified Cashfree payout accounts in INR (₹)" },
          { key: "B", text: "By mailing paper envelopes of cash" },
          { key: "C", text: "With gift cards to retail stores" },
          { key: "D", text: "Payouts are never delivered" }
        ],
        correctAnswer: "A",
        explanation: "EduConnects integrates enterprise Indian payment rails for transparent ledger splits and verified bank account disbursements."
      },
      {
        id: "d14-q5",
        questionNumber: 5,
        question: "What is student lifetime value (LTV) in an educator's academy?",
        options: [
          { key: "A", text: "The total educational and financial relationship over time as a learner continues through multiple courses or terms" },
          { key: "B", text: "The total number of hours a student sleeps" },
          { key: "C", text: "A one-time registration fee" },
          { key: "D", text: "The student's age" }
        ],
        correctAnswer: "A",
        explanation: "Delivering exceptional learning results turns single-session students into multi-year devotees who enroll across successive semesters."
      }
    ]
  },
  {
    dayNumber: 15,
    title: "Launching Your Online Educator Brand & Final Certification Review",
    description: "Consolidate all 15 days into an unstoppable online teaching career. Finalize your verified credentials, understand the Code of Ethics, and pass the final comprehensive certification quiz.",
    learningObjectives: [
      "Synthesize pedagogical, technological, and interactive mastery across the 15-day training.",
      "Complete the final Day 15 comprehensive certification review.",
      "Verify your official Educator profile credentials for automated certificate generation."
    ],
    instructions: "Watch the final graduation address. Review the Educator Code of Ethics, complete the Day 15 final assessment, and proceed to certificate identity confirmation.",
    videoPlaybackId: "demo_playback_day_15",
    videoDuration: 920,
    resources: [
      { title: "EduConnects Educator Code of Ethics & Professional Standards", url: "#ethics", type: "PDF" },
      { title: "Post-Certification Launch Playbook", url: "#launch", type: "GUIDE" }
    ],
    quizTitle: "Day 15 Assessment: Final Certification Comprehensive Review",
    quizQuestions: [
      {
        id: "d15-q1",
        questionNumber: 1,
        question: "What is the core mission of an EduConnects Verified Educator?",
        options: [
          { key: "A", text: "To deliver transformative, engaging, and empathetic learning experiences that empower students nationwide" },
          { key: "B", text: "To minimize speaking and maximize passive video uploads" },
          { key: "C", text: "To conduct classes without preparing materials" },
          { key: "D", text: "To trade hours for minimal impact" }
        ],
        correctAnswer: "A",
        explanation: "EduConnects educators combine deep domain knowledge with digital mastery to make world-class education accessible."
      },
      {
        id: "d15-q2",
        questionNumber: 2,
        question: "According to the EduConnects Educator Code of Ethics, how should all learners be treated?",
        options: [
          { key: "A", text: "With fairness, dignity, patience, and equal developmental encouragement regardless of background" },
          { key: "B", text: "Prioritizing only the top 5% of test-scorers" },
          { key: "C", text: "Dismissing students who ask basic clarifying questions" },
          { key: "D", text: "Sharing student grades publicly without permission" }
        ],
        correctAnswer: "A",
        explanation: "Professional educator ethics require fostering an inclusive, supportive environment where every learner is valued."
      },
      {
        id: "d15-q3",
        questionNumber: 3,
        question: "What is the requirement before your official EduConnects Completion Certificate is generated?",
        options: [
          { key: "A", text: "Complete all 15 days, pass the daily quizzes, and verify your official full name and email address" },
          { key: "B", text: "Pay an undisclosed hidden fee" },
          { key: "C", text: "Wait 6 months with no action" },
          { key: "D", text: "Take a physical exam in an office" }
        ],
        correctAnswer: "A",
        explanation: "The system requires 100% completion of training requirements followed by conscious confirmation of your verified identity."
      },
      {
        id: "d15-q4",
        questionNumber: 4,
        question: "How can future learners or institutions verify the authenticity of your EduConnects Certificate?",
        options: [
          { key: "A", text: "Through the public verification URL /certificate/verify/[certificateId] using your unique certificate ID" },
          { key: "B", text: "By calling an unlisted private phone number" },
          { key: "C", text: "Certificates cannot be verified" },
          { key: "D", text: "By physically mailing the paper to our office" }
        ],
        correctAnswer: "A",
        explanation: "Every certificate has a unique cryptographically generated verification ID that anyone can verify on the public verification portal."
      },
      {
        id: "d15-q5",
        questionNumber: 5,
        question: "What is the single most important habit for continuous growth as an online educator?",
        options: [
          { key: "A", text: "Continuously gathering learner feedback, analyzing student outcomes, and refining your delivery" },
          { key: "B", text: "Assuming your teaching can never be improved" },
          { key: "C", text: "Ignoring student reviews completely" },
          { key: "D", text: "Changing your teaching style every 24 hours" }
        ],
        correctAnswer: "A",
        explanation: "Embracing a reflective, feedback-driven mindset ensures you remain at the cutting edge of modern digital education."
      }
    ]
  }
];

/**
 * Service handling all Educator Training operations
 */
export class TrainingService {
  /**
   * Idempotently initializes the default 15-day training program and template
   */
  static async ensureDefaultProgram() {
    let program = await prisma.trainingProgram.findFirst({
      where: { slug: "15-day-educator-training" },
      include: { days: { include: { quiz: true } } },
    });

    if (program && program.days.length === 15) {
      return program;
    }

    if (!program) {
      program = await prisma.trainingProgram.create({
        data: {
          slug: "15-day-educator-training",
          title: "15-Day Educator Training Program",
          description: "Comprehensive 15-day professional intensive training transforming domain experts into elite online educators.",
          totalDays: 15,
          isSequential: true,
          status: "PUBLISHED",
        },
        include: { days: { include: { quiz: true } } },
      });
    }

    // Ensure default Certificate Template exists
    const existingTemplate = await prisma.certificateTemplate.findFirst({
      where: { isActive: true },
    });

    if (!existingTemplate) {
      await prisma.certificateTemplate.create({
        data: {
          title: "15-Day Educator Certification Template",
          badgeText: "VERIFIED EDUCATOR",
          headline: "Certificate of Completion",
          subtext: "This is proudly presented to",
          bodyText: "For successfully completing the rigorous 15-Day Educator Training Program, demonstrating mastery of live classroom delivery, curriculum design, digital pedagogy, and learner engagement.",
          issuerName: "EduConnects Academy",
          issuerTitle: "Director of Academic Excellence",
          primaryColor: "#16805B",
          accentColor: "#0D5C41",
          orientation: "LANDSCAPE",
          isActive: true,
        },
      });
    }

    // Ensure all 15 days and default quizzes exist
    for (const dayDef of DEFAULT_15_DAYS) {
      let existingDay = await prisma.trainingDay.findUnique({
        where: {
          programId_dayNumber: {
            programId: program.id,
            dayNumber: dayDef.dayNumber,
          },
        },
        include: { quiz: true },
      });

      if (!existingDay) {
        existingDay = await prisma.trainingDay.create({
          data: {
            programId: program.id,
            dayNumber: dayDef.dayNumber,
            orderIndex: dayDef.dayNumber - 1,
            title: dayDef.title,
            description: dayDef.description,
            learningObjectives: JSON.stringify(dayDef.learningObjectives),
            instructions: dayDef.instructions,
            videoPlaybackId: dayDef.videoPlaybackId,
            videoDuration: dayDef.videoDuration,
            resources: JSON.stringify(dayDef.resources),
            isPublished: true,
          },
          include: { quiz: true },
        });
      }

      if (!existingDay.quiz) {
        await prisma.trainingQuiz.create({
          data: {
            dayId: existingDay.id,
            title: dayDef.quizTitle,
            description: `Verify your understanding of ${dayDef.title}. Score at least 70% to complete Day ${dayDef.dayNumber}.`,
            passingScore: 70,
            questionCount: dayDef.quizQuestions.length,
            maxAttempts: 5,
            isPublished: true,
            questions: JSON.stringify(dayDef.quizQuestions),
          },
        });
      }
    }

    return prisma.trainingProgram.findUnique({
      where: { id: program.id },
      include: {
        days: {
          orderBy: { orderIndex: "asc" },
          include: { quiz: true },
        },
      },
    });
  }

  /**
   * Get Program details with enrolled stats for Admin
   */
  static async getAdminProgramOverview() {
    await this.ensureDefaultProgram();

    const program = await prisma.trainingProgram.findFirst({
      where: { slug: "15-day-educator-training" },
      include: {
        days: {
          orderBy: { orderIndex: "asc" },
          include: { quiz: true },
        },
      },
    });

    if (!program) throw new Error("Training Program not found.");

    const [totalEnrollments, completedEnrollments, certificateEligibleCount] = await Promise.all([
      prisma.trainingEnrollment.count({ where: { programId: program.id } }),
      prisma.trainingEnrollment.count({ where: { programId: program.id, status: "CERTIFIED" } }),
      prisma.trainingEnrollment.count({
        where: {
          programId: program.id,
          status: { in: ["CERTIFICATE_ELIGIBLE", "CERTIFIED"] },
        },
      }),
    ]);

    return {
      program,
      stats: {
        totalEnrollments,
        completedEnrollments,
        certificateEligibleCount,
        totalDays: program.days.length,
      },
    };
  }

  /**
   * Admin updates a day
   */
  static async updateDay(dayId: string, data: {
    title?: string;
    description?: string;
    learningObjectives?: string[] | string;
    instructions?: string;
    videoPlaybackId?: string;
    videoAssetId?: string;
    videoDuration?: number;
    resources?: DayResource[] | string;
    isPublished?: boolean;
    orderIndex?: number;
  }) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.videoPlaybackId !== undefined) updateData.videoPlaybackId = data.videoPlaybackId;
    if (data.videoAssetId !== undefined) updateData.videoAssetId = data.videoAssetId;
    if (data.videoDuration !== undefined) updateData.videoDuration = data.videoDuration;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;

    if (data.learningObjectives !== undefined) {
      updateData.learningObjectives = Array.isArray(data.learningObjectives)
        ? JSON.stringify(data.learningObjectives)
        : data.learningObjectives;
    }

    if (data.resources !== undefined) {
      updateData.resources = Array.isArray(data.resources)
        ? JSON.stringify(data.resources)
        : data.resources;
    }

    return prisma.trainingDay.update({
      where: { id: dayId },
      data: updateData,
      include: { quiz: true },
    });
  }

  /**
   * Admin reorders days
   */
  static async reorderDays(items: { id: string; orderIndex: number }[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.trainingDay.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        })
      )
    );
    return true;
  }

  /**
   * Admin updates a quiz
   */
  static async updateQuiz(dayId: string, data: {
    title?: string;
    description?: string;
    passingScore?: number;
    questionCount?: number;
    maxAttempts?: number;
    isPublished?: boolean;
    questions?: QuizQuestion[] | string;
  }) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.passingScore !== undefined) updateData.passingScore = data.passingScore;
    if (data.questionCount !== undefined) updateData.questionCount = data.questionCount;
    if (data.maxAttempts !== undefined) updateData.maxAttempts = data.maxAttempts;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    if (data.questions !== undefined) {
      updateData.questions = Array.isArray(data.questions)
        ? JSON.stringify(data.questions)
        : data.questions;
    }

    return prisma.trainingQuiz.upsert({
      where: { dayId },
      update: updateData,
      create: {
        dayId,
        title: data.title || "Daily Assessment",
        description: data.description || "Assessment of daily learning",
        passingScore: data.passingScore || 70,
        questionCount: data.questionCount || 5,
        maxAttempts: data.maxAttempts || 3,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        questions: updateData.questions || "[]",
      },
    });
  }

  /**
   * AI Quiz Generator: Uses OpenAI with structured prompt or fallback
   */
  static async generateAiQuizForDay(dayId: string, count: number = 5): Promise<QuizQuestion[]> {
    const day = await prisma.trainingDay.findUnique({
      where: { id: dayId },
    });

    if (!day) throw new Error("Day not found");

    const apiKey = process.env.OPENAI_API_KEY;
    let questions: QuizQuestion[] = [];

    if (apiKey && apiKey.trim().length > 0 && !apiKey.includes("your_openai_api_key_here")) {
      try {
        const openai = new OpenAI({ apiKey });
        const prompt = `Generate exactly ${count} professional, objective multiple-choice questions for training online teachers.
Topic: Day ${day.dayNumber} - ${day.title}
Description: ${day.description || ""}
Learning Objectives: ${day.learningObjectives || ""}
Instructions: ${day.instructions || ""}

Requirements:
1. Each question must have exactly 4 options labeled A, B, C, D.
2. Only ONE option must be correct.
3. The options must be realistic and test real pedagogical and digital teaching mastery.
4. Provide a clear, educational explanation for the correct answer.
5. Return strictly a valid JSON object matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "question": "Question text here?",
      "options": [
        {"key": "A", "text": "Option A"},
        {"key": "B", "text": "Option B"},
        {"key": "C", "text": "Option C"},
        {"key": "D", "text": "Option D"}
      ],
      "correctAnswer": "A",
      "explanation": "Explanation why A is correct..."
    }
  ]
}`;

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are the EduConnects Educator Academy Examination Engine. Generate rigorous, high-quality assessment questions for educators. Return only JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            questions = parsed.questions.map((q: any, idx: number) => ({
              id: `ai-d${day.dayNumber}-q${idx + 1}-${Date.now().toString(36)}`,
              questionNumber: idx + 1,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || "Correct answer.",
            }));
          }
        }
      } catch (err) {
        console.warn("[TrainingService] AI quiz generation failed, falling back to curated bank:", err);
      }
    }

    if (questions.length === 0) {
      // Find curated fallback questions for this day or generate clean defaults
      const fallbackDay = DEFAULT_15_DAYS.find((d) => d.dayNumber === day.dayNumber);
      if (fallbackDay && fallbackDay.quizQuestions.length > 0) {
        questions = fallbackDay.quizQuestions.slice(0, count) as QuizQuestion[];
      } else {
        questions = [
          {
            id: `fb-d${day.dayNumber}-q1`,
            questionNumber: 1,
            question: `What is the primary instructional goal of ${day.title}?`,
            options: [
              { key: "A", text: "To master practical digital delivery and learner success" },
              { key: "B", text: "To replace human teaching with automated algorithms" },
              { key: "C", text: "To avoid interacting with students" },
              { key: "D", text: "To delay course completion" },
            ],
            correctAnswer: "A",
            explanation: "EduConnects training focuses on practical, student-centered digital teaching mastery.",
          },
        ];
      }
    }

    return questions;
  }

  /**
   * Enroll or resolve enrollment for an authenticated Educator
   */
  static async getOrCreateEnrollment(userId: string) {
    const program = await this.ensureDefaultProgram();
    if (!program) throw new Error("Training Program unavailable");

    let enrollment = await prisma.trainingEnrollment.findUnique({
      where: {
        programId_userId: {
          programId: program.id,
          userId,
        },
      },
      include: {
        dayProgress: true,
        certificate: true,
      },
    });

    if (!enrollment) {
      enrollment = await prisma.trainingEnrollment.create({
        data: {
          programId: program.id,
          userId,
          status: "ENROLLED",
          currentDay: 1,
          completedDaysCount: 0,
          completionPercentage: 0,
        },
        include: {
          dayProgress: true,
          certificate: true,
        },
      });

      // Initialize Day 1 progress record
      const day1 = program.days.find((d) => d.dayNumber === 1);
      if (day1) {
        await prisma.trainingDayProgress.create({
          data: {
            enrollmentId: enrollment.id,
            dayId: day1.id,
            dayNumber: 1,
          },
        });
      }
    }

    return enrollment;
  }

  /**
   * Get Educator Roadmap (Days 1 to 15 with lock/unlock and progress statuses)
   */
  static async getEducatorRoadmap(userId: string) {
    const program = await this.ensureDefaultProgram();
    const enrollment = await this.getOrCreateEnrollment(userId);

    // Fetch all progress records for this enrollment
    const progressList = await prisma.trainingDayProgress.findMany({
      where: { enrollmentId: enrollment.id },
    });

    const progressMap = new Map<number, any>();
    progressList.forEach((p) => progressMap.set(p.dayNumber, p));

    // Calculate sequential status
    // Day 1 is always unlocked.
    // Day N is unlocked if Day N-1 is completed.
    const daysWithStatus = program!.days.map((day) => {
      const progress = progressMap.get(day.dayNumber);
      const isCompleted = Boolean(progress?.isCompleted);
      let isUnlocked = false;

      if (!program!.isSequential) {
        isUnlocked = true;
      } else if (day.dayNumber === 1) {
        isUnlocked = true;
      } else {
        const prevProgress = progressMap.get(day.dayNumber - 1);
        isUnlocked = Boolean(prevProgress?.isCompleted);
      }

      let status = "LOCKED";
      if (isCompleted) {
        status = "COMPLETED";
      } else if (isUnlocked) {
        if (progress?.videoWatched || progress?.contentCompleted) {
          status = progress?.quizPassed ? "COMPLETED" : "QUIZ_PENDING";
        } else {
          status = "IN_PROGRESS";
        }
      }

      return {
        id: day.id,
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description,
        learningObjectives: day.learningObjectives ? JSON.parse(day.learningObjectives) : [],
        instructions: day.instructions,
        videoPlaybackId: day.videoPlaybackId,
        videoDuration: day.videoDuration,
        resources: day.resources ? JSON.parse(day.resources) : [],
        isPublished: day.isPublished,
        status,
        isUnlocked,
        isLocked: !isUnlocked,
        isCompleted,
        progress: progress
          ? {
              videoWatched: progress.videoWatched,
              contentCompleted: progress.contentCompleted,
              quizPassed: progress.quizPassed,
              bestScore: progress.bestScore,
              completedAt: progress.completedAt,
            }
          : null,
      };
    });

    const completedDaysCount = daysWithStatus.filter((d) => d.isCompleted).length;
    const completionPercentage = Math.round((completedDaysCount / 15) * 100);

    // Check certificate eligibility: All 15 days completed
    const isCertificateEligible = completedDaysCount === 15;
    let enrollmentStatus = enrollment.status;

    if (enrollment.certificate) {
      enrollmentStatus = "CERTIFIED";
    } else if (isCertificateEligible) {
      enrollmentStatus = "CERTIFICATE_ELIGIBLE";
      if (enrollment.status !== "CERTIFICATE_ELIGIBLE" && enrollment.status !== "CERTIFIED") {
        await prisma.trainingEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: "CERTIFICATE_ELIGIBLE",
            certificateEligibleAt: new Date(),
            completedDaysCount: 15,
            completionPercentage: 100,
            completedAt: new Date(),
          },
        });
      }
    }

    return {
      enrollment: {
        id: enrollment.id,
        status: enrollmentStatus,
        completedDaysCount,
        totalDays: 15,
        completionPercentage,
        isCertificateEligible,
        hasCertificate: Boolean(enrollment.certificate),
        certificateNumber: enrollment.certificate?.certificateNumber || null,
        certificateId: enrollment.certificate?.id || null,
      },
      days: daysWithStatus,
    };
  }

  /**
   * Get single Day details for an Educator (verifies sequential access server-side)
   */
  static async getEducatorDay(userId: string, dayNumber: number) {
    const roadmap = await this.getEducatorRoadmap(userId);
    const dayItem = roadmap.days.find((d) => d.dayNumber === dayNumber);

    if (!dayItem) {
      throw new Error(`Day ${dayNumber} does not exist.`);
    }

    if (!dayItem.isUnlocked) {
      throw new Error(`Day ${dayNumber} is locked. Please complete Day ${dayNumber - 1} first.`);
    }

    const day = await prisma.trainingDay.findUnique({
      where: { id: dayItem.id },
      include: { quiz: true },
    });

    // Strip out correct answers and explanations for educator client consumption
    let clientQuiz: any = null;
    if (day?.quiz && day.quiz.isPublished) {
      let rawQuestions: QuizQuestion[] = [];
      try {
        rawQuestions = JSON.parse(day.quiz.questions);
      } catch {}

      const clientQuestions = rawQuestions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
      }));

      clientQuiz = {
        id: day.quiz.id,
        title: day.quiz.title,
        description: day.quiz.description,
        passingScore: day.quiz.passingScore,
        questionCount: clientQuestions.length,
        maxAttempts: day.quiz.maxAttempts,
        questions: clientQuestions,
      };
    }

    return {
      day: dayItem,
      quiz: clientQuiz,
      roadmapProgress: {
        completedDaysCount: roadmap.enrollment.completedDaysCount,
        completionPercentage: roadmap.enrollment.completionPercentage,
        isCertificateEligible: roadmap.enrollment.isCertificateEligible,
      },
    };
  }

  /**
   * Mark Day Video or Content completed (server-side)
   */
  static async completeDayContent(userId: string, dayNumber: number, videoWatched: boolean = true) {
    const enrollment = await this.getOrCreateEnrollment(userId);
    const program = await prisma.trainingProgram.findFirst({
      where: { slug: "15-day-educator-training" },
    });

    const day = await prisma.trainingDay.findUnique({
      where: {
        programId_dayNumber: {
          programId: program!.id,
          dayNumber,
        },
      },
    });

    if (!day) throw new Error("Day not found.");

    // Sequential verification: Day N requires Day N-1 completed
    if (program!.isSequential && dayNumber > 1) {
      const prevProgress = await prisma.trainingDayProgress.findFirst({
        where: {
          enrollmentId: enrollment.id,
          dayNumber: dayNumber - 1,
          isCompleted: true,
        },
      });

      if (!prevProgress) {
        throw new Error(`Cannot complete Day ${dayNumber}. Complete Day ${dayNumber - 1} first.`);
      }
    }

    const progress = await prisma.trainingDayProgress.upsert({
      where: {
        enrollmentId_dayId: {
          enrollmentId: enrollment.id,
          dayId: day.id,
        },
      },
      update: {
        videoWatched: true,
        contentCompleted: true,
      },
      create: {
        enrollmentId: enrollment.id,
        dayId: day.id,
        dayNumber,
        videoWatched: true,
        contentCompleted: true,
      },
    });

    return progress;
  }

  /**
   * Submit Quiz attempt, grade server-side, check pass/fail, and mark day complete if passed
   */
  static async submitQuizAttempt(
    userId: string,
    dayNumber: number,
    answers: Record<string, "A" | "B" | "C" | "D">
  ) {
    const enrollment = await this.getOrCreateEnrollment(userId);
    const program = await prisma.trainingProgram.findFirst({
      where: { slug: "15-day-educator-training" },
    });

    const day = await prisma.trainingDay.findUnique({
      where: {
        programId_dayNumber: {
          programId: program!.id,
          dayNumber,
        },
      },
      include: { quiz: true },
    });

    if (!day || !day.quiz) {
      throw new Error("Quiz not found for this day.");
    }

    // Verify sequential access
    if (program!.isSequential && dayNumber > 1) {
      const prevProgress = await prisma.trainingDayProgress.findFirst({
        where: {
          enrollmentId: enrollment.id,
          dayNumber: dayNumber - 1,
          isCompleted: true,
        },
      });
      if (!prevProgress) {
        throw new Error(`Cannot take Day ${dayNumber} quiz. Day ${dayNumber - 1} is not completed.`);
      }
    }

    // Count previous attempts
    const previousAttemptsCount = await prisma.trainingQuizAttempt.count({
      where: {
        enrollmentId: enrollment.id,
        quizId: day.quiz.id,
      },
    });

    if (day.quiz.maxAttempts > 0 && previousAttemptsCount >= day.quiz.maxAttempts) {
      // Check if already passed
      const passedAttempt = await prisma.trainingQuizAttempt.findFirst({
        where: {
          enrollmentId: enrollment.id,
          quizId: day.quiz.id,
          passed: true,
        },
      });
      if (!passedAttempt) {
        throw new Error(`Maximum attempts (${day.quiz.maxAttempts}) reached for this quiz.`);
      }
    }

    // Server-side grading
    let questions: QuizQuestion[] = [];
    try {
      questions = JSON.parse(day.quiz.questions);
    } catch {}

    let correctAnswersCount = 0;
    const review = questions.map((q) => {
      const selected = answers[q.id] || null;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctAnswersCount++;

      return {
        id: q.id,
        questionNumber: q.questionNumber,
        question: q.question,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = questions.length;
    const scorePercentage = Math.round((correctAnswersCount / (totalQuestions || 1)) * 100);
    const passed = scorePercentage >= day.quiz.passingScore;

    // Record attempt
    await prisma.trainingQuizAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        quizId: day.quiz.id,
        attemptNumber: previousAttemptsCount + 1,
        totalQuestions,
        correctAnswers: correctAnswersCount,
        scorePercentage,
        passed,
        answers: JSON.stringify(answers),
      },
    });

    // Update Day Progress
    const existingProgress = await prisma.trainingDayProgress.findUnique({
      where: {
        enrollmentId_dayId: {
          enrollmentId: enrollment.id,
          dayId: day.id,
        },
      },
    });

    const shouldMarkComplete = passed;
    const bestScore = Math.max(existingProgress?.bestScore || 0, scorePercentage);

    await prisma.trainingDayProgress.upsert({
      where: {
        enrollmentId_dayId: {
          enrollmentId: enrollment.id,
          dayId: day.id,
        },
      },
      update: {
        quizPassed: passed || existingProgress?.quizPassed,
        bestScore,
        videoWatched: true,
        contentCompleted: true,
        ...(shouldMarkComplete
          ? { isCompleted: true, completedAt: existingProgress?.completedAt || new Date() }
          : {}),
      },
      create: {
        enrollmentId: enrollment.id,
        dayId: day.id,
        dayNumber,
        quizPassed: passed,
        bestScore,
        videoWatched: true,
        contentCompleted: true,
        isCompleted: shouldMarkComplete,
        completedAt: shouldMarkComplete ? new Date() : null,
      },
    });

    // Recompute overall enrollment stats
    const roadmap = await this.getEducatorRoadmap(userId);

    return {
      dayNumber,
      passed,
      scorePercentage,
      passingScore: day.quiz.passingScore,
      correctAnswersCount,
      totalQuestions,
      attemptNumber: previousAttemptsCount + 1,
      review,
      nextDayUnlocked: passed && dayNumber < 15,
      isDayCompleted: shouldMarkComplete,
      roadmapProgress: {
        completedDaysCount: roadmap.enrollment.completedDaysCount,
        completionPercentage: roadmap.enrollment.completionPercentage,
        isCertificateEligible: roadmap.enrollment.isCertificateEligible,
      },
    };
  }
}
