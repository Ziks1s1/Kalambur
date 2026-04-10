import { z } from "zod";

import { subjectSchema } from "@/schemas/subject";
import { userResponseSchema } from "@/schemas/auth";

export const userActivityDaySchema = z.object({
  date: z.string(),
  attemptCount: z.number().int().min(0)
});

export const userTaskTypeStatSchema = z.object({
  taskTypeId: z.string(),
  taskTypeName: z.string(),
  taskNumber: z.number().int(),
  averageScore: z.number(),
  averageRate: z.number(),
  checkedCount: z.number().int()
});

export const userSubjectProfileStatSchema = z.object({
  subjectId: z.string(),
  subjectName: z.string(),
  averageScore: z.number(),
  checkedCount: z.number().int(),
  taskTypes: z.array(userTaskTypeStatSchema)
});

export const userProfileSchema = z.object({
  user: userResponseSchema,
  selectedSubjects: z.array(subjectSchema),
  availableSubjects: z.array(subjectSchema),
  activityDays: z.array(userActivityDaySchema),
  subjectStats: z.array(userSubjectProfileStatSchema)
});

export const updateUserSubjectsSchema = z.object({
  subjectIds: z.array(z.string()).min(1)
});
