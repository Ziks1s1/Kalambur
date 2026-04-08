import { db } from "@/lib/db";

export class SubjectService {
  async listSubjects() {
    return db.subject.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
  }

  async getTaskTypes(subjectId: string) {
    return db.examTaskType.findMany({
      where: { subjectId, isActive: true },
      orderBy: [{ taskNumber: "asc" }, { name: "asc" }]
    });
  }
}

export const subjectService = new SubjectService();
