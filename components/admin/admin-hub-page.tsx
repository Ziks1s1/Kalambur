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
    description: "Выбери предмет, затем тип второй части и создай карточку с условием, критериями и эталонным ответом.",
    icon: FilePlus2
  },
  {
    href: "/admin/task-types",
    title: "Типы заданий",
    description: "Проверь каталог типов по предметам и при необходимости дополни его вручную.",
    icon: FolderKanban
  },
  {
    href: "/admin/attempts",
    title: "Попытки учеников",
    description: "Смотри загрузки, результаты AI-проверки и последние пользовательские попытки.",
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
          <p className="mt-3 text-sm leading-6 text-white/72">
            Ты входишь сюда под своим Telegram-аккаунтом. Если твой ID есть в списке админов, можно выбирать предмет,
            тип задания и сразу добавлять новые карточки, которые будут появляться в основном меню приложения.
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
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
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
