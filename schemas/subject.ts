import { z } from "zod";

export const subjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  isActive: z.boolean()
});

export const examTaskTypeSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  taskNumber: z.number().int(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  maxScore: z.number().int(),
  difficulty: z.enum(["BASIC", "MEDIUM", "HARD"]),
  tags: z.array(z.string()),
  sourceStatus: z.enum(["DEMO_SEED", "VERIFIED", "IMPORTED"]),
  isActive: z.boolean()
});

export const subjectWithTaskTypesSchema = subjectSchema.extend({
  taskTypes: z.array(examTaskTypeSchema)
});

export type SubjectDto = z.infer<typeof subjectSchema>;
export type ExamTaskTypeDto = z.infer<typeof examTaskTypeSchema>;
