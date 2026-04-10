"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { useSessionUser } from "@/lib/auth/use-session-user";
import { examTaskTypeSchema } from "@/schemas/subject";
import { createVariantSchema, generatedVariantSchema } from "@/schemas/variant";

const taskTypesSchema = examTaskTypeSchema.array();

type TaskTypes = z.infer<typeof taskTypesSchema>;
type GeneratedVariant = z.infer<typeof generatedVariantSchema>;

export function VariantGeneratorPage({ subjectId, mode }: { subjectId: string; mode: "full" | "custom" }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { isAuthenticated } = useSessionUser();

  const query = useQuery<TaskTypes>({
    queryKey: ["task-types", subjectId],
    queryFn: () =>
      apiClient(`/api/subjects/${subjectId}/task-types`, {
        schema: taskTypesSchema
      })
  });

  const mutation = useMutation<GeneratedVariant, Error, z.infer<typeof createVariantSchema>>({
    mutationFn: (payload) =>
      apiClient("/api/variants", {
        method: "POST",
        body: payload,
        schema: generatedVariantSchema
      }),
    onSuccess: (variant) => {
      router.push(`/variants/${variant.id}`);
    }
  });

  const fullModeTaskTypes = (query.data ?? []).filter((taskType) => taskType.taskNumber >= 13 && taskType.taskNumber <= 19);

  return (
    <div className="pb-10">
      <TopBar title={mode === "full" ? "Полный вариант" : "Конструктор варианта"} backHref={`/subjects/${subjectId}`} />

      <main className="space-y-4 px-4 py-4">
        {mode === "full" ? (
          <Card className="bg-[#fff8ee]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Полный режим</p>
            <h2 className="mt-2 text-xl font-semibold">Вторая часть целиком</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Соберём по одному заданию каждого типа второй части и откроем их как единую сессию с общим итогом.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
              {fullModeTaskTypes.map((taskType) => (
                <span key={taskType.id} className="rounded-full bg-[#f2dfc8] px-3 py-1">
                  №{taskType.taskNumber}
                </span>
              ))}
            </div>
            <Button
              className="mt-4"
              fullWidth
              disabled={!isAuthenticated || mutation.isPending || fullModeTaskTypes.length === 0}
              onClick={() =>
                mutation.mutate({
                  subjectId,
                  mode: "FULL_SECOND_PART",
                  taskCount: fullModeTaskTypes.length
                })
              }
            >
              {mutation.isPending ? "Собираем..." : "Начать полный вариант"}
            </Button>
          </Card>
        ) : (
          <>
            <Card className="bg-[#fff8ee]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Конструктор</p>
              <h2 className="mt-2 text-xl font-semibold">Собери мини-вариант под свои темы</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Отмечай несколько типов второй части, и мы откроем их как последовательную тренировочную сессию.
              </p>
            </Card>

            {query.isLoading ? <Card>Загружаем темы для варианта...</Card> : null}

            {!query.isLoading && !query.data?.length ? (
              <EmptyState title="Пока нечего включать в вариант" description="Нужны опубликованные типы и задания в базе." />
            ) : null}

            <div className="space-y-3">
              {query.data?.map((taskType) => {
                const selected = selectedIds.includes(taskType.id);

                return (
                  <button
                    key={taskType.id}
                    type="button"
                    className="w-full text-left"
                    onClick={() =>
                      setSelectedIds((current) =>
                        current.includes(taskType.id) ? current.filter((item) => item !== taskType.id) : [...current, taskType.id]
                      )
                    }
                  >
                    <Card className={selected ? "border-[#cfab7c] bg-[#fff7ec]" : "bg-white/92"}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Задание {taskType.taskNumber}</p>
                          <h3 className="mt-2 text-lg font-semibold">{taskType.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">{taskType.description}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected ? "bg-[#1d2f2f] text-white" : "bg-[#efe4d8] text-[#8c5a2f]"}`}>
                          {selected ? "Выбрано" : `${taskType.maxScore} баллов`}
                        </span>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>

            <Card className="bg-[#1d2f2f] text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/65">Выбрано тем</p>
                  <h3 className="mt-1 text-2xl font-semibold">{selectedIds.length}</h3>
                </div>
                <Button
                  onClick={() =>
                    mutation.mutate({
                      subjectId,
                      mode: "TASK_TYPE_PRACTICE",
                      taskTypeIds: selectedIds,
                      taskCount: Math.max(1, selectedIds.length)
                    })
                  }
                  disabled={!isAuthenticated || selectedIds.length === 0 || mutation.isPending}
                >
                  {mutation.isPending ? "Собираем..." : "Собрать вариант"}
                </Button>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
