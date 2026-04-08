import { z } from "zod";

const envelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional()
    })
    .optional()
});

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  formData?: FormData;
  schema: z.ZodTypeAny;
};

export async function apiClient<T>(url: string, options: RequestOptions): Promise<T> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.formData
      ? undefined
      : {
          "Content-Type": "application/json"
        },
    body: options.formData ? options.formData : options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include"
  });

  const envelope = envelopeSchema.parse(await response.json());

  if (!response.ok || !envelope.success) {
    throw new Error(envelope.error?.message ?? "Request failed");
  }

  return options.schema.parse(envelope.data) as T;
}
