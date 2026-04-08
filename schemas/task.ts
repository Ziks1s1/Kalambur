import { z } from "zod";

import { examTaskTypeSchema, subjectSchema } from "@/schemas/subject";

export const taskCriterionSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  maxScore: z.number().int(),
  sortOrder: z.number().int()
});

export const referenceSolutionSchema = z.object({
  id: z.string(),
  solutionText: z.string(),
  notes: z.string().nullable(),
  rubricJson: z.unknown().nullable()
});

export const taskBankItemSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  taskTypeId: z.string(),
  year: z.number().int().nullable(),
  sourceType: z.string(),
  sourceUrl: z.string().nullable(),
  title: z.string(),
  problemText: z.string(),
  assetsJson: z.unknown().nullable(),
  maxScore: z.number().int(),
  metaJson: z.unknown().nullable(),
  sourceStatus: z.enum(["DEMO_SEED", "VERIFIED", "IMPORTED"]),
  isPublished: z.boolean(),
  taskType: examTaskTypeSchema.optional(),
  subject: subjectSchema.optional(),
  criteria: z.array(taskCriterionSchema).optional(),
  referenceSolution: referenceSolutionSchema.nullable().optional()
});

export type TaskBankItemDto = z.infer<typeof taskBankItemSchema>;
export type TaskCriterionDto = z.infer<typeof taskCriterionSchema>;
