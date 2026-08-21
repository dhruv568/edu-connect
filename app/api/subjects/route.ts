import { apiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const subjects = [
    { id: "mathematics", name: "Mathematics", icon: "Calculator", count: 124, category: "STEM" },
    { id: "physics", name: "Physics", icon: "Atom", count: 86, category: "STEM" },
    { id: "chemistry", name: "Chemistry", icon: "FlaskConical", count: 72, category: "STEM" },
    { id: "biology", name: "Biology", icon: "Dna", count: 65, category: "STEM" },
    { id: "computer-science", name: "Computer Science", icon: "Code2", count: 110, category: "Technology" },
    { id: "english", name: "English & Literature", icon: "BookOpen", count: 95, category: "Humanities" },
    { id: "languages", name: "Foreign Languages", icon: "Languages", count: 54, category: "Languages" },
  ];

  return apiSuccess({ subjects });
}
