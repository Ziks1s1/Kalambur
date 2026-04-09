"use client";

import { useQuery } from "@tanstack/react-query";
import { Layers3, Sparkles, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { StickyActions } from "@/components/navigation/sticky-actions";
import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { hasTelegramWebApp } from "@/lib/telegram/webapp";
import { examTaskTypeSchema } from "@/schemas/subject";

const taskTypesSchema = examTaskTypeSchema.array();

type TaskTypes = z.infer<typeof taskTypesSchema>;

export function SubjectDashboardPage({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const canSolveInsideTelegram = hasTelegramWebApp();

  const taskTypesQuery = useQuery<TaskTypes>({
    queryKey: ["task-types", subjectId],
    queryFn: () =>
      apiClient(`/api/subjects/${subjectId}/task-types`, {
        schema: taskTypesSchema
      })
  });

  const taskTypes = taskTypesQuery.data ?? [];

  return (
    <div className="pb-28">
      <TopBar title="Предмет" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        <Card className="overflow-hidden bg-[#fff7ee]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Маршрут</p>
              <h2 className="mt-2 text-2xl font-semibold">Решай точечно или собери мини-вариант</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Здесь можно перейти к отдельным типам второй части или собрать короткую тренировочную сессию по нескольким темам.
              </p>
            </div>
            <div className="rounded-3xl bg-[#f2dfc8] p-3 text-[#8f5e36]">
              <Sparkles size={20} />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-[#fffaf4] p-4 text-center">
            <p className="text-xs text-slate-500">Типов</p>
            <p className="mt-2 text-lg font-semibold">{taskTypes.length || "—"}</p>
          </Card>
          <Card className="bg-[#fffaf4] p-4 text-center">
            <Layers3 className="mx-auto text-[#9e6f3d]" size={18} />
            <p className="mt-2 text-sm font-semibold">Темы</p>
          </Card>
          <Card className="bg-[#fffaf4] p-4 text-center">
            <Target className="mx-auto text-[#2f6e65]" size={18} />
            <p className="mt-2 text-sm font-semibold">Практика</p>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold">Выбрать тип задания</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Открой список тем, просмотри конкретные задания и зайди в ту часть, где проседает балл.
          </p>
          <Button className="mt-4" fullWidth onClick={() => router.push(`/subjects/${subjectId}/task-types`)}>
            Перейти к типам заданий
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Собрать вариант второй части</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Соберём короткую последовательность заданий по выбранным типам и откроем их по одному, как на настоящей сессии.
          </p>
          <Button
            className="mt-4"
            fullWidth
            variant="secondary"
            onClick={() => router.push(`/subjects/${subjectId}/variant`)}
            disabled={!canSolveInsideTelegram}
          >
            {canSolveInsideTelegram ? "Открыть генератор варианта" : "Решение доступно в Telegram"}
          </Button>
        </Card>

        {taskTypesQuery.isLoading ? <Card>Загружаем типы заданий...</Card> : null}

        {!taskTypesQuery.isLoading && !taskTypes.length ? (
          <EmptyState
            title="Для этого предмета пока нет тем"
            description="Проверь demo seed или импортируй verified-банк через admin-раздел."
          />
        ) : (
          <div className="space-y-3">
            {taskTypes.slice(0, 3).map((taskType) => (
              <Card key={taskType.id} className="bg-white/92">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Задание {taskType.taskNumber}</p>
                    <h4 className="mt-2 text-lg font-semibold">{taskType.name}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{taskType.description}</p>
                  </div>
                  <span className="rounded-full bg-[#f0dfca] px-3 py-1 text-xs font-semibold text-[#8c5a2f]">
                    {taskType.maxScore} баллов
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <StickyActions>
        <Button fullWidth variant="secondary" onClick={() => router.push("/statistics")} disabled={!canSolveInsideTelegram}>
          {canSolveInsideTelegram ? "Перейти к статистике" : "Статистика доступна в Telegram"}
        </Button>
      </StickyActions>
    </div>
  );
}
