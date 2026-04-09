import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getTaskImageUrls } from "@/lib/utils/task-assets";
import type { TaskBankItemDto } from "@/schemas/task";

export function TaskDetailCard({
  task,
  progressLabel,
  progressValue
}: {
  task: TaskBankItemDto;
  progressLabel: string;
  progressValue: number;
}) {
  const imageUrls = getTaskImageUrls(task.assetsJson);

  return (
    <Card className="bg-[#fffdf9]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Задание {task.taskType?.taskNumber ?? "-"}</p>
          <h2 className="mt-2 text-xl font-semibold">{task.title}</h2>
        </div>
        <Badge tone="blue">{task.maxScore} баллов</Badge>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{task.problemText}</p>

      {imageUrls.length ? (
        <div className="mt-4 grid gap-3">
          {imageUrls.map((imageUrl, index) => (
            <div key={`${task.id}-detail-${index}`} className="relative overflow-hidden rounded-3xl border border-[#e8dccf] bg-[#f8f2ea]">
              <div className="relative aspect-[4/5] w-full">
                <Image src={imageUrl} alt={`${task.title} ${index + 1}`} fill className="object-contain" unoptimized />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{progressLabel}</span>
          <span>{progressValue}%</span>
        </div>
        <ProgressBar value={progressValue} />
      </div>
    </Card>
  );
}
