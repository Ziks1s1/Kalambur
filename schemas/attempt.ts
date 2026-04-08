import { z } from "zod";

import { aiCheckResultSchema } from "@/schemas/ai-check";

export const createAttemptSchema = z.object({
  variantTaskId: z.string(),
  comment: z.string().trim().max(5000).optional()
});

export const uploadAttemptResponseSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      fileUrl: z.string(),
      storageKey: z.string(),
      mimeType: z.string(),
      size: z.number().int(),
      width: z.number().int().nullable(),
      height: z.number().int().nullable()
    })
  )
});

export const attemptSchema = z.object({
  id: z.string(),
  userId: z.string(),
  variantTaskId: z.string(),
  comment: z.string().nullable(),
  status: z.enum(["DRAFT", "UPLOADED", "SUBMITTED", "CHECKED", "FAILED"]),
  submittedAt: z.string().nullable(),
  checkedAt: z.string().nullable(),
  files: uploadAttemptResponseSchema.shape.files,
  aiCheck: aiCheckResultSchema
    .extend({
      id: z.string(),
      model: z.string(),
      createdAt: z.string()
    })
    .nullable()
});

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;
