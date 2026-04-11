import { db } from "@/lib/db";
import { demoBootstrapService } from "@/server/services/demo-bootstrap.service";

export class SubjectService {
  async listAvailableSubjects() {
    try {
      await demoBootstrapService.ensureDemoData();
    } catch (error) {
      console.error("[subjects] ensureDemoData failed in listAvailableSubjects", error);
    }

    return db.subject.findMany({
      where: {
        isActive: true
      },
      orderBy: { name: "asc" }
    });
  }

  async listSubjects() {
    return this.listAvailableSubjects();
  }

  async listSubjectsForUser(userId: string) {
    try {
      await demoBootstrapService.ensureDemoData();
    } catch (error) {
      console.error("[subjects] ensureDemoData failed in listSubjectsForUser", error);
    }

    const selected = await db.userSubject.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { subject: { name: "asc" } }
    });

    return selected.map((item) => item.subject).filter((subject) => Boolean(subject));
  }

  async replaceUserSubjects(userId: string, subjectIds: string[]) {
    try {
      await demoBootstrapService.ensureDemoData();
    } catch (error) {
      console.error("[subjects] ensureDemoData failed in replaceUserSubjects", error);
    }

    const uniqueSubjectIds = Array.from(new Set(subjectIds));

    return db.$transaction(async (tx) => {
      await tx.userSubject.deleteMany({
        where: { userId }
      });

      await tx.userSubject.createMany({
        data: uniqueSubjectIds.map((subjectId) => ({
          userId,
          subjectId
        }))
      });

      return tx.subject.findMany({
        where: {
          id: { in: uniqueSubjectIds }
        },
        orderBy: { name: "asc" }
      });
    });
  }

  async getTaskTypes(subjectId: string) {
    await demoBootstrapService.ensureDemoData();

    return db.examTaskType.findMany({
      where: { subjectId, isActive: true },
      orderBy: [{ taskNumber: "asc" }, { name: "asc" }]
    });
  }
}

export const subjectService = new SubjectService();
