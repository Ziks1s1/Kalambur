"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";

import { ActivityCalendar } from "@/components/profile/activity-calendar";
import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { useSessionUser } from "@/lib/auth/use-session-user";
import { subjectSchema } from "@/schemas/subject";
import { useAppStore } from "@/store/use-app-store";

const profileSchema = z.object({
  user: z.object({
    id: z.string(),
    telegramId: z.string(),
    username: z.string().nullable(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    role: z.enum(["STUDENT", "ADMIN"])
  }),
  selectedSubjects: z.array(subjectSchema),
  availableSubjects: z.array(subjectSchema),
  activityDays: z.array(
    z.object({
      date: z.string(),
      attemptCount: z.number().int()
    })
  ),
  subjectStats: z.array(z.unknown())
});

const highlights = [
  {
    icon: BookOpen,
    title: "Вторая часть",
    description: "Выбирай предмет, открывай задание и загружай одно или несколько фото решения."
  },
  {
    icon: ShieldCheck,
    title: "Проверка по критериям",
    description: "AI сверяет решение с критериями, эталоном и выставляет баллы по конкретному заданию."
  },
  {
    icon: BarChart3,
    title: "Статистика и прогресс",
    description: "Следи за своими предметами, активностью и средними баллами по типам заданий."
  }
] as const;

export function SubjectSelectionPage() {
  const setActiveSubjectId = useAppStore((state) => state.setActiveSubjectId);
  const queryClient = useQueryClient();
  const [draftSubjectIds, setDraftSubjectIds] = useState<string[]>([]);
  const { authError, canAuthenticate, isAdmin, isAuthenticated, isLoading, isTelegramContext, login, telegramUserId } = useSessionUser();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      apiClient("/api/profile", {
        schema: profileSchema
      }),
    enabled: isAuthenticated,
    retry: false
  });

  const selectedSubjects = profileQuery.data?.selectedSubjects ?? [];
  const availableSubjects = profileQuery.data?.availableSubjects ?? [];

  useEffect(() => {
    if (selectedSubjects.length) {
      setDraftSubjectIds(selectedSubjects.map((subject) => subject.id));
    }
  }, [selectedSubjects]);

  const saveSubjectsMutation = useMutation({
    mutationFn: (subjectIds: string[]) =>
      apiClient("/api/profile/subjects", {
        method: "PUT",
        body: { subjectIds },
        schema: subjectSchema.array()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-menu"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    }
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
                <h1 className="mt-3 max-w-[14rem] text-3xl font-semibold leading-tight">Подготовка ко второй части ЕГЭ</h1>
                <p className="mt-3 max-w-[22rem] text-sm leading-6 text-white/78">
                  Выбирай свои предметы, решай задания по типам или целым вариантом и получай проверку в формате эксперта.
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
                После входа мы создадим или обновим пользователя, определим роль и покажем твоё персональное меню предметов.
              </p>

              <div className="mt-4 rounded-2xl border border-[#dccdbb] bg-[#f8f2ea] px-4 py-3 text-sm text-slate-700">
                {telegramUserId ? `Найден Telegram ID: ${telegramUserId}` : "Telegram ID пока не получен. Открой приложение внутри Telegram Mini App."}
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
            <ActivityCalendar activityDays={profileQuery.data?.activityDays ?? []} />

            {!profileQuery.isLoading && selectedSubjects.length === 0 ? (
              <Card className="bg-[#fff8ef]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Первый вход</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#243041]">Выбери предметы, которые сдаёшь</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  После сохранения главное меню будет строиться только из этих предметов. Изменить список можно потом через меню справа сверху.
                </p>

                <div className="mt-4 grid gap-2">
                  {availableSubjects.map((subject) => (
                    <label key={subject.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#243041]">
                      <input
                        type="checkbox"
                        checked={draftSubjectIds.includes(subject.id)}
                        onChange={() =>
                          setDraftSubjectIds((current) =>
                            current.includes(subject.id) ? current.filter((item) => item !== subject.id) : [...current, subject.id]
                          )
                        }
                      />
                      <span>{subject.name}</span>
                    </label>
                  ))}
                </div>

                <Button
                  className="mt-4"
                  fullWidth
                  disabled={draftSubjectIds.length === 0 || saveSubjectsMutation.isPending}
                  onClick={() => saveSubjectsMutation.mutate(draftSubjectIds)}
                >
                  {saveSubjectsMutation.isPending ? "Сохраняем..." : "Сохранить выбранные предметы"}
                </Button>
              </Card>
            ) : null}

            {profileQuery.isLoading ? <Card>Загружаем твои предметы...</Card> : null}

            {selectedSubjects.length ? (
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

                <div className="grid gap-3">
                  {selectedSubjects.map((subject) => (
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
                            <p className="mt-1 text-sm leading-6 text-slate-600">Режимы по типам заданий и полный вариант второй части.</p>
                          </div>

                          <Button variant="secondary" className="h-10 shrink-0 px-3">
                            Открыть
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}

            {!profileQuery.isLoading && !selectedSubjects.length && !availableSubjects.length ? (
              <EmptyState title="Предметы пока недоступны" description="Проверь базу предметов или загрузку демо-данных." />
            ) : null}

            {isAdmin ? (
              <Card className="bg-[#1b3245] text-[#fff8ef]">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Admin</p>
                <h2 className="mt-2 text-xl font-semibold">Управление банком заданий</h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Из твоего аккаунта доступна админка с задачами, попытками, импортом профмата и управлением администраторами.
                </p>
                <div className="mt-4">
                  <Link href="/admin">
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
