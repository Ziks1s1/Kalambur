import { db } from "@/lib/db";
import type { CreateTaskInput, CreateTaskTypeInput, ImportTaskBankInput } from "@/schemas/admin";

export class AdminService {
  async listTaskTypes() {
    return db.examTaskType.findMany({
      include: { subject: true },
      orderBy: [{ subject: { name: "asc" } }, { taskNumber: "asc" }]
    });
  }

  async createTaskType(input: CreateTaskTypeInput) {
    return db.examTaskType.create({
      data: input,
      include: {
        subject: true
      }
    });
  }

  async listTasks() {
    return db.taskBankItem.findMany({
      include: {
        subject: true,
        taskType: true,
        criteria: { orderBy: { sortOrder: "asc" } },
        referenceSolution: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createTask(input: CreateTaskInput) {
    return db.taskBankItem.create({
      data: {
        subjectId: input.subjectId,
        taskTypeId: input.taskTypeId,
        year: input.year ?? null,
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl ?? null,
        title: input.title,
        problemText: input.problemText,
        assetsJson: input.assetsJson ?? null,
        maxScore: input.maxScore,
        metaJson: input.metaJson ?? null,
        sourceStatus: input.sourceStatus,
        isPublished: input.isPublished,
        criteria: {
          create: input.criteria.map((criterion) => ({
            code: criterion.code,
            title: criterion.title,
            description: criterion.description,
            maxScore: criterion.maxScore,
            sortOrder: criterion.sortOrder
          }))
        },
        referenceSolution: {
          create: {
            solutionText: input.referenceSolution.solutionText,
            notes: input.referenceSolution.notes ?? null,
            rubricJson: input.referenceSolution.rubricJson ?? null
          }
        }
      },
      include: {
        subject: true,
        taskType: true,
        criteria: true,
        referenceSolution: true
      }
    });
  }

  async updateTask(taskId: string, input: CreateTaskInput) {
    await db.taskCriterion.deleteMany({
      where: { taskBankItemId: taskId }
    });

    await db.referenceSolution.deleteMany({
      where: { taskBankItemId: taskId }
    });

    return db.taskBankItem.update({
      where: { id: taskId },
      data: {
        subjectId: input.subjectId,
        taskTypeId: input.taskTypeId,
        year: input.year ?? null,
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl ?? null,
        title: input.title,
        problemText: input.problemText,
        assetsJson: input.assetsJson ?? null,
        maxScore: input.maxScore,
        metaJson: input.metaJson ?? null,
        sourceStatus: input.sourceStatus,
        isPublished: input.isPublished,
        criteria: {
          create: input.criteria.map((criterion) => ({
            code: criterion.code,
            title: criterion.title,
            description: criterion.description,
            maxScore: criterion.maxScore,
            sortOrder: criterion.sortOrder
          }))
        },
        referenceSolution: {
          create: {
            solutionText: input.referenceSolution.solutionText,
            notes: input.referenceSolution.notes ?? null,
            rubricJson: input.referenceSolution.rubricJson ?? null
          }
        }
      },
      include: {
        subject: true,
        taskType: true,
        criteria: true,
        referenceSolution: true
      }
    });
  }

  async listAttempts() {
    return db.userAttempt.findMany({
      include: {
        user: true,
        files: true,
        aiCheck: true,
        variantTask: {
          include: {
            taskBankItem: {
              include: {
                taskType: true,
                subject: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async importTaskBank(input: ImportTaskBankInput) {
    return db.$transaction(async (tx) => {
      const createdSubjects = new Set<string>();
      const updatedSubjects = new Set<string>();
      const createdTaskTypes = new Set<string>();
      const updatedTaskTypes = new Set<string>();
      let tasksCreated = 0;
      let tasksUpdated = 0;

      for (const item of input.tasks) {
        const existingSubject = await tx.subject.findUnique({
          where: { code: item.subjectCode }
        });

        const subject = existingSubject
          ? await tx.subject.update({
              where: { code: item.subjectCode },
              data: {
                name: item.subjectName,
                isActive: true
              }
            })
          : await tx.subject.create({
              data: {
                code: item.subjectCode,
                name: item.subjectName,
                isActive: true
              }
            });

        if (existingSubject) {
          updatedSubjects.add(item.subjectCode);
        } else {
          createdSubjects.add(item.subjectCode);
        }

        const existingTaskType = await tx.examTaskType.findUnique({
          where: {
            subjectId_code: {
              subjectId: subject.id,
              code: item.taskTypeCode
            }
          }
        });

        const taskType = existingTaskType
          ? await tx.examTaskType.update({
              where: {
                subjectId_code: {
                  subjectId: subject.id,
                  code: item.taskTypeCode
                }
              },
              data: {
                taskNumber: item.taskNumber,
                name: item.taskTypeName,
                description: item.taskTypeDescription,
                maxScore: item.taskTypeMaxScore,
                difficulty: item.taskDifficulty,
                tags: item.tags,
                sourceStatus: item.sourceStatus,
                isActive: true
              }
            })
          : await tx.examTaskType.create({
              data: {
                subjectId: subject.id,
                taskNumber: item.taskNumber,
                code: item.taskTypeCode,
                name: item.taskTypeName,
                description: item.taskTypeDescription,
                maxScore: item.taskTypeMaxScore,
                difficulty: item.taskDifficulty,
                tags: item.tags,
                sourceStatus: item.sourceStatus,
                isActive: true
              }
            });

        if (existingTaskType) {
          updatedTaskTypes.add(`${subject.id}:${item.taskTypeCode}`);
        } else {
          createdTaskTypes.add(`${subject.id}:${item.taskTypeCode}`);
        }

        const existingTask = await tx.taskBankItem.findFirst({
          where: {
            subjectId: subject.id,
            taskTypeId: taskType.id,
            title: item.title,
            year: item.year ?? null
          }
        });

        const task = existingTask
          ? await tx.taskBankItem.update({
              where: { id: existingTask.id },
              data: {
                sourceType: item.sourceType,
                sourceUrl: item.sourceUrl ?? null,
                problemText: item.problemText,
                assetsJson: item.assetsJson ?? null,
                maxScore: item.maxScore,
                metaJson: item.metaJson ?? null,
                sourceStatus: item.sourceStatus,
                isPublished: item.isPublished
              }
            })
          : await tx.taskBankItem.create({
              data: {
                subjectId: subject.id,
                taskTypeId: taskType.id,
                year: item.year ?? null,
                sourceType: item.sourceType,
                sourceUrl: item.sourceUrl ?? null,
                title: item.title,
                problemText: item.problemText,
                assetsJson: item.assetsJson ?? null,
                maxScore: item.maxScore,
                metaJson: item.metaJson ?? null,
                sourceStatus: item.sourceStatus,
                isPublished: item.isPublished
              }
            });

        if (existingTask) {
          tasksUpdated += 1;
        } else {
          tasksCreated += 1;
        }

        await tx.taskCriterion.deleteMany({
          where: {
            taskBankItemId: task.id
          }
        });

        await tx.taskCriterion.createMany({
          data: item.criteria.map((criterion) => ({
            taskBankItemId: task.id,
            code: criterion.code,
            title: criterion.title,
            description: criterion.description,
            maxScore: criterion.maxScore,
            sortOrder: criterion.sortOrder
          }))
        });

        await tx.referenceSolution.upsert({
          where: {
            taskBankItemId: task.id
          },
          update: {
            solutionText: item.referenceSolution.solutionText,
            notes: item.referenceSolution.notes ?? null,
            rubricJson: item.referenceSolution.rubricJson ?? null
          },
          create: {
            taskBankItemId: task.id,
            solutionText: item.referenceSolution.solutionText,
            notes: item.referenceSolution.notes ?? null,
            rubricJson: item.referenceSolution.rubricJson ?? null
          }
        });
      }

      return {
        subjectsCreated: createdSubjects.size,
        subjectsUpdated: updatedSubjects.size,
        taskTypesCreated: createdTaskTypes.size,
        taskTypesUpdated: updatedTaskTypes.size,
        tasksCreated,
        tasksUpdated
      };
    });
  }
}

export const adminService = new AdminService();
