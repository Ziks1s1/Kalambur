"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { CheckResultCard } from "@/components/attempts/check-result-card";
import { UploadSolutionBlock } from "@/components/attempts/upload-solution-block";
import { TopBar } from "@/components/navigation/top-bar";
import { TaskDetailCard } from "@/components/tasks/task-detail-card";
import { TaskImageFrame } from "@/components/tasks/task-image-frame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { getReferenceAssets, getReferenceText } from "@/lib/utils/reference-solution";
import { generatedVariantSchema } from "@/schemas/variant";

const aiCheckSchema = z.object({
  id: z.string(),
  model: z.string(),
  totalScore: z.number(),
  maxScore: z.number(),
  criterionBreakdown: z.array(
    z.object({
      criterionCode: z.string(),
      criterionTitle: z.string(),
      awardedScore: z.number(),
      maxScore: z.number(),
      comment: z.string()
    })
  ),
  confidence: z.number(),
  extractedText: z.string(),
  createdAt: z.string()
});

type VariantData = z.infer<typeof generatedVariantSchema>;
type AICheckData = z.infer<typeof aiCheckSchema>;

export function VariantSessionPage({ variantId }: { variantId: string }) {
  const queryClient = useQueryClient();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [expandedReferenceTaskId, setExpandedReferenceTaskId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AICheckData | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const query = useQuery<VariantData>({
    queryKey: ["variant", variantId],
    queryFn: () =>
      apiClient(`/api/variants/${variantId}`, {
        schema: generatedVariantSchema
      })
  });

  const tasks = query.data?.tasks ?? [];

  useEffect(() => {
    if (!tasks.length) {
      return;
    }

    if (activeTaskId && tasks.some((task) => task.id === activeTaskId)) {
      return;
    }

    const firstIncomplete = tasks.find((task) => !task.isCompleted)?.id ?? tasks[0]?.id ?? null;
    setActiveTaskId(firstIncomplete);
  }, [activeTaskId, tasks]);

  const activeIndex = Math.max(
    tasks.findIndex((task) => task.id === activeTaskId),
    0
  );
  const currentTask = tasks[activeIndex] ?? null;
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const progressValue = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const totalScore = tasks.reduce((sum, task) => sum + (task.latestAttempt?.aiCheck?.totalScore ?? 0), 0);
  const maxScore = tasks.reduce((sum, task) => sum + (task.latestAttempt?.aiCheck?.maxScore ?? task.taskBankItem.maxScore), 0);
  const allCompleted = tasks.length > 0 && tasks.every((task) => task.isCompleted && task.latestAttempt?.aiCheck);

  const submitMutation = useMutation<AICheckData, Error, { variantTaskId: string; files: File[]; comment: string }>({
    mutationFn: async (input) => {
      const attempt = await apiClient("/api/attempts", {
        method: "POST",
        body: {
          variantTaskId: input.variantTaskId,
          comment: input.comment
        },
        schema: z.object({
          id: z.string()
        })
      });

      const formData = new FormData();
      input.files.forEach((file) => formData.append("files", file));

      await apiClient(`/api/attempts/${attempt.id}/upload`, {
        method: "POST",
        formData,
        schema: z.object({
          files: z.array(
            z.object({
              id: z.string()
            })
          )
        })
      });

      return apiClient(`/api/attempts/${attempt.id}/submit-for-check`, {
        method: "POST",
        schema: aiCheckSchema
      });
    },
    onSuccess: (result) => {
      setLastResult(result);
      queryClient.invalidateQueries({ queryKey: ["variant", variantId] });
    }
  });

  const summaryItems = useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        taskNumber: task.taskBankItem.taskType?.taskNumber ?? task.orderIndex + 1,
        title: task.taskBankItem.title,
        score: task.latestAttempt?.aiCheck?.totalScore ?? 0,
        maxScore: task.latestAttempt?.aiCheck?.maxScore ?? task.taskBankItem.maxScore
      })),
    [tasks]
  );

  return (
    <div className="pb-10">
      <TopBar title="Вариант" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        <Card className="bg-[#fff8ef]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Полный вариант второй части</p>
              <h2 className="mt-1 text-xl font-semibold text-[#243041]">
                Выполнено {completedCount} из {tasks.length}
              </h2>
            </div>
            <Button variant="secondary" disabled={!allCompleted}>
              Итог: {totalScore}/{maxScore}
            </Button>
          </div>
        </Card>

        {currentTask ? (
          <>
            <Card className="bg-[#fffdf9]">
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="ghost" disabled={activeIndex === 0} onClick={() => setActiveTaskId(tasks[activeIndex - 1]?.id ?? null)}>
                  <ChevronLeft size={18} />
                </Button>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Текущее задание</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#243041]">№{currentTask.taskBankItem.taskType?.taskNumber ?? currentTask.orderIndex + 1}</h3>
                  <p className="text-sm text-slate-500">
                    {activeIndex + 1} из {tasks.length}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={activeIndex >= tasks.length - 1}
                  onClick={() => setActiveTaskId(tasks[activeIndex + 1]?.id ?? null)}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </Card>

            <TaskDetailCard task={currentTask.taskBankItem} progressLabel="Прогресс варианта" progressValue={progressValue} />

            {!currentTask.isCompleted ? (
              <UploadSolutionBlock
                errorMessage={submitMutation.error?.message ?? null}
                onSubmit={async (input) => {
                  await submitMutation.mutateAsync({
                    variantTaskId: currentTask.id,
                    files: input.files,
                    comment: input.comment
                  });
                }}
              />
            ) : (
              <Card className="bg-[#eef8f1]">
                <p className="text-sm text-[#2c5b3e]">Задание уже проверено. Можно перейти стрелками к следующему или посмотреть итог ниже.</p>
              </Card>
            )}

            {currentTask.latestAttempt?.aiCheck ? <CheckResultCard result={currentTask.latestAttempt.aiCheck} /> : null}

            {currentTask.isCompleted ? (
              <Card className="bg-[#fff8ef]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#243041]">Эталон решения</h3>
                    <p className="mt-1 text-sm text-slate-600">Показывается только после проверки этого конкретного задания.</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setExpandedReferenceTaskId((current) => (current === currentTask.id ? null : currentTask.id))}
                  >
                    {expandedReferenceTaskId === currentTask.id ? "Скрыть эталон" : "Посмотреть эталон решения"}
                  </Button>
                </div>

                {expandedReferenceTaskId === currentTask.id ? (
                  <div className="mt-4 space-y-4">
                    {getReferenceText(currentTask.taskBankItem.referenceSolution) ? (
                      <div className="whitespace-pre-line rounded-3xl bg-white/90 p-4 text-sm leading-7 text-slate-700">
                        {getReferenceText(currentTask.taskBankItem.referenceSolution)}
                      </div>
                    ) : null}

                    {getReferenceAssets(currentTask.taskBankItem.referenceSolution?.rubricJson).referenceImageUrls.map((imageUrl, index) => (
                      <TaskImageFrame key={`${currentTask.id}-reference-${index}`} src={imageUrl} alt={`Эталон ${index + 1}`} />
                    ))}
                  </div>
                ) : null}
              </Card>
            ) : null}
          </>
        ) : null}

        <Card className="bg-[#1d2f2f] text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Завершение</p>
              <h3 className="mt-1 text-lg font-semibold">Итог по заданиям 13-19</h3>
            </div>
            <Button variant="secondary" disabled={!allCompleted} onClick={() => setShowSummary(true)}>
              Завершить
            </Button>
          </div>

          {!showSummary ? (
            <p className="mt-4 text-sm text-white/75">Когда все задания будут проверены, кнопка «Завершить» откроет итог по каждому номеру и общий балл.</p>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {summaryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-3 text-sm">
                    <span>
                      №{item.taskNumber} {item.title}
                    </span>
                    <span>
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm">Общий итог: {totalScore}/{maxScore}</div>
            </>
          )}
        </Card>

        {lastResult && !currentTask?.latestAttempt?.aiCheck ? <CheckResultCard result={lastResult} /> : null}
      </main>
    </div>
  );
}
