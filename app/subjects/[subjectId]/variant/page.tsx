import { VariantGeneratorPage } from "@/components/subjects/variant-generator-page";

type Props = {
  params: Promise<{ subjectId: string }>;
};

export default async function VariantGeneratorRoute({ params }: Props) {
  const { subjectId } = await params;
  return <VariantGeneratorPage subjectId={subjectId} />;
}
