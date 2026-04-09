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
import { hasTelegramWebApp } from "@/lib/telegram/webapp";
import { examTaskTypeSchema } from "@/schemas/subject";
import { createVariantSchema, generatedVariantSchema } from "@/schemas/variant";

const taskTypesSchema = examTaskTypeSchema.array();

type TaskTypes = z.infer<typeof taskTypesSchema>;
type GeneratedVariant = z.infer<typeof generatedVariantSchema>;

export function VariantGeneratorPage({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const canSolveInsideTelegram = hasTelegramWebApp();

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

  return (
    <div className="pb-10">
      <TopBar title="Генератор варианта" backHref={`/subjects/${subjectId}`} />

      <main className="space-y-4 px-4 py-4">
        <Card className="bg-[#fff8ee]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Конструктор</p>
          <h2 className="mt-2 text-xl font-semibold">Собери мини-вариант под свои слабые темы</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Отмечай несколько типов второй части, и мы откроем их как последовательную сессию. Внутри Telegram можно будет сразу загружать решение и отправлять на проверку.
          </p>
        </Card>

        {query.isLoading ? <Card>Загружаем темы для варианта...</Card> : null}

        {!query.isLoading && !query.data?.length ? (
          <EmptyState title="Пока нечего включать в вариант" description="Нужны опубликованные темы и задания в базе." />
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
            {canSolveInsideTelegram ? (
              <Button
                onClick={() =>
                  mutation.mutate({
                    subjectId,
                    taskTypeIds: selectedIds,
                    taskCount: Math.max(1, selectedIds.length)
                  })
                }
                disabled={selectedIds.length === 0 || mutation.isPending}
              >
                {mutation.isPending ? "Собираем..." : "Собрать вариант"}
              </Button>
            ) : null}
          </div>
          {!canSolveInsideTelegram ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white/72">
              Сборка последовательной сессии доступна внутри Telegram Mini App. Здесь можно выбрать темы и проверить,
              как выглядит каталог второй части без мёртвых кнопок.
            </div>
          ) : null}
        </Card>
      </main>
    </div>
  );
}
