import { VariantSessionPage } from "@/components/tasks/variant-session-page";

type Props = {
  params: Promise<{ variantId: string }>;
};

export default async function VariantPage({ params }: Props) {
  const { variantId } = await params;
  return <VariantSessionPage variantId={variantId} />;
}
