import { z } from "zod";

import { attemptSchema } from "@/schemas/attempt";
import { taskBankItemSchema } from "@/schemas/task";

export const createVariantSchema = z.object({
  subjectId: z.string(),
  mode: z.enum(["FULL_SECOND_PART", "TASK_TYPE_PRACTICE"]).default("TASK_TYPE_PRACTICE"),
  taskIds: z.array(z.string()).optional(),
  taskTypeIds: z.array(z.string()).optional(),
  taskCount: z.number().int().min(1).max(10).default(3)
});

export const switchTaskSchema = z.object({
  variantTaskId: z.string()
});

export const variantTaskSchema = z.object({
  id: z.string(),
  orderIndex: z.number().int(),
  isCompleted: z.boolean(),
  taskBankItem: taskBankItemSchema,
  latestAttempt: attemptSchema
    .pick({
      id: true,
      status: true,
      checkedAt: true,
      aiCheck: true
    })
    .nullable()
});

export const generatedVariantSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  tasks: z.array(variantTaskSchema)
});

export const currentVariantTaskSchema = z.object({
  variant: generatedVariantSchema,
  currentTask: variantTaskSchema.nullable()
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
