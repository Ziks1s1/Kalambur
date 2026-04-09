"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Layers2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { examTaskTypeSchema } from "@/schemas/subject";
import { taskBankItemSchema } from "@/schemas/task";

const taskTypesSchema = examTaskTypeSchema.array();
const tasksSchema = taskBankItemSchema.array();

type TaskTypes = z.infer<typeof taskTypesSchema>;
type Tasks = z.infer<typeof tasksSchema>;

export function TaskTypeListPage({ subjectId, selectedTaskTypeId }: { subjectId: string; selectedTaskTypeId?: string }) {
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

  return (
    <div className="pb-10">
      <TopBar title="Типы заданий" backHref={`/subjects/${subjectId}`} />

      <main className="space-y-4 px-4 py-4">
        <Card className="bg-[#fff8ef]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Навигация</p>
              <h2 className="mt-2 text-xl font-semibold text-[#243041]">Выбери тему и открой задание</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Сначала выбираешь тип задания, затем получаешь список карточек и открываешь конкретное условие с загрузкой решения на той же странице.
              </p>
            </div>

            <div className="rounded-3xl bg-[#f1deca] p-3 text-[#8c5a2f]">
              <Layers2 size={18} />
            </div>
          </div>
        </Card>

        {query.isLoading ? <Card>Загружаем темы...</Card> : null}

        {!query.isLoading && !query.data?.length ? (
          <EmptyState title="Типы заданий не найдены" description="Для этого предмета пока нет опубликованных тем." />
        ) : null}

        <div className="grid gap-3">
          {query.data?.map((taskType) => {
            const selected = selectedTaskTypeId === taskType.id;

            return (
              <Link key={taskType.id} href={`/subjects/${subjectId}/task-types?taskTypeId=${taskType.id}`} className="block">
                <Card className={selected ? "border-[#d1ab7a] bg-[#fff3e2] p-4" : "bg-white/92 p-4"}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Задание {taskType.taskNumber}</p>
                      <h3 className="mt-1 text-lg font-semibold text-[#243041]">{taskType.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{taskType.description}</p>
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Задания</p>
                <h3 className="mt-2 text-xl font-semibold text-[#243041]">Карточки по выбранной теме</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Выбери карточку и открой условие. На странице задания можно сразу загрузить решение и отправить его на проверку.
                </p>
              </div>
            </div>

            {tasksQuery.isLoading ? <Card>Подгружаем задания...</Card> : null}

            {!tasksQuery.isLoading && !tasksQuery.data?.length ? (
              <EmptyState title="Заданий пока нет" description="Для выбранного типа ещё не добавлены опубликованные задания." />
            ) : null}

            <div className="grid gap-3">
              {tasksQuery.data?.map((task, index) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                  <Card className="bg-white/95 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Карточка {index + 1}</p>
                        <h4 className="mt-1 text-lg font-semibold text-[#243041]">{task.title}</h4>
                        <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{task.problemText}</p>
                      </div>
                      <Button variant="secondary" className="h-10 shrink-0 px-3">
                        Открыть
                      </Button>
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
