import { z } from "zod";

export const statisticsItemSchema = z.object({
  subjectId: z.string(),
  subjectName: z.string(),
  solvedCount: z.number().int(),
  checkedCount: z.number().int(),
  averageScore: z.number(),
  completionRate: z.number(),
  weakTopics: z.array(z.string()),
  strongTopics: z.array(z.string()),
  lastCalculatedAt: z.string()
});

export const recentAttemptSchema = z.object({
  attemptId: z.string(),
  taskTitle: z.string(),
  taskTypeName: z.string(),
  score: z.number().nullable(),
  checkedAt: z.string().nullable()
});

export const subjectStatisticsSchema = statisticsItemSchema.extend({
  recentAttempts: z.array(recentAttemptSchema)
});
