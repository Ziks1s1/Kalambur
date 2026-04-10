import { access, readdir } from "node:fs/promises";
import path from "node:path";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { buildDefaultCriteriaForTaskType, getCanonicalMathProfileCriteriaText } from "@/lib/demo/content";
import { AppError } from "@/lib/errors/app-error";

const IMPORT_ROOT = path.join(process.cwd(), "public", "task-bank", "math-profile");
const TASK_NUMBERS = [13, 14, 15, 16, 17, 18, 19] as const;

function toPrismaJson(value: unknown) {
  return value ?? Prisma.JsonNull;
}

function publicUrlFromAbsolute(filePath: string) {
  const relative = path.relative(path.join(process.cwd(), "public"), filePath).replace(/\\/g, "/");
  return `/${relative}`;
}

function normalizeFileName(fileName: string) {
  return fileName.toLowerCase();
}

async function buildFolderMappings(folderPath: string) {
  let entries;

  try {
    entries = await readdir(folderPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "ru"));
  const taskMap = new Map<number, { taskImage?: string; referenceImage?: string }>();
  const orphanFiles = [...files];

  const pullFile = (predicate: (name: string) => boolean) => {
    const index = orphanFiles.findIndex(predicate);

    if (index === -1) {
      return null;
    }

    return orphanFiles.splice(index, 1)[0] ?? null;
  };

  for (const fileName of files) {
    const match = normalizeFileName(fileName).match(/^(\d+)\s+.*задача/);

    if (!match) {
      continue;
    }

    const index = Number(match[1]);
    const current = taskMap.get(index) ?? {};
    current.taskImage = path.join(folderPath, fileName);
    taskMap.set(index, current);
    const orphanIndex = orphanFiles.indexOf(fileName);

    if (orphanIndex >= 0) {
      orphanFiles.splice(orphanIndex, 1);
    }
  }

  for (const fileName of [...orphanFiles]) {
    const match = normalizeFileName(fileName).match(/^(\d+)\s+.*ответ/);

    if (!match) {
      continue;
    }

    const index = Number(match[1]);
    const current = taskMap.get(index) ?? {};
    current.referenceImage = path.join(folderPath, fileName);
    taskMap.set(index, current);
    const orphanIndex = orphanFiles.indexOf(fileName);

    if (orphanIndex >= 0) {
      orphanFiles.splice(orphanIndex, 1);
    }
  }

  for (const [index, current] of taskMap.entries()) {
    if (current.referenceImage) {
      continue;
    }

    const fallback = pullFile(() => true);

    if (fallback) {
      current.referenceImage = path.join(folderPath, fallback);
      taskMap.set(index, current);
    }
  }

  return Array.from(taskMap.entries())
    .map(([index, item]) => ({
      index,
      taskImagePath: item.taskImage,
      referenceImagePath: item.referenceImage
    }))
    .filter((item) => item.taskImagePath)
    .sort((left, right) => left.index - right.index);
}

export class MathProfileImportService {
  async ensureImported() {
    try {
      await access(IMPORT_ROOT);
    } catch {
      return;
    }

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

      const folderPath = path.join(IMPORT_ROOT, `${taskNumber} задание`);
      const folderMappings = await buildFolderMappings(folderPath);
      const criteria = buildDefaultCriteriaForTaskType({
        subjectCode: subject.code,
        taskTypeCode: taskType.code,
        taskTypeName: taskType.name,
        taskNumber: taskType.taskNumber,
        maxScore: taskType.maxScore
      });
      const criteriaText = getCanonicalMathProfileCriteriaText(taskNumber);

      for (const mapping of folderMappings) {
        const title = `Профильная математика №${taskNumber}.${mapping.index}`;

        const existingTask = await db.taskBankItem.findFirst({
          where: {
            subjectId: subject.id,
            taskTypeId: taskType.id,
            title
          }
        });

        const taskImageUrl = publicUrlFromAbsolute(mapping.taskImagePath!);
        const referenceImageUrl = mapping.referenceImagePath ? publicUrlFromAbsolute(mapping.referenceImagePath) : null;

        const task = existingTask
          ? await db.taskBankItem.update({
              where: { id: existingTask.id },
              data: {
                sourceType: "math_profile_static_import",
                title,
                problemText: "См. изображение условия задания.",
                assetsJson: toPrismaJson({
                  imageUrls: [taskImageUrl]
                }),
                metaJson: toPrismaJson({
                  importKey: `math_profile:${taskNumber}:${mapping.index}`,
                  taskNumber,
                  itemNumber: mapping.index,
                  taskImagePath: mapping.taskImagePath,
                  referenceImagePath: mapping.referenceImagePath ?? null
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
                  imageUrls: [taskImageUrl]
                }),
                metaJson: toPrismaJson({
                  importKey: `math_profile:${taskNumber}:${mapping.index}`,
                  taskNumber,
                  itemNumber: mapping.index,
                  taskImagePath: mapping.taskImagePath,
                  referenceImagePath: mapping.referenceImagePath ?? null
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
              referenceImageUrls: referenceImageUrl ? [referenceImageUrl] : [],
              importKey: `math_profile:${taskNumber}:${mapping.index}`
            })
          },
          create: {
            taskBankItemId: task.id,
            solutionText: null,
            correctAnswer: null,
            notes: "Эталон хранится изображением.",
            rubricJson: toPrismaJson({
              criteriaText,
              referenceImageUrls: referenceImageUrl ? [referenceImageUrl] : [],
              importKey: `math_profile:${taskNumber}:${mapping.index}`
            })
          }
        });

        console.info("[math-profile-import]", {
          taskType: taskNumber,
          taskId: task.id,
          taskImage: taskImageUrl,
          referenceImage: referenceImageUrl
        });
      }
    }
  }
}

export const mathProfileImportService = new MathProfileImportService();
