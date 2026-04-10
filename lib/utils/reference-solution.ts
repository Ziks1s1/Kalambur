import { getReferenceImageUrls } from "@/lib/utils/task-assets";

export function getReferenceText(referenceSolution: {
  solutionText?: string | null;
  correctAnswer?: string | null;
  notes?: string | null;
} | null | undefined) {
  if (!referenceSolution) {
    return null;
  }

  const parts = [referenceSolution.correctAnswer?.trim(), referenceSolution.solutionText?.trim(), referenceSolution.notes?.trim()].filter(
    (value): value is string => Boolean(value)
  );

  return parts.length ? parts.join("\n\n") : null;
}

export function getReferenceAssets(rubricJson: unknown) {
  return {
    referenceImageUrls: getReferenceImageUrls(rubricJson)
  };
}
