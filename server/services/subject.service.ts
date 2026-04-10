import { db } from "@/lib/db";
import { demoSubjects } from "@/lib/demo/content";
import { demoBootstrapService } from "@/server/services/demo-bootstrap.service";

export class SubjectService {
  async listAvailableSubjects() {
    await demoBootstrapService.ensureDemoData();

    return db.subject.findMany({
      where: {
        isActive: true,
        code: {
          in: demoSubjects.map((subject) => subject.code)
        }
      },
      orderBy: { name: "asc" }
    });
  }

  async listSubjects() {
    return this.listAvailableSubjects();
  }

  async listSubjectsForUser(userId: string) {
    await demoBootstrapService.ensureDemoData();

    const selected = await db.userSubject.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { subject: { name: "asc" } }
    });

    return selected.map((item) => item.subject);
  }

  async replaceUserSubjects(userId: string, subjectIds: string[]) {
    await demoBootstrapService.ensureDemoData();

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
