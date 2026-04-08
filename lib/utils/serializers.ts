import type {
  AICheck,
  AttemptFile,
  ExamTaskType,
  GeneratedVariant,
  Subject,
  TaskBankItem,
  TaskCriterion,
  ReferenceSolution,
  User,
  VariantTask
} from "@prisma/client";

export function serializeUser(user: User) {
  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };
}

export function serializeSubject(subject: Subject) {
  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    isActive: subject.isActive
  };
}

export function serializeTaskType(taskType: ExamTaskType) {
  return {
    id: taskType.id,
    subjectId: taskType.subjectId,
    taskNumber: taskType.taskNumber,
    code: taskType.code,
    name: taskType.name,
    description: taskType.description,
    maxScore: taskType.maxScore,
    difficulty: taskType.difficulty,
    tags: taskType.tags,
    sourceStatus: taskType.sourceStatus,
    isActive: taskType.isActive
  };
}

export function serializeCriterion(criterion: TaskCriterion) {
  return {
    id: criterion.id,
    code: criterion.code,
    title: criterion.title,
    description: criterion.description,
    maxScore: criterion.maxScore,
    sortOrder: criterion.sortOrder
  };
}

export function serializeReferenceSolution(referenceSolution: ReferenceSolution | null) {
  if (!referenceSolution) {
    return null;
  }

  return {
    id: referenceSolution.id,
    solutionText: referenceSolution.solutionText,
    notes: referenceSolution.notes,
    rubricJson: referenceSolution.rubricJson
  };
}

export function serializeTask(
  task: TaskBankItem & {
    taskType?: ExamTaskType;
    subject?: Subject;
    criteria?: TaskCriterion[];
    referenceSolution?: ReferenceSolution | null;
  }
) {
  return {
    id: task.id,
    subjectId: task.subjectId,
    taskTypeId: task.taskTypeId,
    year: task.year,
    sourceType: task.sourceType,
    sourceUrl: task.sourceUrl,
    title: task.title,
    problemText: task.problemText,
    assetsJson: task.assetsJson,
    maxScore: task.maxScore,
    metaJson: task.metaJson,
    sourceStatus: task.sourceStatus,
    isPublished: task.isPublished,
    taskType: task.taskType ? serializeTaskType(task.taskType) : undefined,
    subject: task.subject ? serializeSubject(task.subject) : undefined,
    criteria: task.criteria?.map(serializeCriterion),
    referenceSolution: serializeReferenceSolution(task.referenceSolution ?? null)
  };
}

export function serializeVariant(
  variant: GeneratedVariant & {
    tasks: Array<
      VariantTask & {
        taskBankItem: TaskBankItem & {
          taskType?: ExamTaskType;
          subject?: Subject;
          criteria?: TaskCriterion[];
          referenceSolution?: ReferenceSolution | null;
        };
      }
    >;
  }
) {
  return {
    id: variant.id,
    subjectId: variant.subjectId,
    status: variant.status,
    createdAt: variant.createdAt.toISOString(),
    completedAt: variant.completedAt?.toISOString() ?? null,
    tasks: variant.tasks.map((task) => ({
      id: task.id,
      orderIndex: task.orderIndex,
      isCompleted: task.isCompleted,
      taskBankItem: serializeTask(task.taskBankItem)
    }))
  };
}

export function serializeAttemptFile(file: AttemptFile) {
  return {
    id: file.id,
    fileUrl: file.fileUrl,
    storageKey: file.storageKey,
    mimeType: file.mimeType,
    size: file.size,
    width: file.width,
    height: file.height
  };
}

export function serializeAiCheck(
  aiCheck:
    | (AICheck & {
        criterionScores?: Array<{
          criterionCode: string;
          criterionTitle: string;
          awardedScore: number;
          maxScore: number;
          comment: string;
        }>;
      })
    | null
) {
  if (!aiCheck) {
    return null;
  }

  return {
    id: aiCheck.id,
    model: aiCheck.model,
    totalScore: aiCheck.totalScore,
    maxScore: aiCheck.maxScore,
    criterionBreakdown:
      aiCheck.criterionScores?.map((score) => ({
        criterionCode: score.criterionCode,
        criterionTitle: score.criterionTitle,
        awardedScore: score.awardedScore,
        maxScore: score.maxScore,
        comment: score.comment
      })) ?? [],
    strengths: Array.isArray(aiCheck.strengthsJson) ? (aiCheck.strengthsJson as string[]) : [],
    mistakes: Array.isArray(aiCheck.mistakesJson) ? (aiCheck.mistakesJson as string[]) : [],
    recommendations: Array.isArray(aiCheck.recommendationsJson) ? (aiCheck.recommendationsJson as string[]) : [],
    expertComment: aiCheck.expertComment,
    confidence: aiCheck.confidence,
    extractedText: aiCheck.extractedText ?? "",
    createdAt: aiCheck.createdAt.toISOString()
  };
}
