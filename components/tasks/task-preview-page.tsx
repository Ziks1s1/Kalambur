"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { taskBankItemSchema } from "@/schemas/task";

type TaskDetails = z.infer<typeof taskBankItemSchema>;

export function TaskPreviewPage({ taskId }: { taskId: string }) {
  const query = useQuery<TaskDetails>({
    queryKey: ["task", taskId],
    queryFn: () =>
      apiClient(`/api/tasks/${taskId}`, {
        schema: taskBankItemSchema
      })
  });

  const task = query.data;

  return (
    <div className="pb-10">
      <TopBar title="Задание" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        {query.isLoading ? <Card>Загружаем задание...</Card> : null}

        {!query.isLoading && !task ? (
          <EmptyState title="Задание не найдено" description="Возможно, оно было снято с публикации или ещё не загружено в банк." />
        ) : null}

        {task ? (
          <>
            <Card className="bg-[#fff8ef]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    {task.taskType?.name ?? "Тип задания"} · {task.taskType?.taskNumber ? `№ ${task.taskType.taskNumber}` : "Вторая часть"}
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold">{task.title}</h1>
                </div>
                <span className="rounded-full bg-[#ead7c0] px-3 py-1 text-xs font-semibold text-[#8c5a2f]">
                  {task.maxScore} баллов
                </span>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold">Условие</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{task.problemText}</p>
            </Card>

            {task.criteria?.length ? (
              <Card>
                <h2 className="text-lg font-semibold">Критерии</h2>
                <div className="mt-4 space-y-3">
                  {task.criteria.map((criterion) => (
                    <div key={criterion.id} className="rounded-3xl bg-[#faf4ec] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">
                          {criterion.code}. {criterion.title}
                        </p>
                        <span className="text-sm text-slate-500">{criterion.maxScore} балл.</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{criterion.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card className="bg-[#1d2f2f] text-white">
              <h2 className="text-lg font-semibold">Дальше</h2>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Для отправки решения, загрузки фото и AI-проверки открой это приложение внутри Telegram Mini App.
              </p>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Назад к списку
                </Button>
              </div>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
