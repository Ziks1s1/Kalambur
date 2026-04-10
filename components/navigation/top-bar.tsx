"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, FolderPlus, House, MoreHorizontal, Shield, User2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { useSessionUser } from "@/lib/auth/use-session-user";
import { cn } from "@/lib/utils/cn";
import { subjectSchema } from "@/schemas/subject";

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
  subjectStats: z.array(
    z.object({
      subjectId: z.string(),
      subjectName: z.string(),
      averageScore: z.number(),
      checkedCount: z.number().int(),
      taskTypes: z.array(
        z.object({
          taskTypeId: z.string(),
          taskTypeName: z.string(),
          taskNumber: z.number().int(),
          averageScore: z.number(),
          averageRate: z.number(),
          checkedCount: z.number().int()
        })
      )
    })
  )
});

type TopBarProps = {
  title: string;
  backHref?: string;
};

export function TopBar({ title, backHref }: TopBarProps) {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useSessionUser();
  const [open, setOpen] = useState(false);
  const [editingSubjects, setEditingSubjects] = useState(false);
  const [draftSubjectIds, setDraftSubjectIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const profileQuery = useQuery({
    queryKey: ["profile-menu"],
    queryFn: () =>
      apiClient("/api/profile", {
        schema: profileSchema
      }),
    enabled: isAuthenticated,
    retry: false
  });

  useEffect(() => {
    if (profileQuery.data) {
      setDraftSubjectIds(profileQuery.data.selectedSubjects.map((subject) => subject.id));
    }
  }, [profileQuery.data]);

  const saveSubjectsMutation = useMutation({
    mutationFn: (subjectIds: string[]) =>
      apiClient("/api/profile/subjects", {
        method: "PUT",
        body: { subjectIds },
        schema: subjectSchema.array()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-menu"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setEditingSubjects(false);
    }
  });

  const menuItems = [
    { href: "/", label: "Предметы", visible: true },
    { href: "/statistics", label: "Статистика", visible: true },
    { href: "/admin/tasks", label: "Добавить задание", visible: isAdmin },
    { href: "/admin", label: "Админка", visible: isAdmin }
  ].filter((item) => item.visible);

  const profile = profileQuery.data;
  const displayName = profile ? [profile.user.firstName, profile.user.lastName].filter(Boolean).join(" ") : "";

  return (
    <div className="sticky top-0 z-30 border-b border-white/70 bg-[rgba(251,245,237,0.94)] backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link href={backHref} className="rounded-full border border-[#d8c2a3] bg-[#f4e2c7] p-2 text-[#2c251f] shadow-sm">
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <Link href="/" className="rounded-full border border-[#d8c2a3] bg-[#f4e2c7] p-2 text-[#2c251f] shadow-sm">
              <House size={18} />
            </Link>
          )}

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#926842]">Kalambur EGE</p>
            <h1 className="text-base font-semibold text-[#1f2b3a]">{title}</h1>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={cn(
              "rounded-full border border-[#d8c2a3] p-2 text-[#2c251f] shadow-sm transition",
              open ? "bg-[#173533] text-[#fff8ef]" : "bg-[#f4e2c7]"
            )}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            {open ? <X size={18} /> : <MoreHorizontal size={18} />}
          </button>

          {open ? (
            <div className="absolute right-0 top-14 max-h-[80vh] w-80 overflow-y-auto rounded-[1.25rem] border border-[#e1d2bf] bg-[#fffaf4] p-3 shadow-[0_22px_40px_rgba(48,35,21,0.12)]">
              {profile ? (
                <div className="mb-3 rounded-3xl bg-[#f7ede1] p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#173533] p-2 text-[#fff8ef]">
                      {profile.user.role === "ADMIN" ? <Shield size={16} /> : <User2 size={16} />}
                    </div>
                    <div>
                      <p className="font-semibold text-[#243041]">{displayName || "Пользователь"}</p>
                      <p className="text-xs text-slate-500">
                        {profile.user.username ? `@${profile.user.username}` : `Telegram ID ${profile.user.telegramId}`}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#9a6f46]">
                        {profile.user.role === "ADMIN" ? "admin" : "user"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition",
                      pathname === item.href ? "bg-[#173533] text-[#fff8ef]" : "bg-[#f7ede1] text-[#243041] hover:bg-[#efdfc8]"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.href === "/statistics" ? <BarChart3 size={16} /> : null}
                    {item.href === "/admin/tasks" ? <FolderPlus size={16} /> : null}
                    {item.href === "/admin" ? <Shield size={16} /> : null}
                    {item.href === "/" ? <House size={16} /> : null}
                  </Link>
                ))}
              </div>

              {profile ? (
                <div className="mt-3 space-y-3">
                  <div className="rounded-3xl bg-[#f7ede1] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a6f46]">Предметы</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {profile.selectedSubjects.length
                            ? profile.selectedSubjects.map((subject) => subject.name).join(", ")
                            : "Пока не выбраны"}
                        </p>
                      </div>
                      <Button type="button" variant="ghost" onClick={() => setEditingSubjects((current) => !current)}>
                        {editingSubjects ? "Скрыть" : "Изменить"}
                      </Button>
                    </div>

                    {editingSubjects ? (
                      <div className="mt-3 space-y-2">
                        {profile.availableSubjects.map((subject) => {
                          const selected = draftSubjectIds.includes(subject.id);

                          return (
                            <label key={subject.id} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  setDraftSubjectIds((current) =>
                                    current.includes(subject.id)
                                      ? current.filter((item) => item !== subject.id)
                                      : [...current, subject.id]
                                  )
                                }
                              />
                              <span>{subject.name}</span>
                            </label>
                          );
                        })}

                        <Button
                          fullWidth
                          disabled={draftSubjectIds.length === 0 || saveSubjectsMutation.isPending}
                          onClick={() => saveSubjectsMutation.mutate(draftSubjectIds)}
                        >
                          {saveSubjectsMutation.isPending ? "Сохраняем..." : "Сохранить предметы"}
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-3xl bg-[#f7ede1] p-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a6f46]">Статистика по предметам</p>
                    <div className="mt-2 space-y-2">
                      {profile.subjectStats.length ? (
                        profile.subjectStats.map((subject) => (
                          <div key={subject.subjectId} className="rounded-2xl bg-white px-3 py-3 text-sm">
                            <p className="font-medium text-[#243041]">{subject.subjectName}</p>
                            <p className="mt-1 text-slate-500">
                              Проверок: {subject.checkedCount} · Средний балл: {subject.averageScore.toFixed(2)}
                            </p>
                            <div className="mt-2 space-y-1">
                              {subject.taskTypes.map((taskType) => (
                                <div key={taskType.taskTypeId} className="flex items-center justify-between gap-3 text-xs text-slate-600">
                                  <span>
                                    №{taskType.taskNumber} {taskType.taskTypeName}
                                  </span>
                                  <span>{taskType.averageScore.toFixed(2)} ср. балл</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Статистика появится после первых проверок.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
