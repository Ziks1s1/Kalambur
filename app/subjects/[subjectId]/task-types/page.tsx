import { TaskTypeListPage } from "@/components/subjects/task-type-list-page";

type Props = {
  params: Promise<{ subjectId: string }>;
  searchParams: Promise<{ taskTypeId?: string }>;
};

export default async function TaskTypesPage({ params, searchParams }: Props) {
  const { subjectId } = await params;
  const { taskTypeId } = await searchParams;

  return <TaskTypeListPage subjectId={subjectId} selectedTaskTypeId={taskTypeId} />;
}
