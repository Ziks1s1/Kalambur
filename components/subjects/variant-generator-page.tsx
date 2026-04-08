"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { examTaskTypeSchema } from "@/schemas/subject";
import { createVariantSchema, generatedVariantSchema } from "@/schemas/variant";

const taskTypesSchema = examTaskTypeSchema.array();
type TaskTypes = z.infer<typeof taskTypesSchema>;
type GeneratedVariant = z.infer<typeof generatedVariantSchema>;

export function VariantGeneratorPage({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const query = useQuery<TaskTypes>({
    queryKey: ["task-types", subjectId],
    queryFn: () =>
      apiClient(`/api/subjects/${subjectId}/task-types`, {
        schema: taskTypesSchema
      })
  });

  const mutation = useMutation<GeneratedVariant, Error, z.infer<typeof createVariantSchema>>({
    mutationFn: (payload: z.infer<typeof createVariantSchema>) =>
      apiClient("/api/variants", {
        method: "POST",
        body: payload,
        schema: generatedVariantSchema
      }),
    onSuccess: (variant) => {
      router.push(`/variants/${variant.id}`);
    }
  });

  return (
    <div className="pb-10">
      <TopBar title="Генератор варианта" backHref={`/subjects/${subjectId}`} />
      <main className="space-y-3 px-4 py-4">
        {query.data?.map((taskType) => {
          const selected = selectedIds.includes(taskType.id);
          return (
            <button
              key={taskType.id}
              className={`w-full text-left ${selected ? "opacity-100" : "opacity-90"}`}
              onClick={() =>
                setSelectedIds((current) =>
                  current.includes(taskType.id) ? current.filter((item) => item !== taskType.id) : [...current, taskType.id]
                )
              }
            >
              <Card className={selected ? "border-accent" : ""}>
                <h2 className="text-lg font-semibold">{taskType.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{taskType.description}</p>
              </Card>
            </button>
          );
        })}

        <Button
          fullWidth
          onClick={() =>
            mutation.mutate({
              subjectId,
              taskTypeIds: selectedIds,
              taskCount: Math.max(1, selectedIds.length)
            })
          }
          disabled={selectedIds.length === 0 || mutation.isPending}
        >
          {mutation.isPending ? "Создаём..." : "Собрать вариант"}
        </Button>
      </main>
    </div>
  );
}
