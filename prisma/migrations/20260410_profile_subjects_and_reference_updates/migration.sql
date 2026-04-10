-- Add optional answer/reference fields and stable attempt file ordering
ALTER TABLE "ReferenceSolution"
  ADD COLUMN "correctAnswer" TEXT,
  ALTER COLUMN "solutionText" DROP NOT NULL;

ALTER TABLE "AttemptFile"
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "AttemptFile_attemptId_sortOrder_idx" ON "AttemptFile"("attemptId", "sortOrder");

-- Persist chosen subjects per user
CREATE TABLE "UserSubject" (
  "userId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSubject_pkey" PRIMARY KEY ("userId","subjectId"),
  CONSTRAINT "UserSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "UserSubject_subjectId_idx" ON "UserSubject"("subjectId");
