"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

import { CheckResultCard } from "@/components/attempts/check-result-card";
import { UploadSolutionBlock } from "@/components/attempts/upload-solution-block";
import { TopBar } from "@/components/navigation/top-bar";
import { TaskImageFrame } from "@/components/tasks/task-image-frame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { useSessionUser } from "@/lib/auth/use-session-user";
import { getReferenceAssets, getReferenceText } from "@/lib/utils/reference-solution";
import { getTaskImageUrls } from "@/lib/utils/task-assets";
import { taskBankItemSchema } from "@/schemas/task";
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
  strengths: z.array(z.string()),
  mistakes: z.array(z.string()),
  recommendations: z.array(z.string()),
  expertComment: z.string(),
  confidence: z.number(),
  extractedText: z.string(),
  createdAt: z.string()
});

type TaskDetails = z.infer<typeof taskBankItemSchema>;
type AICheckData = z.infer<typeof aiCheckSchema>;

export function TaskPreviewPage({ taskId }: { taskId: string }) {
  const { isAuthenticated } = useSessionUser();
  const [lastResult, setLastResult] = useState<AICheckData | null>(null);
  const [showReference, setShowReference] = useState(false);

  const query = useQuery<TaskDetails>({
    queryKey: ["task", taskId],
    queryFn: () =>
      apiClient(`/api/tasks/${taskId}`, {
        schema: taskBankItemSchema
      })
  });

  const task = query.data;
  const imageUrls = getTaskImageUrls(task?.assetsJson ?? null);
  const referenceText = getReferenceText(task?.referenceSolution);
  const referenceAssets = getReferenceAssets(task?.referenceSolution?.rubricJson);

  const submitMutation = useMutation<AICheckData, Error, { files: File[]; comment: string }>({
    mutationFn: async ({ files, comment }) => {
      if (!task) {
        throw new Error("Задание ещё не успело загрузиться.");
      }

      const variant = await apiClient("/api/variants", {
        method: "POST",
        body: {
          subjectId: task.subjectId,
          mode: "TASK_TYPE_PRACTICE",
          taskIds: [task.id],
          taskCount: 1
        },
        schema: generatedVariantSchema
      });

      const variantTask = variant.tasks[0];

      if (!variantTask) {
        throw new Error("Не удалось подготовить сессию решения для этого задания.");
      }

      const attempt = await apiClient("/api/attempts", {
        method: "POST",
        body: {
          variantTaskId: variantTask.id,
          comment
        },
        schema: z.object({
          id: z.string()
        })
      });

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

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
      setShowReference(false);
    }
  });

  return (
    <div className="pb-10">
      <TopBar title="Задание" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        {query.isLoading ? <Card>Загружаем задание...</Card> : null}

        {!query.isLoading && !task ? (
          <EmptyState title="Задание не найдено" description="Возможно, оно снято с публикации или ещё не добавлено в банк." />
        ) : null}

        {task ? (
          <>
            <Card className="bg-[#fff8ef]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    {task.taskType?.name ?? "Тип задания"} · {task.taskType?.taskNumber ? `№ ${task.taskType.taskNumber}` : "вторая часть"}
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-[#243041]">{task.title}</h1>
                </div>
                <span className="rounded-full bg-[#ead7c0] px-3 py-1 text-xs font-semibold text-[#8c5a2f]">{task.maxScore} баллов</span>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[#243041]">Условие</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{task.problemText}</p>

              {imageUrls.length ? (
                <div className="mt-4 grid gap-3">
                  {imageUrls.map((imageUrl, index) => (
                    <TaskImageFrame key={`${task.id}-preview-${index}`} src={imageUrl} alt={`${task.title} ${index + 1}`} />
                  ))}
                </div>
              ) : null}
            </Card>

            {task.criteria?.length ? (
              <Card>
                <h2 className="text-lg font-semibold text-[#243041]">Критерии проверки</h2>
                <div className="mt-4 space-y-3">
                  {task.criteria.map((criterion) => (
                    <div key={criterion.id} className="rounded-3xl bg-[#faf4ec] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-[#243041]">
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

            {isAuthenticated ? (
              <UploadSolutionBlock
                errorMessage={submitMutation.error?.message ?? null}
                onSubmit={async (input) => {
                  await submitMutation.mutateAsync(input);
                }}
              />
            ) : (
              <Card className="bg-[#1d2f2f] text-white">
                <h2 className="text-lg font-semibold">Вход нужен только для отправки решения</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Само условие уже открыто. Чтобы загрузить фото решения и отправить его на проверку, сначала пройди вход через Telegram ID на главной странице.
                </p>
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => window.history.back()}>
                    Вернуться к списку
                  </Button>
                </div>
              </Card>
            )}

            {lastResult ? (
              <>
                <CheckResultCard result={lastResult} />
                <Card className="bg-[#fff8ef]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#243041]">Эталон решения</h3>
                      <p className="mt-1 text-sm text-slate-600">Кнопка доступна только после сдачи и показывает эталон именно этого задания.</p>
                    </div>
                    <Button variant="secondary" onClick={() => setShowReference((current) => !current)}>
                      {showReference ? "Скрыть эталон" : "Посмотреть эталон решения"}
                    </Button>
                  </div>

                  {showReference ? (
                    <div className="mt-4 space-y-4">
                      {referenceText ? (
                        <div className="whitespace-pre-line rounded-3xl bg-white/90 p-4 text-sm leading-7 text-slate-700">{referenceText}</div>
                      ) : null}

                      {referenceAssets.referenceImageUrls.map((imageUrl, index) => (
                        <TaskImageFrame key={`${task.id}-reference-${index}`} src={imageUrl} alt={`Эталон ${index + 1}`} />
                      ))}
                    </div>
                  ) : null}
                </Card>
              </>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
