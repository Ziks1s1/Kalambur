"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

const subjectSchema = z.object({
  id: z.string(),
  name: z.string()
});
const subjectListSchema = subjectSchema.array();
type AdminSubjectList = z.infer<typeof subjectListSchema>;

const taskTypeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  taskNumber: z.number(),
  maxScore: z.number(),
  subject: z.object({
    name: z.string()
  })
});
const taskTypeListSchema = taskTypeSchema.array();
type AdminTaskTypeList = z.infer<typeof taskTypeListSchema>;
type AdminTaskType = z.infer<typeof taskTypeSchema>;

export function AdminTaskTypePage() {
  const queryClient = useQueryClient();
  const subjectsQuery = useQuery<AdminSubjectList>({
    queryKey: ["subjects-admin-helper"],
    queryFn: () =>
      apiClient("/api/subjects", {
        schema: subjectListSchema
      })
  });
  const query = useQuery<AdminTaskTypeList>({
    queryKey: ["admin-task-types"],
    queryFn: () =>
      apiClient("/api/admin/task-types", {
        schema: taskTypeListSchema
      })
  });

  const mutation = useMutation<AdminTaskType, Error, void>({
    mutationFn: () =>
      apiClient("/api/admin/task-types", {
        method: "POST",
        body: {
          subjectId: subjectsQuery.data?.[0]?.id ?? "",
          taskNumber: 99,
          code: "demo-admin",
          name: "Demo admin type",
          description: "Created from admin panel",
          maxScore: 2,
          difficulty: "MEDIUM",
          tags: ["admin"],
          sourceStatus: "DEMO_SEED",
          isActive: true
        },
        schema: taskTypeSchema
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-task-types"] })
  });

  return (
    <div className="pb-10">
      <TopBar title="Admin · Типы" backHref="/" />
      <main className="space-y-3 px-4 py-4">
        <Card>
          <p className="text-sm text-slate-500">MVP admin action</p>
          <Button className="mt-3" fullWidth onClick={() => mutation.mutate()} disabled={!subjectsQuery.data?.length}>
            Добавить demo task type
          </Button>
        </Card>
        {query.data?.map((item) => (
          <Card key={item.id}>
            <p className="text-xs text-slate-400">{item.subject.name}</p>
            <h2 className="mt-1 text-lg font-semibold">{item.name}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {item.code} · №{item.taskNumber} · {item.maxScore} баллов
            </p>
          </Card>
        ))}
      </main>
    </div>
  );
}
