import { describe, expect, it } from "vitest";

import { aiCheckResultSchema } from "@/schemas/ai-check";

describe("aiCheckResultSchema", () => {
  it("validates a strict AI response", () => {
    const parsed = aiCheckResultSchema.parse({
      totalScore: 3,
      maxScore: 4,
      criterionBreakdown: [
        {
          criterionCode: "K1",
          criterionTitle: "Логика",
          awardedScore: 1,
          maxScore: 1,
          comment: "Корректно"
        }
      ],
      strengths: ["Есть структура"],
      mistakes: ["Есть одна неточность"],
      recommendations: ["Проверить вычисления"],
      expertComment: "Работа хорошая.",
      confidence: 0.82,
      extractedText: "Распознанный текст"
    });

    expect(parsed.totalScore).toBe(3);
  });
});
