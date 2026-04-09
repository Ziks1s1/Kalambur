"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

import { CheckResultCard } from "@/components/attempts/check-result-card";
import { UploadSolutionBlock } from "@/components/attempts/upload-solution-block";
import { TopBar } from "@/components/navigation/top-bar";
import { TaskDetailCard } from "@/components/tasks/task-detail-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { taskBankItemSchema } from "@/schemas/task";

const variantTaskSchema = z.object({
  id: z.string(),
  orderIndex: z.number(),
  isCompleted: z.boolean(),
  taskBankItem: taskBankItemSchema
});

const variantPageSchema = z.object({
  variant: z.object({
    id: z.string(),
    subjectId: z.string(),
    status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]),
    createdAt: z.string(),
    completedAt: z.string().nullable(),
    tasks: z.array(variantTaskSchema)
  }),
  currentTask: variantTaskSchema.nullable()
});

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

type VariantPageData = z.infer<typeof variantPageSchema>;
type AICheckData = z.infer<typeof aiCheckSchema>;

export function VariantSessionPage({ variantId }: { variantId: string }) {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<AICheckData | null>(null);

  const query = useQuery<VariantPageData>({
    queryKey: ["variant-current", variantId],
    queryFn: () =>
      apiClient(`/api/variants/${variantId}/current`, {
        schema: variantPageSchema
      })
  });

  const switchMutation = useMutation<VariantPageData, Error, string>({
    mutationFn: (variantTaskId: string) =>
      apiClient(`/api/variants/${variantId}/switch-task`, {
        method: "POST",
        body: { variantTaskId },
        schema: variantPageSchema
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["variant-current", variantId], data);
      setLastResult(null);
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ["variant-current", variantId] });
    }
  });

  const currentTask = query.data?.currentTask ?? null;
  const tasks = query.data?.variant.tasks ?? [];
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const progressValue = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="pb-10">
      <TopBar title="Вариант" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        <Card className="bg-[#fff8ef]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Навигация по варианту</p>
              <h2 className="mt-1 text-xl font-semibold">
                Выполнено {completedCount} из {tasks.length}
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {tasks.map((task) => (
                <Button
                  key={task.id}
                  variant={currentTask?.id === task.id ? "primary" : "secondary"}
                  onClick={() => switchMutation.mutate(task.id)}
                >
                  {task.orderIndex + 1}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {currentTask ? (
          <>
            <TaskDetailCard task={currentTask.taskBankItem} progressLabel="Прогресс варианта" progressValue={progressValue} />
            <UploadSolutionBlock
              onSubmit={async (input) => {
                await submitMutation.mutateAsync({
                  variantTaskId: currentTask.id,
                  files: input.files,
                  comment: input.comment
                });
              }}
            />
          </>
        ) : (
          <Card>Вариант завершён. Можно вернуться в статистику и посмотреть итог по предмету.</Card>
        )}

        {lastResult ? <CheckResultCard result={lastResult} /> : null}
      </main>
    </div>
  );
}
