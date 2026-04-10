"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, FolderKanban, ListChecks, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";

const adminUserSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  username: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  role: z.enum(["STUDENT", "ADMIN"])
});

const sections = [
  {
    href: "/admin/tasks",
    title: "Добавить задания",
    description: "Выбирай предмет и тип, добавляй фото условия, текст и эталонный ответ.",
    icon: FilePlus2
  },
  {
    href: "/admin/task-types",
    title: "Типы заданий",
    description: "Проверяй каталог типов по предметам и следи за баллами и названиями.",
    icon: FolderKanban
  },
  {
    href: "/admin/attempts",
    title: "Попытки учеников",
    description: "Смотри загруженные решения, результаты AI-проверки и последние отправки.",
    icon: ListChecks
  }
] as const;

export function AdminHubPage() {
  const [telegramId, setTelegramId] = useState("");
  const queryClient = useQueryClient();

  const adminsQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () =>
      apiClient("/api/admin/admins", {
        schema: adminUserSchema.array()
      })
  });

  const addAdminMutation = useMutation({
    mutationFn: (value: string) =>
      apiClient("/api/admin/admins", {
        method: "POST",
        body: { telegramId: value },
        schema: adminUserSchema
      }),
    onSuccess: () => {
      setTelegramId("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  const revokeAdminMutation = useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/api/admin/admins/${userId}`, {
        method: "DELETE",
        schema: adminUserSchema
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  const importMutation = useMutation({
    mutationFn: () =>
      apiClient("/api/admin/import/math-profile", {
        method: "POST",
        schema: z.object({
          success: z.boolean()
        })
      })
  });

  return (
    <div className="pb-10">
      <TopBar title="Admin" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        <Card className="bg-[#1d2f2f] text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Управление банком</p>
          <h1 className="mt-2 text-2xl font-semibold">Админ-панель предметов и заданий</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Здесь можно быстро открыть добавление новых заданий, сверить каталог типов, посмотреть попытки и управлять администраторами.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
            {importMutation.isPending ? "Импортируем..." : "Импортировать профмат 13–19"}
          </Button>
        </Card>

        <div className="space-y-3">
          {sections.map(({ href, title, description, icon: Icon }) => (
            <Link key={href} href={href} className="block">
              <Card className="bg-white/92 transition hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[#f0dfca] p-3 text-[#8c5a2f]">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-[#243041]">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                    <div className="mt-4">
                      <Button variant="secondary">Открыть</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="bg-[#fff8ef]">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#f0dfca] p-3 text-[#8c5a2f]">
              <Shield size={18} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#243041]">Администраторы</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Добавляй новых админов по Telegram ID и при необходимости снимай права.</p>

              <div className="mt-4 flex gap-2">
                <Input value={telegramId} onChange={(event) => setTelegramId(event.target.value)} placeholder="Telegram ID" />
                <Button onClick={() => addAdminMutation.mutate(telegramId)} disabled={!telegramId || addAdminMutation.isPending}>
                  Добавить
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {adminsQuery.data?.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-[#243041]">{[admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.telegramId}</p>
                      <p className="text-slate-500">
                        ID: {admin.telegramId}
                        {admin.username ? ` · @${admin.username}` : ""}
                      </p>
                    </div>
                    <Button variant="ghost" onClick={() => revokeAdminMutation.mutate(admin.id)} disabled={revokeAdminMutation.isPending}>
                      Разжаловать
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
