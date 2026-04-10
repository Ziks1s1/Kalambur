import { env } from "@/lib/env";
import { aiCheckResultSchema, type AICheckResult } from "@/schemas/ai-check";

export type AICheckInput = {
  taskId: string;
  subject: string;
  taskNumber: number;
  taskTypeName: string;
  problemText: string;
  taskImageUrls: string[];
  criteria: Array<{ code: string; title: string; description: string; maxScore: number }>;
  criteriaText?: string;
  referenceSolution: string;
  referenceAnswer?: string;
  referenceImageUrls?: string[];
  answerFormat?: string;
  studentComment: string;
  studentImageUrls: string[];
};

export type AICheckOutput = {
  model: string;
  result: AICheckResult;
  raw: unknown;
};

export interface AIProvider {
  checkSolution(input: AICheckInput): Promise<AICheckOutput>;
}

export class MockAIProvider implements AIProvider {
  async checkSolution(input: AICheckInput): Promise<AICheckOutput> {
    const maxScore = input.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
    const result = aiCheckResultSchema.parse({
      totalScore: Math.max(1, maxScore - 1),
      maxScore,
      criterionBreakdown: input.criteria.map((criterion, index) => ({
        criterionCode: criterion.code,
        criterionTitle: criterion.title,
        awardedScore: index === input.criteria.length - 1 ? Math.max(0, criterion.maxScore - 1) : criterion.maxScore,
        maxScore: criterion.maxScore,
        comment: `Demo feedback for ${criterion.code}.`
      })),
      strengths: ["Решение структурировано и читается последовательно.", "Есть попытка обосновать каждый ключевой шаг."],
      mistakes: ["Одна часть рассуждения или оформления выглядит неполной."],
      recommendations: ["Покажи переходы между шагами явнее.", "В финале отдельно выдели ответ и краткое обоснование."],
      expertComment:
        "Работа выглядит уверенно, но для максимального балла стоит точнее оформить один из шагов решения и яснее вынести итоговый вывод.",
      confidence: 0.75,
      extractedText: input.studentComment || "Mock OCR text"
    });

    return {
      model: "mock-ege-expert",
      result,
      raw: {
        provider: "mock",
        taskId: input.taskId,
        taskImageUrls: input.taskImageUrls,
        referenceImageUrls: input.referenceImageUrls,
        studentImageUrls: input.studentImageUrls
      }
    };
  }
}

export async function getAIProvider(): Promise<AIProvider> {
  if (env.AI_PROVIDER !== "openai") {
    return new MockAIProvider();
  }

  const { OpenAIProvider } = await import("@/lib/ai/provider-openai");
  return new OpenAIProvider();
}
