ALTER TABLE "student_profiles"
ADD COLUMN IF NOT EXISTS "stream" TEXT;

ALTER TABLE "student_profiles"
ADD COLUMN IF NOT EXISTS "competitiveExam" TEXT;

ALTER TABLE "student_profiles"
ADD COLUMN IF NOT EXISTS "diplomaBranch" TEXT;
