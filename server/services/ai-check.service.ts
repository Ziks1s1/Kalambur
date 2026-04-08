import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import { getAIProvider } from "@/lib/ai/provider";
import { variantService } from "@/server/services/variant.service";

export class AICheckService {
  async runAttemptCheck(attemptId: string, userId: string) {
    const attempt = await db.userAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        aiCheck: {
          include: {
            criterionScores: true
          }
        },
        files: true,
        variantTask: {
          include: {
            taskBankItem: {
              include: {
                subject: true,
                taskType: true,
                criteria: { orderBy: { sortOrder: "asc" } },
                referenceSolution: true
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      throw new AppError("Attempt not found", 404, "ATTEMPT_NOT_FOUND");
    }

    if (attempt.aiCheck) {
      return attempt.aiCheck;
    }

    if (attempt.files.length === 0) {
      throw new AppError("Upload files before AI check", 400, "ATTEMPT_FILES_REQUIRED");
    }

    const task = attempt.variantTask.taskBankItem;
    const provider = getAIProvider();
    const criteria = task.criteria.map((criterion) => ({
      code: criterion.code,
      title: criterion.title,
      description: criterion.description,
      maxScore: criterion.maxScore
    }));

    let lastError: unknown;

    for (let retry = 0; retry < 2; retry += 1) {
      try {
        const output = await provider.checkSolution({
          subject: task.subject.name,
          taskNumber: task.taskType.taskNumber,
          taskTypeName: task.taskType.name,
          problemText: task.problemText,
          criteria,
          referenceSolution: task.referenceSolution?.solutionText ?? "",
          studentComment: attempt.comment ?? "",
          imageUrls: attempt.files.map((file) => file.fileUrl)
        });

        const aiCheck = await db.aiCheck.create({
          data: {
            attemptId: attempt.id,
            model: output.model,
            totalScore: output.result.totalScore,
            maxScore: output.result.maxScore,
            expertComment: output.result.expertComment,
            strengthsJson: output.result.strengths,
            mistakesJson: output.result.mistakes,
            recommendationsJson: output.result.recommendations,
            confidence: output.result.confidence,
            extractedText: output.result.extractedText,
            rawJson: output.raw,
            criterionScores: {
              create: output.result.criterionBreakdown.map((item) => ({
                criterionCode: item.criterionCode,
                criterionTitle: item.criterionTitle,
                awardedScore: item.awardedScore,
                maxScore: item.maxScore,
                comment: item.comment
              }))
            }
          },
          include: {
            criterionScores: true
          }
        });

        await db.userAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "CHECKED",
            checkedAt: new Date()
          }
        });

        await variantService.markVariantTaskCompleted(attempt.variantTaskId);
        return aiCheck;
      } catch (error) {
        lastError = error;
      }
    }

    throw new AppError("AI check failed", 502, "AI_CHECK_FAILED", lastError);
  }
}

export const aiCheckService = new AICheckService();
