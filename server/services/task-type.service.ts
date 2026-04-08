import { db } from "@/lib/db";

export class TaskTypeService {
  async getTaskType(taskTypeId: string) {
    return db.examTaskType.findUniqueOrThrow({
      where: { id: taskTypeId }
    });
  }
}

export const taskTypeService = new TaskTypeService();
