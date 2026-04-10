"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

function getMonthDays(referenceDate: Date) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const date = new Date(year, month, 1);
  const result: Date[] = [];

  while (date.getMonth() === month) {
    result.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return result;
}

export function ActivityCalendar({
  activityDays
}: {
  activityDays: Array<{ date: string; attemptCount: number }>;
}) {
  const today = new Date();
  const monthDays = getMonthDays(today);
  const activityMap = new Map(activityDays.map((item) => [item.date, item.attemptCount]));
  const monthLabel = today.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return (
    <Card className="bg-[#f7f0e6]">
      <p className="text-xs uppercase tracking-[0.24em] text-[#9e6f3d]">Активность</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#243041]">{monthLabel}</h2>
        <p className="text-sm text-slate-500">Зелёный день = была хотя бы одна отправка</p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {monthDays.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const count = activityMap.get(key) ?? 0;

          return (
            <div key={key} className="space-y-1 text-center">
              <div
                className={cn(
                  "flex aspect-square items-center justify-center rounded-2xl text-sm font-medium",
                  count > 0 ? "bg-[#2f7d5a] text-white" : "bg-[#e6e0d7] text-slate-500"
                )}
                title={count > 0 ? `${count} попыток` : "Нет активности"}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
