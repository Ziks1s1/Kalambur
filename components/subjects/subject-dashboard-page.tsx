"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Layers3, Rows3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { examTaskTypeSchema } from "@/schemas/subject";

const taskTypesSchema = examTaskTypeSchema.array();

type TaskTypes = z.infer<typeof taskTypesSchema>;

export function SubjectDashboardPage({ subjectId }: { subjectId: string }) {
  const router = useRouter();

  const taskTypesQuery = useQuery<TaskTypes>({
    queryKey: ["task-types", subjectId],
    queryFn: () =>
      apiClient(`/api/subjects/${subjectId}/task-types`, {
        schema: taskTypesSchema
      })
  });

  const taskNumbers = (taskTypesQuery.data ?? []).map((taskType) => taskType.taskNumber).sort((left, right) => left - right);

  return (
    <div className="pb-28">
      <TopBar title="Предмет" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        <Card className="overflow-hidden bg-[#fff8ef]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Режимы</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#243041]">Выбери, как хочешь пройти вторую часть</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Можно пройти полный вариант второй части по заданиям 13–19 или перейти к практике по отдельным типам.
          </p>
          {taskNumbers.length ? (
            <p className="mt-3 text-sm text-slate-500">Доступные номера: {taskNumbers.join(", ")}</p>
          ) : null}
        </Card>

        <button type="button" className="w-full text-left" onClick={() => router.push(`/subjects/${subjectId}/variant?mode=full`)}>
          <Card className="bg-[#173533] text-[#fff8ef]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Режим A</p>
                <h3 className="mt-2 text-2xl font-semibold">Полный вариант второй части</h3>
                <p className="mt-3 text-sm leading-6 text-white/78">
                  По одному заданию каждого типа. Одно активное задание на экране, стрелки вперёд и назад, итоговый балл по всему варианту.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-3 text-[#f6d8b4]">
                <Rows3 size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#f6d8b4]">
              <span>Открыть режим</span>
              <ArrowRight size={16} />
            </div>
          </Card>
        </button>

        <button type="button" className="w-full text-left" onClick={() => router.push(`/subjects/${subjectId}/task-types`)}>
          <Card className="bg-[#fffdf9]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Режим B</p>
                <h3 className="mt-2 text-2xl font-semibold text-[#243041]">По типам заданий</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Выбираешь конкретный тип, открываешь задание и сразу загружаешь решение на проверку.
                </p>
              </div>
              <div className="rounded-3xl bg-[#f2dfc8] p-3 text-[#8f5e36]">
                <Layers3 size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#8f5e36]">
              <span>Открыть режим</span>
              <ArrowRight size={16} />
            </div>
          </Card>
        </button>

        {taskTypesQuery.isLoading ? <Card>Загружаем типы заданий...</Card> : null}
      </main>
    </div>
  );
}
