"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight, Layers2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { hasTelegramWebApp } from "@/lib/telegram/webapp";
import { examTaskTypeSchema } from "@/schemas/subject";
import { taskBankItemSchema } from "@/schemas/task";
import { generatedVariantSchema } from "@/schemas/variant";

const taskTypesSchema = examTaskTypeSchema.array();
const tasksSchema = taskBankItemSchema.array();

type TaskTypes = z.infer<typeof taskTypesSchema>;
type Tasks = z.infer<typeof tasksSchema>;
type GeneratedVariant = z.infer<typeof generatedVariantSchema>;

export function TaskTypeListPage({ subjectId, selectedTaskTypeId }: { subjectId: string; selectedTaskTypeId?: string }) {
  const router = useRouter();
  const canSolveInsideTelegram = hasTelegramWebApp();

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

  const createVariantMutation = useMutation<GeneratedVariant, Error, string>({
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

      <main className="space-y-4 px-4 py-4">
        <Card className="bg-[#fff8ef]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Навигация</p>
              <h2 className="mt-2 text-xl font-semibold">Выбери тему и открой конкретные задания</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Сначала выбираешь тип, потом смотришь реальные карточки задач и при желании запускаешь короткую сессию на один тип.
              </p>
            </div>
            <div className="rounded-3xl bg-[#f1deca] p-3 text-[#8c5a2f]">
              <Layers2 size={18} />
            </div>
          </div>
        </Card>

        {query.isLoading ? <Card>Загружаем темы...</Card> : null}

        {!query.isLoading && !query.data?.length ? (
          <EmptyState title="Типы заданий не найдены" description="Похоже, для этого предмета пока не загружены темы второй части." />
        ) : null}

        <div className="space-y-3">
          {query.data?.map((taskType) => {
            const selected = selectedTaskTypeId === taskType.id;

            return (
              <Link
                key={taskType.id}
                href={`/subjects/${subjectId}/task-types?taskTypeId=${taskType.id}`}
                className="block"
              >
                <Card className={selected ? "border-[#d1ab7a] bg-[#fff7ec]" : "bg-white/92"}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Задание {taskType.taskNumber}</p>
                      <h3 className="mt-2 text-lg font-semibold">{taskType.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{taskType.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge tone="blue">{taskType.maxScore} баллов</Badge>
                      <ChevronRight className="text-slate-400" size={18} />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {selectedTaskTypeId ? (
          <Card className="space-y-4 bg-[#fffdf9]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Задания</p>
                <h3 className="mt-2 text-xl font-semibold">Подборка по выбранной теме</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Можно просмотреть условие, а если ты уже внутри Telegram Mini App — сразу открыть короткую практику.
                </p>
              </div>
              {canSolveInsideTelegram ? (
                <Button variant="primary" onClick={() => createVariantMutation.mutate(selectedTaskTypeId)} disabled={createVariantMutation.isPending}>
                  Решать эту тему
                </Button>
              ) : (
                <span className="inline-flex h-11 items-center rounded-2xl border border-[#dccdbb] bg-[#f8f2ea] px-4 text-sm font-medium text-slate-500">
                  Решение доступно в Telegram
                </span>
              )}
            </div>

            {tasksQuery.isLoading ? <Card>Подгружаем задания...</Card> : null}

            {!tasksQuery.isLoading && !tasksQuery.data?.length ? (
              <EmptyState title="Заданий пока нет" description="Для выбранного типа ещё не добавлены опубликованные задачи." />
            ) : null}

            <div className="space-y-3">
              {tasksQuery.data?.map((task, index) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                  <Card className="bg-white/95">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Задача {index + 1}</p>
                        <h4 className="mt-2 text-lg font-semibold">{task.title}</h4>
                        <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{task.problemText}</p>
                      </div>
                      <Button variant="secondary">Открыть</Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
