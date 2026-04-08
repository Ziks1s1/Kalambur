import OpenAI from "openai";

import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
import { aiCheckResultSchema, type AICheckResult } from "@/schemas/ai-check";

export type AICheckInput = {
  subject: string;
  taskNumber: number;
  taskTypeName: string;
  problemText: string;
  criteria: Array<{ code: string; title: string; description: string; maxScore: number }>;
  referenceSolution: string;
  studentComment: string;
  imageUrls: string[];
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
      strengths: ["Структура решения последовательная", "Есть попытка обосновать ответ"],
      mistakes: ["Есть одна заметная неточность в оформлении или вычислении"],
      recommendations: ["Перепроверь промежуточные вычисления", "Добавь более явное пояснение ключевого шага"],
      expertComment: "Решение в целом сильное, но один фрагмент требует уточнения.",
      confidence: 0.75,
      extractedText: input.studentComment || "Mock OCR text"
    });

    return {
      model: "mock-ege-expert",
      result,
      raw: { provider: "mock", imageUrls: input.imageUrls }
    };
  }
}

export class OpenAIProvider implements AIProvider {
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async checkSolution(input: AICheckInput): Promise<AICheckOutput> {
    if (!env.OPENAI_API_KEY) {
      throw new AppError("OPENAI_API_KEY is not configured", 500, "OPENAI_NOT_CONFIGURED");
    }

    const response = await this.client.responses.create({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: buildSystemPrompt() }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildUserPrompt(input)
            },
            ...input.imageUrls.map((imageUrl) => ({
              type: "input_image" as const,
              image_url: imageUrl
            }))
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "ege_ai_check",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              totalScore: { type: "integer" },
              maxScore: { type: "integer" },
              criterionBreakdown: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    criterionCode: { type: "string" },
                    criterionTitle: { type: "string" },
                    awardedScore: { type: "integer" },
                    maxScore: { type: "integer" },
                    comment: { type: "string" }
                  },
                  required: ["criterionCode", "criterionTitle", "awardedScore", "maxScore", "comment"]
                }
              },
              strengths: { type: "array", items: { type: "string" } },
              mistakes: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              expertComment: { type: "string" },
              confidence: { type: "number" },
              extractedText: { type: "string" }
            },
            required: [
              "totalScore",
              "maxScore",
              "criterionBreakdown",
              "strengths",
              "mistakes",
              "recommendations",
              "expertComment",
              "confidence",
              "extractedText"
            ]
          }
        }
      }
    });

    const raw = response.output_text;
    const result = aiCheckResultSchema.parse(JSON.parse(raw));

    return {
      model: env.OPENAI_MODEL,
      result,
      raw: response
    };
  }
}

export function getAIProvider(): AIProvider {
  return env.AI_PROVIDER === "openai" ? new OpenAIProvider() : new MockAIProvider();
}
