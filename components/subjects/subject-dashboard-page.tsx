"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { TopBar } from "@/components/navigation/top-bar";
import { StickyActions } from "@/components/navigation/sticky-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { examTaskTypeSchema } from "@/schemas/subject";
import { z } from "zod";

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

  return (
    <div className="pb-28">
      <TopBar title="Предмет" backHref="/" />
      <main className="space-y-4 px-4 py-4">
        <Card className="bg-sand">
          <p className="text-sm text-slate-600">Поток работы</p>
          <h2 className="mt-2 text-xl font-semibold">Решай по типам или собери вариант второй части</h2>
          <p className="mt-3 text-sm text-slate-600">В demo_seed уже есть задания, критерии и эталонные решения для быстрого старта.</p>
        </Card>

        <div className="space-y-3">
          <Card>
            <h3 className="text-lg font-semibold">Выбрать тип задания</h3>
            <p className="mt-2 text-sm text-slate-500">Открой список типов и тренируй точечно слабые темы.</p>
            <Button className="mt-4" fullWidth onClick={() => router.push(`/subjects/${subjectId}/task-types`)}>
              Открыть типы заданий
            </Button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Создать вариант из второй части</h3>
            <p className="mt-2 text-sm text-slate-500">Собираем последовательную сессию из опубликованных задач.</p>
            <Button className="mt-4" fullWidth onClick={() => router.push(`/subjects/${subjectId}/variant`)} disabled={taskTypesQuery.isLoading}>
              Создать вариант
            </Button>
          </Card>
        </div>
      </main>
      <StickyActions>
        <Button fullWidth variant="secondary" onClick={() => router.push("/statistics")}>
          Перейти к статистике
        </Button>
      </StickyActions>
    </div>
  );
}
