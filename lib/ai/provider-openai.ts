import { buildUserPrompt } from "@/lib/ai/prompts";
import type { AICheckInput, AICheckOutput, AIProvider } from "@/lib/ai/provider";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
import { aiCheckResultSchema } from "@/schemas/ai-check";

const EGE_AI_CHECK_SCHEMA = {
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
    confidence: { type: "number" },
    extractedText: { type: "string" }
  },
  required: ["totalScore", "maxScore", "criterionBreakdown", "confidence", "extractedText"]
} as const;

const FORBIDDEN_PHRASES = [
  "неуверенное доказательство",
  "недостаточно убедительно",
  "слишком кратко",
  "мало пояснений",
  "не до конца полно раскрыто",
  "неполно раскрыто",
  "решение не до конца полно раскрыто"
];

function extractResponsesOutputText(data: Record<string, unknown>): string {
  if (typeof data.output_text === "string" && data.output_text.length > 0) {
    return data.output_text;
  }

  const output = data.output;
  if (!Array.isArray(output)) {
    throw new AppError("OpenAI response missing output array", 502, "OPENAI_BAD_RESPONSE");
  }

  const texts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const obj = item as Record<string, unknown>;
    if (obj.type === "message" && Array.isArray(obj.content)) {
      for (const part of obj.content) {
        if (!part || typeof part !== "object") {
          continue;
        }
        const p = part as Record<string, unknown>;
        if (p.type === "output_text" && typeof p.text === "string") {
          texts.push(p.text);
        }
      }
    }
  }

  const joined = texts.join("");
  if (!joined) {
    throw new AppError("OpenAI response had no text output", 502, "OPENAI_EMPTY_OUTPUT");
  }
  return joined;
}

function ensurePromptCompliance(result: AICheckOutput["result"]) {
  const texts = result.criterionBreakdown.map((criterion) => criterion.comment);

  for (const text of texts) {
    const normalized = text.toLowerCase();
    if (FORBIDDEN_PHRASES.some((phrase) => normalized.includes(phrase))) {
      throw new AppError(`OpenAI response violated grading prompt: ${text.slice(0, 200)}`, 502, "OPENAI_PROMPT_VIOLATION");
    }
  }
}

export class OpenAIProvider implements AIProvider {
  async checkSolution(input: AICheckInput): Promise<AICheckOutput> {
    if (!env.OPENAI_API_KEY) {
      throw new AppError("OPENAI_API_KEY is not configured", 500, "OPENAI_NOT_CONFIGURED");
    }

    const prompt = buildUserPrompt(input);
    const payload = {
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt
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
          schema: EGE_AI_CHECK_SCHEMA
        }
      }
    };

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    let rawJson: unknown;
    try {
      rawJson = await res.json();
    } catch {
      rawJson = null;
    }

    if (!res.ok) {
      const errMsg =
        rawJson && typeof rawJson === "object" && "error" in rawJson
          ? JSON.stringify((rawJson as { error?: unknown }).error)
          : res.statusText;
      throw new AppError(`OpenAI API error (${res.status}): ${String(errMsg).slice(0, 500)}`, 502, "OPENAI_API_ERROR");
    }

    if (!rawJson || typeof rawJson !== "object") {
      throw new AppError("OpenAI returned invalid JSON", 502, "OPENAI_BAD_RESPONSE");
    }

    const outputText = extractResponsesOutputText(rawJson as Record<string, unknown>);
    const result = aiCheckResultSchema.parse(JSON.parse(outputText));
    ensurePromptCompliance(result);

    return {
      model: env.OPENAI_MODEL,
      result,
      raw: rawJson
    };
  }
}
