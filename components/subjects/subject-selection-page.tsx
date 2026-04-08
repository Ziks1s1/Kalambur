"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BookOpen, BarChart3, Shield } from "lucide-react";
import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client";
import { getTelegramInitData } from "@/lib/telegram/webapp";
import { subjectSchema } from "@/schemas/subject";
import { telegramAuthResponseSchema } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppStore } from "@/store/use-app-store";

const subjectsSchema = subjectSchema.array();

export function SubjectSelectionPage() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const setActiveSubjectId = useAppStore((state) => state.setActiveSubjectId);

  const authMutation = useMutation({
    mutationFn: (initData: string) =>
      apiClient("/api/auth/telegram", {
        method: "POST",
        body: { initData },
        schema: telegramAuthResponseSchema
      }),
    onSuccess: () => {
      setAuthReady(true);
    },
    onError: (error) => {
      setAuthError(error.message);
    }
  });

  useEffect(() => {
    const initData = getTelegramInitData();

    if (!initData) {
      setAuthError("Открой Mini App внутри Telegram, чтобы пройти безопасную авторизацию.");
      return;
    }

    authMutation.mutate(initData);
  }, []);

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () =>
      apiClient("/api/subjects", {
        schema: subjectsSchema
      }),
    enabled: authReady
  });

  return (
    <main className="space-y-4 px-4 py-6">
      <Card className="bg-ink text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Telegram Mini App</p>
            <h1 className="mt-2 text-2xl font-semibold">Подготовка ко второй части ЕГЭ</h1>
          </div>
          <BookOpen />
        </div>
        <p className="mt-4 text-sm text-white/75">
          Выбирай предмет, решай задания по одному, загружай фото и получай AI-проверку в формате экспертного комментария.
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-slate-500">Режим</p>
          <p className="mt-2 text-sm font-semibold">MVP</p>
        </Card>
        <Card className="p-4 text-center">
          <BarChart3 className="mx-auto text-accent" size={18} />
          <p className="mt-2 text-sm font-semibold">Статистика</p>
        </Card>
        <Card className="p-4 text-center">
          <Shield className="mx-auto text-success" size={18} />
          <p className="mt-2 text-sm font-semibold">Auth</p>
        </Card>
      </div>

      {authError ? <EmptyState title="Нужна авторизация" description={authError} /> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Предметы</h2>
          <Link href="/statistics" className="text-sm font-medium text-accent">
            Статистика
          </Link>
        </div>

        {subjectsQuery.data?.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            onClick={() => setActiveSubjectId(subject.id)}
            className="block"
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{subject.code}</p>
                  <h3 className="mt-1 text-lg font-semibold">{subject.name}</h3>
                </div>
                <Button variant="secondary">Открыть</Button>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      {subjectsQuery.isLoading ? <Card>Загружаем предметы...</Card> : null}
    </main>
  );
}
