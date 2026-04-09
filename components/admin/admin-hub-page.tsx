"use client";

import Link from "next/link";
import { FilePlus2, FolderKanban, ListChecks } from "lucide-react";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sections = [
  {
    href: "/admin/tasks",
    title: "Добавить задания",
    description: "Выбирай предмет и тип, добавляй фото условия, текст и эталонный ответ. Критерии и баллы подтянутся автоматически.",
    icon: FilePlus2
  },
  {
    href: "/admin/task-types",
    title: "Типы заданий",
    description: "Проверяй каталог типов по предметам и следи, что разбаловка и названия совпадают с меню.",
    icon: FolderKanban
  },
  {
    href: "/admin/attempts",
    title: "Попытки учеников",
    description: "Смотри загруженные решения, результат AI-проверки и последние пользовательские отправки.",
    icon: ListChecks
  }
] as const;

export function AdminHubPage() {
  return (
    <div className="pb-10">
      <TopBar title="Admin" backHref="/" />

      <main className="space-y-4 px-4 py-4">
        <Card className="bg-[#1d2f2f] text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Управление банком</p>
          <h1 className="mt-2 text-2xl font-semibold">Админ-панель предметов и заданий</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Здесь можно быстро открыть добавление новых заданий, сверить каталог типов и посмотреть, как пользователи проходят проверку.
          </p>
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
      </main>
    </div>
  );
}
