import { StatisticsPage, SubjectStatisticsCard } from "@/components/statistics/statistics-page";

type Props = {
  searchParams: Promise<{ subjectId?: string }>;
};

export default async function StatisticsRoute({ searchParams }: Props) {
  const { subjectId } = await searchParams;

  return (
    <div className="space-y-3">
      <StatisticsPage />
      {subjectId ? (
        <div className="px-4 pb-8">
          <SubjectStatisticsCard subjectId={subjectId} />
        </div>
      ) : null}
    </div>
  );
}
