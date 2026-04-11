import { z } from "zod";

export const aiCriterionBreakdownSchema = z.object({
  criterionCode: z.string(),
  criterionTitle: z.string(),
  awardedScore: z.number().int().min(0),
  maxScore: z.number().int().min(0),
  comment: z.string()
});

export const aiCheckResultSchema = z.object({
  totalScore: z.number().int().min(0),
  maxScore: z.number().int().min(0),
  criterionBreakdown: z.array(aiCriterionBreakdownSchema),
  confidence: z.number().min(0).max(1),
  extractedText: z.string()
});

export type AICheckResult = z.infer<typeof aiCheckResultSchema>;
