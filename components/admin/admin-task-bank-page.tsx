"use client";

import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/client";
import { buildTaskAssets, getTaskImageUrls } from "@/lib/utils/task-assets";

const subjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  isActive: z.boolean()
});

const taskTypeSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  taskNumber: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  maxScore: z.number(),
  difficulty: z.enum(["BASIC", "MEDIUM", "HARD"]),
  tags: z.array(z.string()),
  sourceStatus: z.enum(["DEMO_SEED", "VERIFIED", "IMPORTED"]),
  isActive: z.boolean()
});

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
    name: z.string(),
    taskNumber: z.number()
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

const importResultSchema = z.object({
  subjectsCreated: z.number(),
  subjectsUpdated: z.number(),
  taskTypesCreated: z.number(),
  taskTypesUpdated: z.number(),
  tasksCreated: z.number(),
  tasksUpdated: z.number()
});

type AdminSubject = z.infer<typeof subjectSchema>;
type AdminTaskType = z.infer<typeof taskTypeSchema>;
type AdminTask = z.infer<typeof taskSchema>;
type ImportResult = z.infer<typeof importResultSchema>;

type DraftState = Record<
  string,
  {
    problemText: string;
    referenceSolution: string;
    criteriaJson: string;
  }
>;

type CreateTaskForm = {
  subjectId: string;
  taskTypeId: string;
  title: string;
  problemText: string;
  maxScore: string;
  year: string;
  sourceType: string;
  criteriaJson: string;
  referenceSolution: string;
  imageUrls: string[];
};

const defaultCriteriaTemplate = JSON.stringify(
  [
    {
      code: "K1",
      title: "Понимание условия",
      description: "Условие разобрано корректно и выбран верный способ ответа.",
      maxScore: 1,
      sortOrder: 1
    },
    {
      code: "K2",
      title: "Логика решения",
      description: "Ответ развёрнут и соответствует критериям задания.",
      maxScore: 1,
      sortOrder: 2
    }
  ],
  null,
  2
);

function createDraft(task: AdminTask): DraftState[string] {
  return {
    problemText: task.problemText,
    referenceSolution: task.referenceSolution?.solutionText ?? "",
    criteriaJson: JSON.stringify(task.criteria, null, 2)
  };
}

async function readFilesAsDataUrls(files: File[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () => reject(new Error("Не удалось прочитать фото задания"));
          reader.readAsDataURL(file);
        })
    )
  );
}

