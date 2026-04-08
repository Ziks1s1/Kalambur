"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { TopBar } from "@/components/navigation/top-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { apiClient } from "@/lib/api/client";
import { subjectStatisticsSchema, statisticsItemSchema } from "@/schemas/statistics";
import { toPercent } from "@/lib/utils/score";

const summarySchema = statisticsItemSchema.array();

export function StatisticsPage() {
  const summaryQuery = useQuery({
    queryKey: ["statistics-summary"],
    queryFn: () =>
      apiClient("/api/statistics/subjects", {
        schema: summarySchema
      })
  });

  return (
    <div className="pb-10">
      <TopBar title="Статистика" backHref="/" />
      <main className="space-y-3 px-4 py-4">
        {summaryQuery.data?.length ? null : <EmptyState title="Пока нет статистики" description="Реши хотя бы одно задание, чтобы увидеть сводку." />}
        {summaryQuery.data?.map((item) => (
          <Link key={item.subjectId} href={`/statistics?subjectId=${item.subjectId}`} className="block">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{item.subjectName}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Решено: {item.solvedCount} · Проверено: {item.checkedCount}
                  </p>
                </div>
                <Badge tone="green">{item.averageScore.toFixed(2)} ср. балл</Badge>
              </div>
              <div className="mt-4">
                <ProgressBar value={toPercent(item.completionRate)} />
              </div>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  );
}

export function SubjectStatisticsCard({ subjectId }: { subjectId: string }) {
  const query = useQuery({
    queryKey: ["statistics-detail", subjectId],
    queryFn: () =>
      apiClient(`/api/statistics/subjects/${subjectId}`, {
        schema: subjectStatisticsSchema
      })
  });

  if (!query.data) {
    return null;
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Детализация по предмету</p>
          <h2 className="text-xl font-semibold">{query.data.subjectName}</h2>
        </div>
        <Badge tone="blue">{query.data.averageScore.toFixed(2)}</Badge>
      </div>
      <ProgressBar value={toPercent(query.data.completionRate)} />
      <div className="grid gap-3">
        <div>
          <h3 className="font-semibold">Сильные темы</h3>
          <p className="mt-1 text-sm text-slate-600">{query.data.strongTopics.join(", ") || "Пока нет данных"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Слабые темы</h3>
          <p className="mt-1 text-sm text-slate-600">{query.data.weakTopics.join(", ") || "Пока нет данных"}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold">Последние попытки</h3>
        <div className="mt-3 space-y-2">
          {query.data.recentAttempts.map((attempt) => (
            <div key={attempt.attemptId} className="rounded-3xl bg-slate-50 p-3 text-sm">
              <p className="font-medium">{attempt.taskTitle}</p>
              <p className="mt-1 text-slate-500">
                {attempt.taskTypeName} · Балл: {attempt.score ?? "ещё не проверено"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
