import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
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