export function AdminTaskBankPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<DraftState>({});
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
  const [createForm, setCreateForm] = useState<CreateTaskForm>({
    subjectId: "",
    taskTypeId: "",
    title: "",
    problemText: "",
    maxScore: "",
    year: "2025",
    sourceType: "admin_manual",
    criteriaJson: defaultCriteriaTemplate,
    referenceSolution: "",
    imageUrls: []
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const taskPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const subjectsQuery = useQuery<AdminSubject[]>({
    queryKey: ["subjects-admin-helper"],
    queryFn: () =>
      apiClient("/api/subjects", {
        schema: subjectSchema.array()
      })
  });

  const taskTypesQuery = useQuery<AdminTaskType[]>({
    queryKey: ["task-types-admin-helper", createForm.subjectId],
    queryFn: () =>
      apiClient(`/api/subjects/${createForm.subjectId}/task-types`, {
        schema: taskTypeSchema.array()
      }),
    enabled: Boolean(createForm.subjectId)
  });

  const tasksQuery = useQuery<AdminTask[]>({
    queryKey: ["admin-tasks"],
    queryFn: () =>
      apiClient("/api/admin/tasks", {
        schema: taskSchema.array()
      })
  });

  const updateMutation = useMutation<AdminTask, Error, string>({
    mutationFn: async (taskId: string) => {
      const task = tasksQuery.data?.find((item) => item.id === taskId);
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

  const createMutation = useMutation<AdminTask, Error, void>({
    mutationFn: async () => {
      if (!createForm.subjectId || !createForm.taskTypeId) {
        throw new Error("Выбери предмет и тип задания");
      }

      return apiClient("/api/admin/tasks", {
        method: "POST",
        body: {
          subjectId: createForm.subjectId,
          taskTypeId: createForm.taskTypeId,
          year: createForm.year ? Number(createForm.year) : null,
          sourceType: createForm.sourceType,
          sourceUrl: null,
          title: createForm.title,
          problemText: createForm.problemText.trim() || "См. фото условия задания.",
          assetsJson: buildTaskAssets(createForm.imageUrls),
          maxScore: Number(createForm.maxScore),
          metaJson: {
            createdFrom: "admin_mini_app"
          },
          sourceStatus: "VERIFIED",
          isPublished: true,
          criteria: JSON.parse(createForm.criteriaJson),
          referenceSolution: {
            solutionText: createForm.referenceSolution,
            notes: null,
            rubricJson: null
          }
        },
        schema: taskSchema
      });
    },
    onSuccess: () => {
      setCreateForm((current) => ({
        ...current,
        title: "",
        problemText: "",
        maxScore: "",
        referenceSolution: "",
        criteriaJson: defaultCriteriaTemplate,
        imageUrls: []
      }));
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
    }
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
      queryClient.invalidateQueries({ queryKey: ["subjects-admin-helper"] });
      queryClient.invalidateQueries({ queryKey: ["task-types-admin-helper"] });
    }
  });

  const hydratedDrafts = useMemo(() => {
    const nextDrafts: DraftState = {};

    for (const task of tasksQuery.data ?? []) {
      nextDrafts[task.id] = drafts[task.id] ?? createDraft(task);
    }

    return nextDrafts;
  }, [drafts, tasksQuery.data]);

  const selectedTaskType = taskTypesQuery.data?.find((item) => item.id === createForm.taskTypeId) ?? null;
  const filteredTasks = (tasksQuery.data ?? []).filter((task) => {
    if (!createForm.subjectId) {
      return false;
    }

    if (task.subjectId !== createForm.subjectId) {
      return false;
    }

    if (createForm.taskTypeId && task.taskTypeId !== createForm.taskTypeId) {
      return false;
    }

    return true;
  });

  return (
    <div className="pb-10">
      <TopBar title="Admin · Задания" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        <Card className="space-y-4 bg-[#fff8ef]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Быстрое добавление</p>
            <h2 className="mt-2 text-xl font-semibold">Новое задание через Mini App</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Выбери предмет, затем тип задания, добавь текст или фото условия, критерии ФИПИ и эталонное решение. После сохранения
              задание сразу попадёт в меню выбранной темы.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Предмет</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                value={createForm.subjectId}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    subjectId: event.target.value,
                    taskTypeId: ""
                  }))
                }
              >
                <option value="">Выбери предмет</option>
                {subjectsQuery.data?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium">Тип задания</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                value={createForm.taskTypeId}
                onChange={(event) => setCreateForm((current) => ({ ...current, taskTypeId: event.target.value }))}
                disabled={!createForm.subjectId}
              >
                <option value="">Выбери тип</option>
                {taskTypesQuery.data?.map((taskType) => (
                  <option key={taskType.id} value={taskType.id}>
                    №{taskType.taskNumber} · {taskType.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedTaskType ? (
            <div className="rounded-3xl bg-white/80 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                {selectedTaskType.name} · {selectedTaskType.maxScore} баллов
              </p>
              <p className="mt-2 leading-6">{selectedTaskType.description}</p>
            </div>
          ) : null}

          <Input placeholder="Название задания" value={createForm.title} onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))} />

          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Год" value={createForm.year} onChange={(event) => setCreateForm((current) => ({ ...current, year: event.target.value }))} />
            <Input
              placeholder="Макс. балл"
              value={createForm.maxScore}
              onChange={(event) => setCreateForm((current) => ({ ...current, maxScore: event.target.value }))}
            />
            <Input
              placeholder="Источник"
              value={createForm.sourceType}
              onChange={(event) => setCreateForm((current) => ({ ...current, sourceType: event.target.value }))}
            />
          </div>

          <Textarea
            placeholder="Текст задания. Можно оставить краткое описание, если основное условие будет на фото."
            value={createForm.problemText}
            onChange={(event) => setCreateForm((current) => ({ ...current, problemText: event.target.value }))}
          />

          <input
            ref={taskPhotoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);
              const imageUrls = await readFilesAsDataUrls(files);

              setCreateForm((current) => ({
                ...current,
                imageUrls
              }));
            }}
          />

          <div className="space-y-3 rounded-3xl bg-white/75 p-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => taskPhotoInputRef.current?.click()}>
                Добавить фото задания
              </Button>
              <Button type="button" variant="ghost" onClick={() => setCreateForm((current) => ({ ...current, imageUrls: [] }))} disabled={createForm.imageUrls.length === 0}>
                Очистить фото
              </Button>
            </div>

            {createForm.imageUrls.length ? (
              <div className="grid gap-3">
                {createForm.imageUrls.map((imageUrl, index) => (
                  <div key={`task-photo-${index}`} className="relative overflow-hidden rounded-3xl border border-[#e8dccf] bg-[#f8f2ea]">
                    <div className="relative aspect-[4/5] w-full">
                      <Image src={imageUrl} alt={`Фото задания ${index + 1}`} fill className="object-contain" unoptimized />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">Можно добавить одно или несколько фото условия. Пользователь будет видеть именно их.</p>
            )}
          </div>

          <Textarea
            placeholder="Критерии в JSON"
            value={createForm.criteriaJson}
            onChange={(event) => setCreateForm((current) => ({ ...current, criteriaJson: event.target.value }))}
            className="font-mono text-xs"
          />

          <Textarea
            placeholder="Эталонное решение"
            value={createForm.referenceSolution}
            onChange={(event) => setCreateForm((current) => ({ ...current, referenceSolution: event.target.value }))}
          />

          <Button fullWidth onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Сохраняем..." : "Сохранить задание"}
          </Button>
        </Card>

        <Card className="space-y-3">
          <div>
            <p className="text-sm text-slate-500">Импорт verified / imported банка</p>
            <h2 className="mt-1 text-lg font-semibold">Загрузка JSON или CSV</h2>
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
              JSON example
            </Link>
            <Link href="/examples/verified-bank.sample.csv" className="inline-flex h-11 items-center rounded-2xl bg-slate-100 px-4 text-sm font-medium">
              CSV example
            </Link>
          </div>

          {importSummary ? (
            <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-700">
              Subjects: +{importSummary.subjectsCreated} / ~{importSummary.subjectsUpdated}, Task types: +{importSummary.taskTypesCreated} / ~
              {importSummary.taskTypesUpdated}, Tasks: +{importSummary.tasksCreated} / ~{importSummary.tasksUpdated}
            </div>
          ) : null}
        </Card>

        {!createForm.subjectId ? <Card className="text-sm leading-6 text-slate-500">Выбери предмет, чтобы увидеть и редактировать только нужные задания.</Card> : null}

        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const draft = hydratedDrafts[task.id] ?? createDraft(task);
            const imageUrls: string[] = getTaskImageUrls(task.assetsJson);

            return (
              <Card key={task.id} className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">
                    {task.subject.name} · №{task.taskType.taskNumber} · {task.taskType.name}
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

                {imageUrls.length ? (
                  <div className="grid gap-3">
                    {imageUrls.map((imageUrl, index) => (
                      <div key={`${task.id}-image-${index}`} className="relative overflow-hidden rounded-3xl border border-[#e8dccf] bg-[#f8f2ea]">
                        <div className="relative aspect-[4/5] w-full">
                          <Image src={imageUrl} alt={`${task.title} ${index + 1}`} fill className="object-contain" unoptimized />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

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
        </div>
      </main>
    </div>
  );
}
