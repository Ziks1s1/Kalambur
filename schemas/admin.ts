import { z } from "zod";

import { examTaskTypeSchema } from "@/schemas/subject";
import { taskBankItemSchema, taskCriterionSchema } from "@/schemas/task";

export const createTaskTypeSchema = z.object({
  subjectId: z.string(),
  taskNumber: z.number().int().min(1).max(30),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  maxScore: z.number().int().min(1).max(100),
  difficulty: z.enum(["BASIC", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).default([]),
  sourceStatus: z.enum(["DEMO_SEED", "VERIFIED", "IMPORTED"]).default("DEMO_SEED"),
  isActive: z.boolean().default(true)
});

export const createTaskSchema = z.object({
  subjectId: z.string(),
  taskTypeId: z.string(),
  year: z.number().int().nullable().optional(),
  sourceType: z.string().min(1),
  sourceUrl: z.string().url().nullable().optional(),
  title: z.string().min(1),
  problemText: z.string().min(1),
  assetsJson: z.unknown().nullable().optional(),
  maxScore: z.number().int().min(1).optional(),
  metaJson: z.unknown().nullable().optional(),
  sourceStatus: z.enum(["DEMO_SEED", "VERIFIED", "IMPORTED"]).default("DEMO_SEED"),
  isPublished: z.boolean().default(true),
  criteria: z
    .array(
      taskCriterionSchema.omit({ id: true }).extend({
        id: z.string().optional()
      })
    )
    .optional(),
  referenceSolution: z.object({
    solutionText: z.string().min(1),
    notes: z.string().nullable().optional(),
    rubricJson: z.unknown().nullable().optional()
  })
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().optional()
});

export const adminTaskTypeSchema = examTaskTypeSchema;
export const adminTaskSchema = taskBankItemSchema.extend({
  criteria: z.array(taskCriterionSchema),
  referenceSolution: z
    .object({
      id: z.string(),
      solutionText: z.string(),
      notes: z.string().nullable(),
      rubricJson: z.unknown().nullable()
    })
    .nullable()
});

export const importTaskCriterionSchema = z.object({
  code: z.string().min(1).max(64),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  maxScore: z.number().int().min(0).max(100),
  sortOrder: z.number().int().min(0).default(0)
});

export const importTaskBankItemSchema = z.object({
  subjectCode: z.string().min(1).max(64),
  subjectName: z.string().min(1).max(255),
  taskTypeCode: z.string().min(1).max(64),
  taskNumber: z.number().int().min(1).max(30),
  taskTypeName: z.string().min(1).max(255),
  taskTypeDescription: z.string().min(1),
  taskTypeMaxScore: z.number().int().min(1).max(100),
  taskDifficulty: z.enum(["BASIC", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).default([]),
  sourceStatus: z.enum(["VERIFIED", "IMPORTED"]).default("VERIFIED"),
  year: z.number().int().nullable().optional(),
  sourceType: z.string().min(1).default("verified_import"),
  sourceUrl: z.string().url().nullable().optional(),
  title: z.string().min(1).max(255),
  problemText: z.string().min(1),
  assetsJson: z.unknown().nullable().optional(),
  maxScore: z.number().int().min(1).max(100),
  metaJson: z.unknown().nullable().optional(),
  isPublished: z.boolean().default(true),
  criteria: z.array(importTaskCriterionSchema).min(1),
  referenceSolution: z.object({
    solutionText: z.string().min(1),
    notes: z.string().nullable().optional(),
    rubricJson: z.unknown().nullable().optional()
  })
});

export const importTaskBankSchema = z.object({
  formatVersion: z.literal(1),
  tasks: z.array(importTaskBankItemSchema).min(1)
});

export const importTaskBankResultSchema = z.object({
  subjectsCreated: z.number().int().min(0),
  subjectsUpdated: z.number().int().min(0),
  taskTypesCreated: z.number().int().min(0),
  taskTypesUpdated: z.number().int().min(0),
  tasksCreated: z.number().int().min(0),
  tasksUpdated: z.number().int().min(0)
});

export type CreateTaskTypeInput = z.infer<typeof createTaskTypeSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ImportTaskBankInput = z.infer<typeof importTaskBankSchema>;
