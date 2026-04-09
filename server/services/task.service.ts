import { db } from "@/lib/db";
import { demoBootstrapService } from "@/server/services/demo-bootstrap.service";

export class TaskService {
  async listByType(taskTypeId: string) {
    await demoBootstrapService.ensureDemoData();

    return db.taskBankItem.findMany({
      where: {
        taskTypeId,
        isPublished: true
      },
      include: {
        taskType: true,
        criteria: { orderBy: { sortOrder: "asc" } },
        referenceSolution: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getTask(taskId: string) {
    await demoBootstrapService.ensureDemoData();

    return db.taskBankItem.findUniqueOrThrow({
      where: { id: taskId },
      include: {
        taskType: true,
        subject: true,
        criteria: { orderBy: { sortOrder: "asc" } },
        referenceSolution: true
      }
    });
  }
}

export const taskService = new TaskService();
