import { db } from "@/lib/db";

export function aggregateStatistics(
  attempts: Array<{
    aiCheck: { totalScore: number; maxScore: number } | null;
    variantTask: { taskBankItem: { taskType: { name: string } } };
  }>
) {
  const solvedCount = attempts.length;
  const checkedAttempts = attempts.filter((attempt) => attempt.aiCheck !== null);
  const checkedCount = checkedAttempts.length;
  const averageScore =
    checkedCount === 0
      ? 0
      : checkedAttempts.reduce((sum, attempt) => sum + (attempt.aiCheck?.totalScore ?? 0), 0) / checkedCount;
  const completionRate =
    checkedCount === 0
      ? 0
      : checkedAttempts.reduce((sum, attempt) => {
          const aiCheck = attempt.aiCheck;
          return sum + (aiCheck ? aiCheck.totalScore / Math.max(aiCheck.maxScore, 1) : 0);
        }, 0) / checkedCount;

  const topicMap = new Map<string, { total: number; max: number }>();

  for (const attempt of checkedAttempts) {
    const topic = attempt.variantTask.taskBankItem.taskType.name;
    const current = topicMap.get(topic) ?? { total: 0, max: 0 };
    current.total += attempt.aiCheck?.totalScore ?? 0;
    current.max += attempt.aiCheck?.maxScore ?? 0;
    topicMap.set(topic, current);
  }

  const sorted = Array.from(topicMap.entries())
    .map(([topic, metrics]) => ({
      topic,
      rate: metrics.max === 0 ? 0 : metrics.total / metrics.max
    }))
    .sort((left, right) => right.rate - left.rate);

  return {
    solvedCount,
    checkedCount,
    averageScore: Number(averageScore.toFixed(2)),
    completionRate: Number(completionRate.toFixed(2)),
    strongTopics: sorted.slice(0, 3).map((item) => item.topic),
    weakTopics: [...sorted].reverse().slice(0, 3).map((item) => item.topic)
  };
}

export class StatisticsService {
  async recalculateForUser(userId: string) {
    const userSubjects = await db.userSubject.findMany({
      where: { userId },
      include: { subject: true }
    });
    const subjects = userSubjects.length
      ? userSubjects.map((item) => item.subject)
      : await db.subject.findMany({
          where: { isActive: true }
        });

    for (const subject of subjects) {
      const attempts = await db.userAttempt.findMany({
        where: {
          userId,
          variantTask: {
            taskBankItem: {
              subjectId: subject.id
            }
          }
        },
        include: {
          aiCheck: true,
          variantTask: {
            include: {
              taskBankItem: {
                include: {
                  taskType: true
                }
              }
            }
          }
        }
      });

      const aggregated = aggregateStatistics(attempts);

      await db.userStatistics.upsert({
        where: {
          userId_subjectId: {
            userId,
            subjectId: subject.id
          }
        },
        update: {
          solvedCount: aggregated.solvedCount,
          checkedCount: aggregated.checkedCount,
          averageScore: aggregated.averageScore,
          completionRate: aggregated.completionRate,
          weakTopicsJson: aggregated.weakTopics,
          strongTopicsJson: aggregated.strongTopics,
          lastCalculatedAt: new Date()
        },
        create: {
          userId,
          subjectId: subject.id,
          solvedCount: aggregated.solvedCount,
          checkedCount: aggregated.checkedCount,
          averageScore: aggregated.averageScore,
          completionRate: aggregated.completionRate,
          weakTopicsJson: aggregated.weakTopics,
          strongTopicsJson: aggregated.strongTopics,
          lastCalculatedAt: new Date()
        }
      });
    }
  }

  async getSubjectsSummary(userId: string) {
    await this.recalculateForUser(userId);

    const stats = await db.userStatistics.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { subject: { name: "asc" } }
    });

    return stats.map((stat) => ({
      subjectId: stat.subjectId,
      subjectName: stat.subject.name,
      solvedCount: stat.solvedCount,
      checkedCount: stat.checkedCount,
      averageScore: stat.averageScore,
      completionRate: stat.completionRate,
      weakTopics: Array.isArray(stat.weakTopicsJson) ? (stat.weakTopicsJson as string[]) : [],
      strongTopics: Array.isArray(stat.strongTopicsJson) ? (stat.strongTopicsJson as string[]) : [],
      lastCalculatedAt: stat.lastCalculatedAt.toISOString()
    }));
  }

  async getSubjectStatistics(userId: string, subjectId: string) {
    await this.recalculateForUser(userId);

    const stat = await db.userStatistics.findUniqueOrThrow({
      where: {
        userId_subjectId: {
          userId,
          subjectId
        }
      },
      include: { subject: true }
    });

    const recentAttempts = await db.userAttempt.findMany({
      where: {
        userId,
        variantTask: {
          taskBankItem: {
            subjectId
          }
        }
      },
      include: {
        aiCheck: true,
        variantTask: {
          include: {
            taskBankItem: {
              include: {
                taskType: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return {
      subjectId: stat.subjectId,
      subjectName: stat.subject.name,
      solvedCount: stat.solvedCount,
      checkedCount: stat.checkedCount,
      averageScore: stat.averageScore,
      completionRate: stat.completionRate,
      weakTopics: Array.isArray(stat.weakTopicsJson) ? (stat.weakTopicsJson as string[]) : [],
      strongTopics: Array.isArray(stat.strongTopicsJson) ? (stat.strongTopicsJson as string[]) : [],
      lastCalculatedAt: stat.lastCalculatedAt.toISOString(),
      recentAttempts: recentAttempts.map((attempt) => ({
        attemptId: attempt.id,
        taskTitle: attempt.variantTask.taskBankItem.title,
        taskTypeName: attempt.variantTask.taskBankItem.taskType.name,
        score: attempt.aiCheck?.totalScore ?? null,
        checkedAt: attempt.checkedAt?.toISOString() ?? null
      }))
    };
  }
}

export const statisticsService = new StatisticsService();
