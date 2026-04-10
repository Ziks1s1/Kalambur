import { AttemptStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";

export class AttemptService {
  async createAttempt(userId: string, variantTaskId: string, comment?: string) {
    const variantTask = await db.variantTask.findFirst({
      where: {
        id: variantTaskId,
        variant: {
          userId
        }
      }
    });

    if (!variantTask) {
      throw new AppError("Variant task not found", 404, "VARIANT_TASK_NOT_FOUND");
    }

    return db.userAttempt.create({
      data: {
        userId,
        variantTaskId,
        comment: comment ?? null
      },
      include: {
        files: true,
        aiCheck: {
          include: { criterionScores: true }
        }
      }
    });
  }

  async getAttempt(userId: string, attemptId: string) {
    return db.userAttempt.findFirstOrThrow({
      where: { id: attemptId, userId },
      include: {
        files: {
          orderBy: { sortOrder: "asc" }
        },
        aiCheck: {
          include: { criterionScores: true }
        },
        variantTask: {
          include: {
            taskBankItem: {
              include: {
                taskType: true,
                subject: true,
                criteria: { orderBy: { sortOrder: "asc" } },
                referenceSolution: true
              }
            }
          }
        }
      }
    });
  }

  async attachFiles(
    attemptId: string,
    userId: string,
    files: Array<{
      fileUrl: string;
      storageKey: string;
      mimeType: string;
      size: number;
      width: number | null;
      height: number | null;
    }>
  ) {
    const attempt = await db.userAttempt.findFirst({
      where: { id: attemptId, userId }
    });

    if (!attempt) {
      throw new AppError("Attempt not found", 404, "ATTEMPT_NOT_FOUND");
    }

    await db.$transaction([
      db.attemptFile.createMany({
        data: files.map((file, index) => ({
          attemptId,
          sortOrder: index,
          ...file
        }))
      }),
      db.userAttempt.update({
        where: { id: attemptId },
        data: { status: AttemptStatus.UPLOADED }
      })
    ]);

    return db.userAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: {
        files: {
          orderBy: { sortOrder: "asc" }
        },
        aiCheck: {
          include: { criterionScores: true }
        }
      }
    });
  }

  async markSubmitted(attemptId: string, userId: string) {
    const attempt = await db.userAttempt.findFirst({
      where: { id: attemptId, userId }
    });

    if (!attempt) {
      throw new AppError("Attempt not found", 404, "ATTEMPT_NOT_FOUND");
    }

    return db.userAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.SUBMITTED,
        submittedAt: new Date()
      }
    });
  }
}

export const attemptService = new AttemptService();
