import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import type { CreateVariantInput } from "@/schemas/variant";
import { demoBootstrapService } from "@/server/services/demo-bootstrap.service";

export function selectVariantTaskIds(taskIds: string[], taskCount: number) {
  return taskIds.slice(0, taskCount);
}

export class VariantService {
  async createVariant(userId: string, input: CreateVariantInput) {
    await demoBootstrapService.ensureDemoData();

    let selectedTaskIds: string[] = [];

    if (input.taskIds?.length) {
      const tasks = await db.taskBankItem.findMany({
        where: {
          subjectId: input.subjectId,
          id: { in: input.taskIds },
          isPublished: true
        },
        select: { id: true }
      });

      const validIds = new Set(tasks.map((task) => task.id));
      selectedTaskIds = input.taskIds.filter((taskId) => validIds.has(taskId));
    } else if (input.mode === "FULL_SECOND_PART") {
      const tasks = await db.taskBankItem.findMany({
        where: {
          subjectId: input.subjectId,
          isPublished: true,
          ...(input.subjectId
            ? {
                taskType: {
                  taskNumber: {
                    gte: 13,
                    lte: 19
                  }
                }
              }
            : {})
        },
        select: {
          id: true,
          taskType: {
            select: {
              taskNumber: true
            }
          }
        },
        orderBy: [{ taskType: { taskNumber: "asc" } }, { createdAt: "asc" }]
      });

      const firstByNumber = new Map<number, string>();

      for (const task of tasks) {
        if (!firstByNumber.has(task.taskType.taskNumber)) {
          firstByNumber.set(task.taskType.taskNumber, task.id);
        }
      }

      selectedTaskIds = Array.from(firstByNumber.entries())
        .sort((left, right) => left[0] - right[0])
        .map(([, taskId]) => taskId);
    } else {
      const where: Prisma.TaskBankItemWhereInput = {
        subjectId: input.subjectId,
        isPublished: true
      };

      if (input.taskTypeIds?.length) {
        where.taskTypeId = {
          in: input.taskTypeIds
        };
      }

      const tasks = await db.taskBankItem.findMany({
        where,
        select: { id: true },
        orderBy: [{ taskTypeId: "asc" }, { createdAt: "asc" }]
      });

      selectedTaskIds = selectVariantTaskIds(
        tasks.map((task) => task.id),
        Math.min(tasks.length, input.taskCount)
      );
    }

    if (selectedTaskIds.length === 0) {
      throw new AppError("No tasks available for this variant", 400, "VARIANT_EMPTY");
    }

    return db.generatedVariant.create({
      data: {
        userId,
        subjectId: input.subjectId,
        tasks: {
          create: selectedTaskIds.map((taskId, index) => ({
            taskBankItemId: taskId,
            orderIndex: index
          }))
        }
      },
      include: {
        tasks: {
          include: {
            taskBankItem: {
              include: {
                taskType: true,
                criteria: { orderBy: { sortOrder: "asc" } },
                referenceSolution: true
              }
            }
          },
          orderBy: { orderIndex: "asc" }
        }
      }
    });
  }

  async getVariantForUser(userId: string, variantId: string) {
    return db.generatedVariant.findFirstOrThrow({
      where: { id: variantId, userId },
      include: {
        tasks: {
          include: {
            taskBankItem: {
              include: {
                taskType: true,
                criteria: { orderBy: { sortOrder: "asc" } },
                referenceSolution: true
              }
            },
            attempts: {
              include: {
                aiCheck: {
                  include: {
                    criterionScores: true
                  }
                }
              },
              orderBy: { createdAt: "desc" },
              take: 1
            }
          },
          orderBy: { orderIndex: "asc" }
        }
      }
    });
  }

  async getCurrentTask(userId: string, variantId: string) {
    const variant = await this.getVariantForUser(userId, variantId);
    const currentTask = variant.tasks.find((task) => !task.isCompleted) ?? variant.tasks.at(-1) ?? null;
    return { variant, currentTask };
  }

  async switchTask(userId: string, variantId: string, variantTaskId: string) {
    const variant = await this.getVariantForUser(userId, variantId);
    const currentTask = variant.tasks.find((task) => task.id === variantTaskId);

    if (!currentTask) {
      throw new AppError("Variant task not found", 404, "VARIANT_TASK_NOT_FOUND");
    }

    return { variant, currentTask };
  }

  async markVariantTaskCompleted(variantTaskId: string) {
    const updated = await db.variantTask.update({
      where: { id: variantTaskId },
      data: { isCompleted: true },
      include: {
        variant: true
      }
    });

    const remaining = await db.variantTask.count({
      where: {
        variantId: updated.variantId,
        isCompleted: false
      }
    });

    if (remaining === 0) {
      await db.generatedVariant.update({
        where: { id: updated.variantId },
        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      });
    }
  }
}

export const variantService = new VariantService();
