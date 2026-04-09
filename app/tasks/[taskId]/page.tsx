import { TaskPreviewPage } from "@/components/tasks/task-preview-page";

type Props = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskPage({ params }: Props) {
  const { taskId } = await params;
  return <TaskPreviewPage taskId={taskId} />;
}
