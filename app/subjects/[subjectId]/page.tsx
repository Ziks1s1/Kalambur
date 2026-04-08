import { SubjectDashboardPage } from "@/components/subjects/subject-dashboard-page";

type Props = {
  params: Promise<{ subjectId: string }>;
};

export default async function SubjectPage({ params }: Props) {
  const { subjectId } = await params;
  return <SubjectDashboardPage subjectId={subjectId} />;
}
