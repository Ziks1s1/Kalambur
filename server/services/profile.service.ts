import { db } from "@/lib/db";
import { subjectService } from "@/server/services/subject.service";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export class ProfileService {
  async getProfile(userId: string) {
    const [user, selectedSubjects, availableSubjects, activityDays, subjectStats] = await Promise.all([
      db.user.findUniqueOrThrow({
        where: { id: userId }
      }),
      subjectService.listSubjectsForUser(userId),
      subjectService.listAvailableSubjects(),
      this.getActivityDays(userId),
      this.getSubjectStats(userId)
    ]);

    return {
      user,
      selectedSubjects,
      availableSubjects,
      activityDays,
      subjectStats
    };
  }

  async getActivityDays(userId: string, month = new Date()) {
    const from = startOfMonth(month);
    const to = endOfMonth(month);

    const attempts = await db.userAttempt.findMany({
      where: {
        userId,
        status: { in: ["SUBMITTED", "CHECKED"] },
        submittedAt: {
          gte: from,
          lt: to
        }
      },
      select: {
        submittedAt: true
      }
    });

    const byDate = new Map<string, number>();

    for (const attempt of attempts) {
      if (!attempt.submittedAt) {
        continue;
      }

      const key = attempt.submittedAt.toISOString().slice(0, 10);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }

    return Array.from(byDate.entries())
      .map(([date, attemptCount]) => ({
        date,
        attemptCount
      }))
      .sort((left, right) => left.date.localeCompare(right.date));
  }

  async getSubjectStats(userId: string) {
    const selectedSubjects = await subjectService.listSubjectsForUser(userId);

    const results = await Promise.all(
      selectedSubjects.map(async (subject) => {
        const checks = await db.aICheck.findMany({
          where: {
            attempt: {
              userId,
              variantTask: {
                taskBankItem: {
                  subjectId: subject.id
                }
              }
            }
          },
          include: {
            attempt: {
              include: {
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
            }
          }
        });

        const taskTypeMap = new Map<
          string,
          { taskTypeId: string; taskTypeName: string; taskNumber: number; checkedCount: number; totalScore: number; totalRate: number }
        >();

        for (const check of checks) {
          const taskType = check.attempt.variantTask.taskBankItem.taskType;
          const current =
            taskTypeMap.get(taskType.id) ??
            ({
              taskTypeId: taskType.id,
              taskTypeName: taskType.name,
              taskNumber: taskType.taskNumber,
              checkedCount: 0,
              totalScore: 0,
              totalRate: 0
            } as const);

          taskTypeMap.set(taskType.id, {
            ...current,
            checkedCount: current.checkedCount + 1,
            totalScore: current.totalScore + check.totalScore,
            totalRate: current.totalRate + check.totalScore / Math.max(check.maxScore, 1)
          });
        }

        const taskTypes = Array.from(taskTypeMap.values())
          .map((item) => ({
            taskTypeId: item.taskTypeId,
            taskTypeName: item.taskTypeName,
            taskNumber: item.taskNumber,
            averageScore: item.checkedCount === 0 ? 0 : Number((item.totalScore / item.checkedCount).toFixed(2)),
            averageRate: item.checkedCount === 0 ? 0 : Number((item.totalRate / item.checkedCount).toFixed(2)),
            checkedCount: item.checkedCount
          }))
          .sort((left, right) => left.taskNumber - right.taskNumber);

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          averageScore:
            taskTypes.length === 0
              ? 0
              : Number((taskTypes.reduce((sum, item) => sum + item.averageScore, 0) / taskTypes.length).toFixed(2)),
          checkedCount: taskTypes.reduce((sum, item) => sum + item.checkedCount, 0),
          taskTypes
        };
      })
    );

    return results;
  }
}

export const profileService = new ProfileService();
