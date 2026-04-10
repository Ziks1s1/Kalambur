import { VariantGeneratorPage } from "@/components/subjects/variant-generator-page";

type Props = {
  params: Promise<{ subjectId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function VariantGeneratorRoute({ params, searchParams }: Props) {
  const { subjectId } = await params;
  const { mode } = await searchParams;
  return <VariantGeneratorPage subjectId={subjectId} mode={mode === "full" ? "full" : "custom"} />;
}
