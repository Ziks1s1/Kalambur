import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { buildDefaultCriteriaForTaskType, getCanonicalMathProfileCriteriaText } from "@/lib/demo/content";
import { AppError } from "@/lib/errors/app-error";

const TASK_NUMBERS = [13, 14, 15, 16, 17, 18, 19] as const;

const MATH_PROFILE_IMPORT_MANIFEST: Record<
  number,
  Array<{
    index: number;
    taskImageUrl: string;
    referenceImageUrl: string;
  }>
> = {
  13: [
    { index: 1, taskImageUrl: "/task-bank/math-profile/13 задание/1 задание задача.png", referenceImageUrl: "/task-bank/math-profile/13 задание/1 задание ответ.png" },
    { index: 2, taskImageUrl: "/task-bank/math-profile/13 задание/2 задание задача.png", referenceImageUrl: "/task-bank/math-profile/13 задание/2 задание ответ.png" },
    { index: 3, taskImageUrl: "/task-bank/math-profile/13 задание/3 задание задача.png", referenceImageUrl: "/task-bank/math-profile/13 задание/3 задание ответ.png" },
    { index: 4, taskImageUrl: "/task-bank/math-profile/13 задание/4 задание задача.png", referenceImageUrl: "/task-bank/math-profile/13 задание/4 задание ответ.png" }
  ],
  14: [
    { index: 1, taskImageUrl: "/task-bank/math-profile/14 задание/1 задание задача.png", referenceImageUrl: "/task-bank/math-profile/14 задание/1 задание ответ.png" },
    { index: 2, taskImageUrl: "/task-bank/math-profile/14 задание/2 задание задача.png", referenceImageUrl: "/task-bank/math-profile/14 задание/2 задача ответ.png" },
    { index: 3, taskImageUrl: "/task-bank/math-profile/14 задание/3 задание задача.png", referenceImageUrl: "/task-bank/math-profile/14 задание/3 задание ответ.png" },
    { index: 4, taskImageUrl: "/task-bank/math-profile/14 задание/4 задание задача.png", referenceImageUrl: "/task-bank/math-profile/14 задание/4 задание ответ.png" }
  ],
  15: [
    { index: 1, taskImageUrl: "/task-bank/math-profile/15 задание/1 задание задача.png", referenceImageUrl: "/task-bank/math-profile/15 задание/1 задание ответ.png" },
    { index: 2, taskImageUrl: "/task-bank/math-profile/15 задание/2 задание задача.png", referenceImageUrl: "/task-bank/math-profile/15 задание/2 задание ответ.png" },
    { index: 3, taskImageUrl: "/task-bank/math-profile/15 задание/3 задание задача.png", referenceImageUrl: "/task-bank/math-profile/15 задание/3 задание ответ.png" },
    { index: 4, taskImageUrl: "/task-bank/math-profile/15 задание/4 задание задача.png", referenceImageUrl: "/task-bank/math-profile/15 задание/Снимок экрана 2026-04-09 173249.png" }
  ],
  16: [
    { index: 1, taskImageUrl: "/task-bank/math-profile/16 задание/1 задание задача.png", referenceImageUrl: "/task-bank/math-profile/16 задание/1 задание ответ.png" },
    { index: 2, taskImageUrl: "/task-bank/math-profile/16 задание/2 задание задача.png", referenceImageUrl: "/task-bank/math-profile/16 задание/2 задание ответ.png" },
    { index: 3, taskImageUrl: "/task-bank/math-profile/16 задание/3 задание задача.png", referenceImageUrl: "/task-bank/math-profile/16 задание/3 задание ответ.png" },
    { index: 4, taskImageUrl: "/task-bank/math-profile/16 задание/4 задание задача.png", referenceImageUrl: "/task-bank/math-profile/16 задание/4 задание ответ.png" }
  ],
  17: [
    { index: 1, taskImageUrl: "/task-bank/math-profile/17 задание/1 задание задача.png", referenceImageUrl: "/task-bank/math-profile/17 задание/1 задание ответ.png" },
    { index: 2, taskImageUrl: "/task-bank/math-profile/17 задание/2 задание задача.png", referenceImageUrl: "/task-bank/math-profile/17 задание/2 задание ответ.png" },
    { index: 3, taskImageUrl: "/task-bank/math-profile/17 задание/3 задание задача.png", referenceImageUrl: "/task-bank/math-profile/17 задание/3 задание ответ.png" },
    { index: 4, taskImageUrl: "/task-bank/math-profile/17 задание/4 задание задача.png", referenceImageUrl: "/task-bank/math-profile/17 задание/Снимок экрана 2026-04-09 174019.png" }
  ],
  18: [
    { index: 1, taskImageUrl: "/task-bank/math-profile/18 задание/1 задание задача.png", referenceImageUrl: "/task-bank/math-profile/18 задание/1 задание ответ.png" },
    { index: 2, taskImageUrl: "/task-bank/math-profile/18 задание/2 задание задача.png", referenceImageUrl: "/task-bank/math-profile/18 задание/Снимок экрана 2026-04-09 174249.png" }
  ],
  19: [
    { index: 1, taskImageUrl: "/task-bank/math-profile/19 задание/1 задание задача.png", referenceImageUrl: "/task-bank/math-profile/19 задание/1 задание ответ.png" },
    { index: 2, taskImageUrl: "/task-bank/math-profile/19 задание/2 задание задача.png", referenceImageUrl: "/task-bank/math-profile/19 задание/2 задание ответ.png" }
  ]
};

