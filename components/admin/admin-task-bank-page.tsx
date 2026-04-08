"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/client";

const criterionSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  maxScore: z.number(),
  sortOrder: z.number()
});

const taskSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  taskTypeId: z.string(),
  year: z.number().nullable(),
  sourceType: z.string(),
  sourceUrl: z.string().nullable(),
  title: z.string(),
  problemText: z.string(),
  assetsJson: z.unknown().nullable(),
  maxScore: z.number(),
  metaJson: z.unknown().nullable(),
  sourceStatus: z.enum(["DEMO_SEED", "VERIFIED", "IMPORTED"]),
  isPublished: z.boolean(),
  subject: z.object({
    name: z.string()
  }),
  taskType: z.object({
    name: z.string()
  }),
  criteria: z.array(criterionSchema),
  referenceSolution: z
    .object({
      id: z.string(),
      solutionText: z.string(),
      notes: z.string().nullable(),
      rubricJson: z.unknown().nullable()
    })
    .nullable()
});

type AdminTask = z.infer<typeof taskSchema>;

type DraftState = Record<
  string,
  {
    problemText: string;
    referenceSolution: string;
    criteriaJson: string;
  }
>;

const importResultSchema = z.object({
  subjectsCreated: z.number(),
  subjectsUpdated: z.number(),
  taskTypesCreated: z.number(),
  taskTypesUpdated: z.number(),
  tasksCreated: z.number(),
  tasksUpdated: z.number()
});
type ImportResult = z.infer<typeof importResultSchema>;

function createDraft(task: AdminTask): DraftState[string] {
  return {
    problemText: task.problemText,
    referenceSolution: task.referenceSolution?.solutionText ?? "",
    criteriaJson: JSON.stringify(task.criteria, null, 2)
  };
}

export function AdminTaskBankPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<DraftState>({});
  const [importSummary, setImportSummary] = useState<z.infer<typeof importResultSchema> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const query = useQuery<AdminTask[]>({
    queryKey: ["admin-tasks"],
    queryFn: () =>
      apiClient("/api/admin/tasks", {
        schema: taskSchema.array()
      })
  });

  const updateMutation = useMutation<AdminTask, Error, string>({
    mutationFn: async (taskId: string) => {
      const task = query.data?.find((item) => item.id === taskId);
      const draft = drafts[taskId];

      if (!task || !draft) {
        throw new Error("Task draft not found");
      }

      return apiClient(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        body: {
          subjectId: task.subjectId,
          taskTypeId: task.taskTypeId,
          year: task.year,
          sourceType: task.sourceType,
          sourceUrl: task.sourceUrl,
          title: task.title,
          problemText: draft.problemText,
          assetsJson: task.assetsJson,
          maxScore: task.maxScore,
          metaJson: task.metaJson,
          sourceStatus: task.sourceStatus,
          isPublished: task.isPublished,
          criteria: JSON.parse(draft.criteriaJson),
          referenceSolution: {
            solutionText: draft.referenceSolution,
            notes: task.referenceSolution?.notes ?? null,
            rubricJson: task.referenceSolution?.rubricJson ?? null
          }
        },
        schema: taskSchema
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
  });

  const importMutation = useMutation<ImportResult, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return apiClient("/api/admin/import", {
        method: "POST",
        formData,
        schema: importResultSchema
      });
    },
    onSuccess: (result) => {
      setImportSummary(result);
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-task-types"] });
      queryClient.invalidateQueries({ queryKey: ["subjects-admin-helper"] });
    }
  });

  const hydratedDrafts = useMemo(() => {
    const nextDrafts: DraftState = {};

    for (const task of query.data ?? []) {
      nextDrafts[task.id] = drafts[task.id] ?? createDraft(task);
    }

    return nextDrafts;
  }, [drafts, query.data]);

  return (
    <div className="pb-10">
      <TopBar title="Admin - Задания" backHref="/" />
      <main className="space-y-3 px-4 py-4">
        <Card className="space-y-3">
          <div>
            <p className="text-sm text-slate-500">Импорт verified / imported банка</p>
            <h2 className="mt-1 text-lg font-semibold">Загрузка JSON или CSV</h2>
            <p className="mt-2 text-sm text-slate-600">
              Формат поддерживает upsert по subject, task type и task bank item. Demo seed остаётся отдельно, а реальные данные помечаются как
              `VERIFIED` или `IMPORTED`.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                importMutation.mutate(file);
              }
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Импортируем..." : "Загрузить банк"}
            </Button>
            <Link href="/examples/verified-bank.sample.json" className="inline-flex h-11 items-center rounded-2xl bg-slate-100 px-4 text-sm font-medium">
              Скачать JSON example
            </Link>
            <Link href="/examples/verified-bank.sample.csv" className="inline-flex h-11 items-center rounded-2xl bg-slate-100 px-4 text-sm font-medium">
              Скачать CSV example
            </Link>
          </div>

          {importSummary ? (
            <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-700">
              Subjects: +{importSummary.subjectsCreated} / ~{importSummary.subjectsUpdated}, Task types: +{importSummary.taskTypesCreated} / ~
              {importSummary.taskTypesUpdated}, Tasks: +{importSummary.tasksCreated} / ~{importSummary.tasksUpdated}
            </div>
          ) : null}
        </Card>

        {query.data?.map((task) => {
          const draft: DraftState[string] = hydratedDrafts[task.id] ?? createDraft(task);

          return (
            <Card key={task.id} className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">
                  {task.subject.name} · {task.taskType.name}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{task.title}</h2>
              </div>

              <div>
                <p className="text-sm font-medium">Текст задания</p>
                <Textarea
                  className="mt-2"
                  value={draft.problemText}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [task.id]: {
                        ...draft,
                        problemText: event.target.value
                      }
                    }))
                  }
                />
              </div>

              <div>
                <p className="text-sm font-medium">Критерии (JSON)</p>
                <Textarea
                  className="mt-2 font-mono text-xs"
                  value={draft.criteriaJson}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [task.id]: {
                        ...draft,
                        criteriaJson: event.target.value
                      }
                    }))
                  }
                />
              </div>

              <div>
                <p className="text-sm font-medium">Эталонное решение</p>
                <Textarea
                  className="mt-2"
                  value={draft.referenceSolution}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [task.id]: {
                        ...draft,
                        referenceSolution: event.target.value
                      }
                    }))
                  }
                />
              </div>

              <Button fullWidth onClick={() => updateMutation.mutate(task.id)} disabled={updateMutation.isPending}>
                Сохранить изменения
              </Button>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
