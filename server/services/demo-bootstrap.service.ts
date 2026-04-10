import { Prisma, SourceStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { demoSubjects, demoTaskTypes, demoTasks } from "@/lib/demo/content";
import { mathProfileImportService } from "@/server/services/math-profile-import.service";

function toPrismaJson(value: unknown) {
  return value ?? Prisma.JsonNull;
}

let bootstrapPromise: Promise<void> | null = null;
let hasBootstrapped = false;

async function ensureSubjectsAndTaskTypes() {
  const subjectIdsByDemoId = new Map<string, string>();

  for (const subject of demoSubjects) {
    const upsertedSubject = await db.subject.upsert({
      where: { code: subject.code },
      update: {
        name: subject.name,
        isActive: true
      },
      create: {
        code: subject.code,
        name: subject.name,
        isActive: true
      }
    });

    subjectIdsByDemoId.set(subject.id, upsertedSubject.id);
  }

  const taskTypeIdsByDemoId = new Map<string, string>();

  for (const taskType of demoTaskTypes) {
    const subjectId = subjectIdsByDemoId.get(taskType.subjectId);

    if (!subjectId) {
      continue;
    }

    const upsertedTaskType = await db.examTaskType.upsert({
      where: {
        subjectId_code: {
          subjectId,
          code: taskType.code
        }
      },
      update: {
        taskNumber: taskType.taskNumber,
        name: taskType.name,
        description: taskType.description,
        maxScore: taskType.maxScore,
        difficulty: taskType.difficulty,
        tags: taskType.tags,
        sourceStatus: SourceStatus.DEMO_SEED,
        isActive: true
      },
      create: {
        subjectId,
        taskNumber: taskType.taskNumber,
        code: taskType.code,
        name: taskType.name,
        description: taskType.description,
        maxScore: taskType.maxScore,
        difficulty: taskType.difficulty,
        tags: taskType.tags,
        sourceStatus: SourceStatus.DEMO_SEED,
        isActive: true
      }
    });

    taskTypeIdsByDemoId.set(taskType.id, upsertedTaskType.id);
  }

  return { subjectIdsByDemoId, taskTypeIdsByDemoId };
}

async function ensureDemoTasks(
  subjectIdsByDemoId: Map<string, string>,
  taskTypeIdsByDemoId: Map<string, string>
) {
  for (const task of demoTasks) {
    const subjectId = subjectIdsByDemoId.get(task.subjectId);
    const taskTypeId = taskTypeIdsByDemoId.get(task.taskTypeId);

    if (!subjectId || !taskTypeId) {
      continue;
    }

    const existingTask = await db.taskBankItem.findFirst({
      where: {
        subjectId,
        taskTypeId,
        title: task.title,
        sourceType: "demo_seed"
      }
    });

    const upsertedTask = existingTask
      ? await db.taskBankItem.update({
          where: { id: existingTask.id },
          data: {
            year: task.year ?? null,
            sourceType: task.sourceType,
            sourceUrl: task.sourceUrl ?? null,
            title: task.title,
            problemText: task.problemText,
            assetsJson: toPrismaJson(task.assetsJson),
            maxScore: task.maxScore,
            metaJson: toPrismaJson(task.metaJson),
            sourceStatus: SourceStatus.DEMO_SEED,
            isPublished: true
          }
        })
      : await db.taskBankItem.create({
          data: {
            subjectId,
            taskTypeId,
            year: task.year ?? null,
            sourceType: task.sourceType,
            sourceUrl: task.sourceUrl ?? null,
            title: task.title,
            problemText: task.problemText,
            assetsJson: toPrismaJson(task.assetsJson),
            maxScore: task.maxScore,
            metaJson: toPrismaJson(task.metaJson),
            sourceStatus: SourceStatus.DEMO_SEED,
            isPublished: true
          }
        });

    await db.taskCriterion.deleteMany({
      where: { taskBankItemId: upsertedTask.id }
    });

    const criteria = task.criteria ?? [];

    if (criteria.length > 0) {
      await db.taskCriterion.createMany({
        data: criteria.map((criterion) => ({
          taskBankItemId: upsertedTask.id,
          code: criterion.code,
          title: criterion.title,
          description: criterion.description,
          maxScore: criterion.maxScore,
          sortOrder: criterion.sortOrder
        }))
      });
    }

    if (task.referenceSolution) {
      await db.referenceSolution.upsert({
        where: {
          taskBankItemId: upsertedTask.id
        },
        update: {
          solutionText: task.referenceSolution.solutionText ?? null,
          correctAnswer: task.referenceSolution.correctAnswer ?? null,
          notes: task.referenceSolution.notes ?? null,
          rubricJson: toPrismaJson(task.referenceSolution.rubricJson)
        },
        create: {
          taskBankItemId: upsertedTask.id,
          solutionText: task.referenceSolution.solutionText ?? null,
          correctAnswer: task.referenceSolution.correctAnswer ?? null,
          notes: task.referenceSolution.notes ?? null,
          rubricJson: toPrismaJson(task.referenceSolution.rubricJson)
        }
      });
    }
  }
}

export class DemoBootstrapService {
  async ensureDemoData() {
    if (hasBootstrapped) {
      return;
    }

    if (!bootstrapPromise) {
      bootstrapPromise = (async () => {
        const { subjectIdsByDemoId, taskTypeIdsByDemoId } = await ensureSubjectsAndTaskTypes();
        await ensureDemoTasks(subjectIdsByDemoId, taskTypeIdsByDemoId);
        await mathProfileImportService.ensureImported();
        hasBootstrapped = true;
      })().finally(() => {
        bootstrapPromise = null;
      });
    }

    await bootstrapPromise;
  }
}

export const demoBootstrapService = new DemoBootstrapService();
