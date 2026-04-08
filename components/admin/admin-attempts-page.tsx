"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

const attemptSchema = z.object({
  id: z.string(),
  status: z.string(),
  user: z.object({
    firstName: z.string(),
    telegramId: z.string()
  }),
  aiCheck: z
    .object({
      totalScore: z.number()
    })
    .nullable(),
  variantTask: z.object({
    taskBankItem: z.object({
      title: z.string(),
      subject: z.object({
        name: z.string()
      })
    })
  })
});

type AdminAttempt = z.infer<typeof attemptSchema>;

export function AdminAttemptsPage() {
  const query = useQuery<AdminAttempt[]>({
    queryKey: ["admin-attempts"],
    queryFn: () =>
      apiClient("/api/admin/attempts", {
        schema: attemptSchema.array()
      })
  });

  return (
    <div className="pb-10">
      <TopBar title="Admin · Попытки" backHref="/" />
      <main className="space-y-3 px-4 py-4">
        {query.data?.map((attempt) => (
          <Card key={attempt.id}>
            <p className="text-xs text-slate-400">{attempt.variantTask.taskBankItem.subject.name}</p>
            <h2 className="mt-1 text-lg font-semibold">{attempt.variantTask.taskBankItem.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {attempt.user.firstName} · {attempt.status} · Балл: {attempt.aiCheck?.totalScore ?? "ещё нет"}
            </p>
          </Card>
        ))}
      </main>
    </div>
  );
}
