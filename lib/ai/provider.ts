import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
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
  if (env.AI_PROVIDER === "mock" && process.env.NODE_ENV === "test") {
    return new MockAIProvider();
  }

  if (!env.OPENAI_API_KEY) {
    throw new AppError("OPENAI_API_KEY is not configured", 500, "OPENAI_NOT_CONFIGURED");
  }

  const { OpenAIProvider } = await import("@/lib/ai/provider-openai");
  return new OpenAIProvider();
}
