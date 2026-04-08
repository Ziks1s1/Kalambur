import { describe, expect, it } from "vitest";

import { aggregateStatistics } from "@/server/services/statistics.service";

describe("aggregateStatistics", () => {
  it("computes average score and topic strength", () => {
    const result = aggregateStatistics([
      {
        aiCheck: { totalScore: 2, maxScore: 3 },
        variantTask: { taskBankItem: { taskType: { name: "Стереометрия" } } }
      },
      {
        aiCheck: { totalScore: 1, maxScore: 2 },
        variantTask: { taskBankItem: { taskType: { name: "Неравенство" } } }
      }
    ]);

    expect(result.solvedCount).toBe(2);
    expect(result.checkedCount).toBe(2);
    expect(result.averageScore).toBe(1.5);
    expect(result.strongTopics[0]).toBe("Стереометрия");
  });
});
