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
import { examTaskTypeSchema } from "@/schemas/subject";

const taskTypesSchema = examTaskTypeSchema.array();

type TaskTypes = z.infer<typeof taskTypesSchema>;

export function SubjectDashboardPage({ subjectId }: { subjectId: string }) {
  const router = useRouter();

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
        <Card className="overflow-hidden bg-[#fff8ef]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Маршрут</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#243041]">Точечная практика или мини-вариант</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Можно зайти в конкретный тип задания, выбрать отдельную карточку или собрать короткий тренировочный вариант второй части.
              </p>
            </div>

            <div className="rounded-3xl bg-[#f2dfc8] p-3 text-[#8f5e36]">
              <Sparkles size={20} />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xs text-slate-500">Типов</p>
            <p className="mt-2 text-lg font-semibold text-[#243041]">{taskTypes.length || "—"}</p>
          </Card>
          <Card className="p-4 text-center">
            <Layers3 className="mx-auto text-[#9e6f3d]" size={18} />
            <p className="mt-2 text-sm font-semibold text-[#243041]">Темы</p>
          </Card>
          <Card className="p-4 text-center">
            <Target className="mx-auto text-[#2f6e65]" size={18} />
            <p className="mt-2 text-sm font-semibold text-[#243041]">Практика</p>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-[#243041]">Типы заданий</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Открой темы второй части и выбери конкретное задание, которое хочешь решить прямо сейчас.
          </p>
          <Button className="mt-4" fullWidth onClick={() => router.push(`/subjects/${subjectId}/task-types`)}>
            Перейти к типам заданий
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[#243041]">Собрать мини-вариант</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Собираем короткую последовательность задач и открываем их по одной, как на тренировочной сессии.
          </p>
          <Button className="mt-4" fullWidth variant="secondary" onClick={() => router.push(`/subjects/${subjectId}/variant`)}>
            Открыть генератор варианта
          </Button>
        </Card>

        {taskTypesQuery.isLoading ? <Card>Загружаем типы заданий...</Card> : null}

        {!taskTypesQuery.isLoading && !taskTypes.length ? (
          <EmptyState
            title="Для этого предмета пока нет тем"
            description="Проверь демо-банк или догрузи свой банк через админский раздел."
          />
        ) : (
          <div className="grid gap-3">
            {taskTypes.slice(0, 4).map((taskType) => (
              <Card key={taskType.id} className="bg-white/92 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Задание {taskType.taskNumber}</p>
                    <h4 className="mt-1 text-lg font-semibold text-[#243041]">{taskType.name}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{taskType.description}</p>
                  </div>
                  <span className="rounded-full bg-[#ead7c0] px-3 py-1 text-xs font-semibold text-[#8c5a2f]">
                    {taskType.maxScore} баллов
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <StickyActions>
        <Button fullWidth variant="secondary" onClick={() => router.push("/statistics")}>
          Открыть статистику
        </Button>
      </StickyActions>
    </div>
  );
}
