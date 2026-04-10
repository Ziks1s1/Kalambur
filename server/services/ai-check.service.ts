import { Prisma } from "@prisma/client";

import { getAIProvider } from "@/lib/ai/provider";
import { db } from "@/lib/db";
import { buildDefaultCriteriaForTaskType, getCanonicalMathProfileCriteriaText } from "@/lib/demo/content";
import { AppError } from "@/lib/errors/app-error";
import { getTaskImageUrls } from "@/lib/utils/task-assets";
import { variantService } from "@/server/services/variant.service";

function toPrismaJson(value: unknown) {
  return value === null || value === undefined ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

function getReferenceMetadata(rubricJson: unknown) {
  if (!rubricJson || typeof rubricJson !== "object" || Array.isArray(rubricJson)) {
    return {
      criteriaText: undefined,
      answerFormat: undefined
    };
  }

  const record = rubricJson as Record<string, unknown>;

  return {
    criteriaText: typeof record.criteriaText === "string" ? record.criteriaText : undefined,
    answerFormat: typeof record.answerFormat === "string" ? record.answerFormat : undefined
  };
}

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
    const referenceMetadata = getReferenceMetadata(task.referenceSolution?.rubricJson);
    const mathProfileCriteriaText =
      task.subject.code === "math_profile" ? getCanonicalMathProfileCriteriaText(task.taskType.taskNumber) : undefined;
    const criteriaSource =
      task.subject.code === "math_profile"
        ? buildDefaultCriteriaForTaskType({
            subjectCode: task.subject.code,
            taskTypeCode: task.taskType.code,
            taskTypeName: task.taskType.name,
            taskNumber: task.taskType.taskNumber,
            maxScore: task.maxScore
          })
        : task.criteria.map((criterion) => ({
            code: criterion.code,
            title: criterion.title,
            description: criterion.description,
            maxScore: criterion.maxScore,
            sortOrder: criterion.sortOrder
          }));

    const criteria = criteriaSource.map((criterion) => ({
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
          taskImageUrls: getTaskImageUrls(task.assetsJson),
          criteria,
          criteriaText: referenceMetadata.criteriaText ?? mathProfileCriteriaText ?? undefined,
          referenceSolution: task.referenceSolution?.solutionText ?? "",
          referenceAnswer: task.referenceSolution?.notes ?? undefined,
          answerFormat: referenceMetadata.answerFormat,
          studentComment: attempt.comment ?? "",
          studentImageUrls: attempt.files.map((file) => file.fileUrl)
        });

        const aiCheck = await db.aICheck.create({
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
            rawJson: toPrismaJson(output.raw),
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
