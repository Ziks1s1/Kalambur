import OpenAI from "openai";

import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import type { AICheckInput, AICheckOutput, AIProvider } from "@/lib/ai/provider";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
import { aiCheckResultSchema } from "@/schemas/ai-check";

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
            ...input.taskImageUrls.flatMap((imageUrl) => [
              {
                type: "input_text" as const,
                text: "Фото условия задания"
              },
              {
                type: "input_image" as const,
                image_url: imageUrl,
                detail: "auto" as const
              }
            ]),
            ...(input.referenceImageUrls ?? []).flatMap((imageUrl) => [
              {
                type: "input_text" as const,
                text: "Эталонное решение / ответ для этого же задания"
              },
              {
                type: "input_image" as const,
                image_url: imageUrl,
                detail: "auto" as const
              }
            ]),
            ...input.studentImageUrls.flatMap((imageUrl) => [
              {
                type: "input_text" as const,
                text: "Фото решения ученика"
              },
              {
                type: "input_image" as const,
                image_url: imageUrl,
                detail: "auto" as const
              }
            ])
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
