import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { toPercent } from "@/lib/utils/score";

type CheckResult = {
  totalScore: number;
  maxScore: number;
  criterionBreakdown: Array<{
    criterionCode: string;
    criterionTitle: string;
    awardedScore: number;
    maxScore: number;
    comment: string;
  }>;
  strengths: string[];
  mistakes: string[];
  recommendations: string[];
  expertComment: string;
  confidence: number;
};

export function CheckResultCard({ result }: { result: CheckResult }) {
  return (
    <Card className="space-y-4 bg-[#fffdf9]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Результат проверки</p>
          <h3 className="text-3xl font-semibold">
            {result.totalScore} / {result.maxScore}
          </h3>
        </div>
        <Badge tone="green">Уверенность {toPercent(result.confidence)}%</Badge>
      </div>

      <ProgressBar value={toPercent(result.totalScore / Math.max(result.maxScore, 1))} />

      <div className="space-y-3">
        {result.criterionBreakdown.map((criterion) => (
          <div key={criterion.criterionCode} className="rounded-3xl bg-[#faf4ec] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">
                {criterion.criterionCode}. {criterion.criterionTitle}
              </p>
              <span className="text-sm text-slate-500">
                {criterion.awardedScore}/{criterion.maxScore}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{criterion.comment}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-semibold">Комментарий эксперта</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">{result.expertComment}</p>
      </div>

      <div className="grid gap-3">
        <div>
          <h4 className="font-semibold">Сильные стороны</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{result.strengths.join(", ") || "Пока нет данных"}</p>
        </div>
        <div>
          <h4 className="font-semibold">Ошибки</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{result.mistakes.join(", ") || "Пока нет данных"}</p>
        </div>
        <div>
          <h4 className="font-semibold">Рекомендации</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{result.recommendations.join(", ") || "Пока нет данных"}</p>
        </div>
      </div>
    </Card>
  );
}