function toPrismaJson(value: unknown) {
  return value ?? Prisma.JsonNull;
}

export class MathProfileImportService {
  async ensureImported() {
    const subject = await db.subject.findUnique({
      where: { code: "math_profile" }
    });

    if (!subject) {
      throw new AppError("Math profile subject not found", 500, "MATH_PROFILE_SUBJECT_NOT_FOUND");
    }

    const taskTypes = await db.examTaskType.findMany({
      where: {
        subjectId: subject.id,
        taskNumber: { in: [...TASK_NUMBERS] }
      },
      orderBy: { taskNumber: "asc" }
    });

    const taskTypeMap = new Map(taskTypes.map((item) => [item.taskNumber, item]));

    for (const taskNumber of TASK_NUMBERS) {
      const taskType = taskTypeMap.get(taskNumber);

      if (!taskType) {
        continue;
      }

      const manifestItems = MATH_PROFILE_IMPORT_MANIFEST[taskNumber] ?? [];
      const criteria = buildDefaultCriteriaForTaskType({
        subjectCode: subject.code,
        taskTypeCode: taskType.code,
        taskTypeName: taskType.name,
        taskNumber: taskType.taskNumber,
        maxScore: taskType.maxScore
      });
      const criteriaText = getCanonicalMathProfileCriteriaText(taskNumber);

      for (const item of manifestItems) {
        const title = `Профильная математика №${taskNumber}.${item.index}`;

        const existingTask = await db.taskBankItem.findFirst({
          where: {
            subjectId: subject.id,
            taskTypeId: taskType.id,
            title
          }
        });

        const task = existingTask
          ? await db.taskBankItem.update({
              where: { id: existingTask.id },
              data: {
                sourceType: "math_profile_static_import",
                title,
                problemText: "См. изображение условия задания.",
                assetsJson: toPrismaJson({
                  imageUrls: [item.taskImageUrl]
                }),
                metaJson: toPrismaJson({
                  importKey: `math_profile:${taskNumber}:${item.index}`,
                  taskNumber,
                  itemNumber: item.index,
                  taskImageUrl: item.taskImageUrl,
                  referenceImageUrl: item.referenceImageUrl
                }),
                maxScore: taskType.maxScore,
                sourceStatus: "IMPORTED",
                isPublished: true
              }
            })
          : await db.taskBankItem.create({
              data: {
                subjectId: subject.id,
                taskTypeId: taskType.id,
                sourceType: "math_profile_static_import",
                title,
                problemText: "См. изображение условия задания.",
                assetsJson: toPrismaJson({
                  imageUrls: [item.taskImageUrl]
                }),
                metaJson: toPrismaJson({
                  importKey: `math_profile:${taskNumber}:${item.index}`,
                  taskNumber,
                  itemNumber: item.index,
                  taskImageUrl: item.taskImageUrl,
                  referenceImageUrl: item.referenceImageUrl
                }),
                maxScore: taskType.maxScore,
                sourceStatus: "IMPORTED",
                isPublished: true
              }
            });

        await db.taskCriterion.deleteMany({
          where: { taskBankItemId: task.id }
        });

        await db.taskCriterion.createMany({
          data: criteria.map((criterion) => ({
            taskBankItemId: task.id,
            code: criterion.code,
            title: criterion.title,
            description: criterion.description,
            maxScore: criterion.maxScore,
            sortOrder: criterion.sortOrder
          }))
        });

        await db.referenceSolution.upsert({
          where: {
            taskBankItemId: task.id
          },
          update: {
            solutionText: null,
            correctAnswer: null,
            notes: "Эталон хранится изображением.",
            rubricJson: toPrismaJson({
              criteriaText,
              referenceImageUrls: [item.referenceImageUrl],
              importKey: `math_profile:${taskNumber}:${item.index}`
            })
          },
          create: {
            taskBankItemId: task.id,
            solutionText: null,
            correctAnswer: null,
            notes: "Эталон хранится изображением.",
            rubricJson: toPrismaJson({
              criteriaText,
              referenceImageUrls: [item.referenceImageUrl],
              importKey: `math_profile:${taskNumber}:${item.index}`
            })
          }
        });

        console.info("[math-profile-import]", {
          taskType: taskNumber,
          taskId: task.id,
          taskImage: item.taskImageUrl,
          referenceImage: item.referenceImageUrl
        });
      }
    }
  }
}

export const mathProfileImportService = new MathProfileImportService();
