"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { useSessionUser } from "@/lib/auth/use-session-user";
import { subjectSchema } from "@/schemas/subject";
import { useAppStore } from "@/store/use-app-store";

const subjectsSchema = subjectSchema.array();

type SubjectList = z.infer<typeof subjectsSchema>;

const highlights = [
  {
    icon: BookOpen,
    title: "Вторая часть",
    description: "Выбирай конкретную тему, открывай задание и сразу загружай решение на той же странице."
  },
  {
    icon: ShieldCheck,
    title: "Проверка по критериям",
    description: "AI возвращает баллы по каждому критерию, отмечает сильные места и потери."
  },
  {
    icon: BarChart3,
    title: "Статистика",
    description: "Следи за прогрессом по предметам и быстро возвращайся к слабым темам."
  }
] as const;

export function SubjectSelectionPage() {
  const setActiveSubjectId = useAppStore((state) => state.setActiveSubjectId);
  const { authError, canAuthenticate, isAdmin, isAuthenticated, isLoading, isTelegramContext, login, telegramUserId } = useSessionUser();

  const subjectsQuery = useQuery<SubjectList>({
    queryKey: ["subjects"],
    queryFn: () =>
      apiClient("/api/subjects", {
        schema: subjectsSchema
      }),
    enabled: isAuthenticated
  });

  return (
    <div className="pb-10">
      <TopBar title={isAuthenticated ? "Главное меню" : "Вход"} />

      <main className="space-y-4 px-4 py-4">
        <Card className="overflow-hidden bg-[#173533] text-[#fff8ef]">
          <div className="relative">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#dba255]/25 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Telegram Mini App</p>
                <h1 className="mt-3 max-w-[14rem] text-3xl font-semibold leading-tight">
                  Подготовка ко второй части ЕГЭ
                </h1>
                <p className="mt-3 max-w-[20rem] text-sm leading-6 text-white/78">
                  Выбирай предмет, открывай тип задания, загружай решение и получай разбор в формате эксперта.
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-[#f6d8b4]">
                <Sparkles size={20} />
              </div>
            </div>
          </div>
        </Card>

        {!isAuthenticated ? (
          <>
            <div className="grid gap-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="bg-[#fff8ef]">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[#f0ddc2] p-3 text-[#8f633a]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#243041]">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-[#fff8ef]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Авторизация</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#243041]">Отправить Telegram ID</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                После нажатия сервер проверит, кто именно открыл Mini App, создаст пользователя и определит роль. Для твоего ID автоматически включатся права администратора.
              </p>

              <div className="mt-4 rounded-2xl border border-[#dccdbb] bg-[#f8f2ea] px-4 py-3 text-sm text-slate-700">
                {telegramUserId ? `Найден Telegram ID: ${telegramUserId}` : "Telegram ID пока не получен. Открой приложение именно внутри Telegram Mini App."}
              </div>

              {authError ? (
                <div className="mt-4 rounded-2xl border border-[#ecc0c0] bg-[#fff2f2] px-4 py-3 text-sm text-[#a34b4b]">{authError.message}</div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => login()} disabled={!canAuthenticate || isLoading}>
                  {isLoading ? "Проверяем..." : "Отправить Telegram ID"}
                </Button>
                {!isTelegramContext ? (
                  <span className="inline-flex items-center rounded-2xl border border-[#dccdbb] bg-[#f8f2ea] px-4 py-3 text-sm font-medium text-slate-600">
                    Открой эту страницу внутри Telegram
                  </span>
                ) : null}
              </div>
            </Card>
          </>
        ) : null}

        {isAuthenticated ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Предметы</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#243041]">Выбери направление</h2>
              </div>

              <Link href="/statistics">
                <Button variant="secondary">Статистика</Button>
              </Link>
            </div>

            {subjectsQuery.isLoading ? <Card>Загружаем доступные предметы...</Card> : null}

            {subjectsQuery.data?.length ? (
              <div className="grid gap-3">
                {subjectsQuery.data.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    onClick={() => setActiveSubjectId(subject.id)}
                    className="block"
                  >
                    <Card className="bg-white/92 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{subject.code.replaceAll("_", " ")}</p>
                          <h3 className="mt-1 text-lg font-semibold text-[#243041]">{subject.name}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">Темы второй части, демо-задания и быстрый переход к решению.</p>
                        </div>

                        <Button variant="secondary" className="h-10 shrink-0 px-3">
                          Открыть
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : null}

            {!subjectsQuery.isLoading && !subjectsQuery.data?.length ? (
              <EmptyState
                title="Предметы пока не появились"
                description="База предметов пока пуста. Проверь демо-банк или догрузи задания через админский раздел."
              />
            ) : null}

            {isAdmin ? (
              <Card className="bg-[#1b3245] text-[#fff8ef]">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Admin</p>
                <h2 className="mt-2 text-xl font-semibold">Добавление заданий и фотографий условий</h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Из твоего аккаунта доступно добавление заданий по выбранному предмету и типу без ручного ввода критериев и баллов.
                </p>
                <div className="mt-4">
                  <Link href="/admin/tasks">
                    <Button variant="secondary">Открыть админку</Button>
                  </Link>
                </div>
              </Card>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
