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
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Задание {task.taskType?.taskNumber ?? "-"}</p>
          <h2 className="mt-1 text-lg font-semibold">{task.title}</h2>
        </div>
        <Badge tone="blue">{task.maxScore} баллов</Badge>
      </div>

      <p className="mt-4 text-sm text-slate-700 whitespace-pre-line">{task.problemText}</p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{progressLabel}</span>
          <span>{progressValue}%</span>
        </div>
        <ProgressBar value={progressValue} />
      </div>
    </Card>
  );
}
