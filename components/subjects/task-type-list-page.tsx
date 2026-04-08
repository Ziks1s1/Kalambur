"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TopBar } from "@/components/navigation/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { examTaskTypeSchema } from "@/schemas/subject";
import { taskBankItemSchema } from "@/schemas/task";
import { generatedVariantSchema } from "@/schemas/variant";
import { z } from "zod";

const taskTypesSchema = examTaskTypeSchema.array();
const tasksSchema = taskBankItemSchema.array();
type TaskTypes = z.infer<typeof taskTypesSchema>;
type Tasks = z.infer<typeof tasksSchema>;

export function TaskTypeListPage({ subjectId, selectedTaskTypeId }: { subjectId: string; selectedTaskTypeId?: string }) {
  const router = useRouter();
  const query = useQuery<TaskTypes>({
    queryKey: ["task-types", subjectId],
    queryFn: () =>
      apiClient(`/api/subjects/${subjectId}/task-types`, {
        schema: taskTypesSchema
      })
  });

  const tasksQuery = useQuery<Tasks>({
    queryKey: ["tasks-by-type", selectedTaskTypeId],
    queryFn: () =>
      apiClient(`/api/tasks/by-type/${selectedTaskTypeId}`, {
        schema: tasksSchema
      }),
    enabled: Boolean(selectedTaskTypeId)
  });

  const createVariantMutation = useMutation({
    mutationFn: (taskTypeId: string) =>
      apiClient("/api/variants", {
        method: "POST",
        body: {
          subjectId,
          taskTypeIds: [taskTypeId],
          taskCount: 1
        },
        schema: generatedVariantSchema
      }),
    onSuccess: (variant) => router.push(`/variants/${variant.id}`)
  });

  return (
    <div className="pb-10">
      <TopBar title="Типы заданий" backHref={`/subjects/${subjectId}`} />
      <main className="space-y-3 px-4 py-4">
        {query.data?.map((taskType) => (
          <Link key={taskType.id} href={`/subjects/${subjectId}/task-types?taskTypeId=${taskType.id}`} className="block">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Задание {taskType.taskNumber}</p>
                  <h2 className="mt-1 text-lg font-semibold">{taskType.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{taskType.description}</p>
                </div>
                <Badge tone="blue">{taskType.maxScore} баллов</Badge>
              </div>
            </Card>
          </Link>
        ))}

        {selectedTaskTypeId ? (
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Demo задания</h3>
                <p className="text-sm text-slate-500">Открой короткую тренировочную сессию по выбранному типу.</p>
              </div>
              <Button variant="secondary" onClick={() => createVariantMutation.mutate(selectedTaskTypeId)}>
                Решать
              </Button>
            </div>

            {tasksQuery.data?.map((task) => (
              <div key={task.id} className="rounded-3xl bg-slate-50 p-3">
                <h4 className="font-semibold">{task.title}</h4>
                <p className="mt-2 text-sm text-slate-600 line-clamp-4">{task.problemText}</p>
              </div>
            ))}
          </Card>
        ) : null}
      </main>
    </div>
  );
}
