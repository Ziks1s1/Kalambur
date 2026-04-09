"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

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
    description: "Один экран — один шаг, без перегруза интерфейса."
  },
  {
    icon: ShieldCheck,
    title: "Проверка по критериям",
    description: "Результат в формате, похожем на комментарий эксперта."
  },
  {
    icon: BarChart3,
    title: "Статистика",
    description: "Следи за темами, где теряешь баллы чаще всего."
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

  if (!isAuthenticated) {
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
              <h1 className="mt-3 max-w-[14rem] text-3xl font-semibold leading-tight">Подтверди Telegram ID</h1>
              <p className="mt-4 max-w-[18rem] text-sm leading-6 text-white/72">
                Перед входом в главное меню мы сверим твой аккаунт через Telegram Mini App и определим роль пользователя.
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

        <Card className="bg-[#fff8ed]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Авторизация</p>
          <h2 className="mt-2 text-xl font-semibold">Отправить Telegram ID</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            После нажатия кнопки Mini App отправит серверу подписанные данные Telegram. Сервер проверит, кто это, и откроет
            тебе основной режим приложения.
          </p>

          <div className="mt-4 rounded-2xl border border-[#dccdbb] bg-[#f8f2ea] px-4 py-3 text-sm text-slate-600">
            {telegramUserId ? `Найден Telegram ID: ${telegramUserId}` : "Telegram ID пока не получен. Открой приложение именно внутри Mini App."}
          </div>

          {authError ? (
            <div className="mt-4 rounded-2xl border border-[#ecc0c0] bg-[#fff2f2] px-4 py-3 text-sm text-[#a34b4b]">
              {authError.message}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => login()} disabled={!canAuthenticate || isLoading}>
              {isLoading ? "Проверяем..." : "Отправить Telegram ID"}
            </Button>
            {!isTelegramContext ? (
              <span className="inline-flex items-center rounded-2xl border border-[#dccdbb] bg-[#f8f2ea] px-4 text-sm text-slate-500">
                Запусти страницу через Telegram Mini App
              </span>
            ) : null}
          </div>
        </Card>
      </main>
    );
  }

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
            <h1 className="mt-3 max-w-[14rem] text-3xl font-semibold leading-tight">Главное меню</h1>
            <p className="mt-4 max-w-[18rem] text-sm leading-6 text-white/72">
              Выбирай предмет, открывай типы второй части, решай задания и отправляй решения на проверку.
            </p>
          </div>
        </div>
      </Card>

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
            description="Похоже, база ещё не заполнена. Проверь demo-банк или импорт заданий в admin-разделе."
          />
        ) : null}
      </section>

      {isAdmin ? (
        <Card className="bg-[#1d2f2f] text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Admin</p>
              <h2 className="mt-2 text-lg font-semibold">Панель добавления заданий</h2>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Для твоего Telegram ID доступны админ-права. Можно перейти к добавлению заданий по предметам и типам.
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
