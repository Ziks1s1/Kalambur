import { demoSubjects } from "@/lib/demo/content";

export function getDemoStatisticsSummary() {
  return demoSubjects.slice(0, 6).map((subject, index) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    solvedCount: 3 + index,
    checkedCount: 2 + index,
    averageScore: Number((2.8 + index * 0.35).toFixed(2)),
    completionRate: Number((0.42 + index * 0.06).toFixed(2)),
    weakTopics: ["Демо-тема 1", "Демо-тема 2"],
    strongTopics: ["Демо-тема 3", "Демо-тема 4"],
    lastCalculatedAt: new Date("2026-04-09T12:00:00.000Z").toISOString()
  }));
}

export function getDemoStatisticsDetail(subjectId: string) {
  const item = getDemoStatisticsSummary().find((subject) => subject.subjectId === subjectId);

  if (!item) {
    return null;
  }

  return {
    ...item,
    recentAttempts: [
      {
        attemptId: `${subjectId}-attempt-1`,
        taskTitle: "Демо-задание по теме",
        taskTypeName: "Демо-тип второй части",
        score: 3,
        checkedAt: new Date("2026-04-09T12:30:00.000Z").toISOString()
      },
      {
        attemptId: `${subjectId}-attempt-2`,
        taskTitle: "Ещё одно демо-задание",
        taskTypeName: "Практика по критериям",
        score: 2,
        checkedAt: new Date("2026-04-08T16:00:00.000Z").toISOString()
      }
    ]
  };
}
