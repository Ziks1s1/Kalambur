import { db } from "@/lib/db";
import { demoBootstrapService } from "@/server/services/demo-bootstrap.service";

export class SubjectService {
  async listSubjects() {
    await demoBootstrapService.ensureDemoData();

    return db.subject.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
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
