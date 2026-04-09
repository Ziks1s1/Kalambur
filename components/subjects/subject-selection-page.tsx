"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import { getTelegramInitData } from "@/lib/telegram/webapp";
import { telegramAuthResponseSchema } from "@/schemas/auth";
import { subjectSchema } from "@/schemas/subject";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const subjectsSchema = subjectSchema.array();

type SubjectList = z.infer<typeof subjectsSchema>;
type AuthResponse = z.infer<typeof telegramAuthResponseSchema>;
type CurrentUser = AuthResponse["user"] | null;

const highlights = [
  { icon: BookOpen, title: "Вторая часть", description: "Один экран — один шаг, без перегруза интерфейса." },
  { icon: ShieldCheck, title: "Проверка по критериям", description: "Результат в формате, похожем на комментарий эксперта." },
  { icon: BarChart3, title: "Статистика", description: "Следи за темами, где теряешь баллы чаще всего." }
] as const;

export function SubjectSelectionPage() {
  const [authMode, setAuthMode] = useState<"telegram" | "preview">("preview");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const setActiveSubjectId = useAppStore((state) => state.setActiveSubjectId);

  const authMutation = useMutation<AuthResponse, Error, string>({
    mutationFn: (initData: string) =>
      apiClient("/api/auth/telegram", {
        method: "POST",
        body: { initData },
        schema: telegramAuthResponseSchema
      }),
    onSuccess: (result) => {
      setAuthMode("telegram");
      setCurrentUser(result.user);
      setAuthMessage("Mini App подключён: можно решать варианты, загружать фото и получать проверку.");
    },
    onError: () => {
      setAuthMode("preview");
      setCurrentUser(null);
      setAuthMessage("Открыт режим просмотра. Для отправки решений и AI-проверки открой приложение внутри Telegram.");
    }
  });

  useEffect(() => {
    const initData = getTelegramInitData();

    if (!initData) {
      setAuthMode("preview");
      setAuthMessage("Сейчас доступен просмотр предметов и заданий. Полный сценарий решения работает внутри Telegram Mini App.");
      return;
    }

    authMutation.mutate(initData);
  }, [authMutation]);

  const subjectsQuery = useQuery<SubjectList>({
    queryKey: ["subjects"],
    queryFn: () =>
      apiClient("/api/subjects", {
        schema: subjectsSchema
      })
  });

  return (
    <main className="space-y-5 px-4 py-5">
      <Card className="overflow-hidden bg-[#1d2f2f] text-white">
        <div className="relative">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#d49b5b]/20 blur-2xl" />
          <div className="absolute right-6 top-6 rounded-full border border-white/15 bg-white/10 p-3 text-[#f3d3ae]">
            <Sparkles size={20} />
          </div>

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">Kalambur EGE</p>
            <h1 className="mt-3 max-w-[14rem] text-3xl font-semibold leading-tight">Подготовка ко второй части ЕГЭ</h1>
            <p className="mt-4 max-w-[18rem] text-sm leading-6 text-white/72">
              Выбирай предмет, смотри задания, собирай вариант и отправляй решение на проверку прямо в Telegram Mini App.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="bg-[#fffaf4]">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#f0dfca] p-3 text-[#8c5a2f]">
                <Icon size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {authMessage ? (
        <Card className={authMode === "telegram" ? "bg-[#eef7f1]" : "bg-[#fff8ed]"}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">
                {authMode === "telegram" ? "Авторизация" : "Режим просмотра"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{authMessage}</p>
            </div>
            <ShieldCheck className={authMode === "telegram" ? "text-success" : "text-[#c58b49]"} size={18} />
          </div>
        </Card>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Предметы</p>
            <h2 className="mt-1 text-2xl font-semibold">Выбери направление</h2>
          </div>
          <Link href="/statistics">
            <Button variant="secondary">Статистика</Button>
          </Link>
        </div>

        {subjectsQuery.isLoading ? <Card>Загружаем доступные предметы...</Card> : null}

        {subjectsQuery.data?.length ? (
          <div className="space-y-3">
            {subjectsQuery.data.map((subject, index) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                onClick={() => setActiveSubjectId(subject.id)}
                className="block"
              >
                <Card className="bg-white/90 transition hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Предмет {index + 1}</p>
                      <h3 className="mt-2 text-xl font-semibold">{subject.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Открыть темы второй части, выбрать конкретное задание или собрать короткий вариант.
                      </p>
                    </div>
                    <Button variant="primary">Открыть</Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : null}

        {!subjectsQuery.isLoading && !subjectsQuery.data?.length ? (
          <EmptyState
            title="Предметы пока не появились"
            description="Похоже, база ещё не заполнена. Проверь seed или импорт заданий в admin-разделе."
          />
        ) : null}
      </section>

      {currentUser?.role === "ADMIN" ? (
        <Card className="bg-[#1d2f2f] text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Admin</p>
              <h2 className="mt-2 text-lg font-semibold">Панель добавления заданий</h2>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Ты вошёл как админ. Можно открыть форму и добавить задания в нужный предмет и тип.
              </p>
            </div>
            <Link href="/admin">
              <Button variant="secondary">Открыть</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </main>
  );
}
