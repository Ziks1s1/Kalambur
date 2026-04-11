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
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
};

export async function apiClient<TSchema extends z.ZodTypeAny>(
  url: string,
  options: RequestOptions & { schema: TSchema }
): Promise<z.infer<TSchema>> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.formData
      ? undefined
      : {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
    body: options.formData ? options.formData : options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include"
  });

  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON response from ${url}, got ${response.status} ${response.statusText}${rawText ? `: ${rawText.slice(0, 120)}` : ""}`
    );
  }

  const envelope = envelopeSchema.parse(JSON.parse(rawText));

  if (!response.ok || !envelope.success) {
    throw new Error(envelope.error?.message ?? "Request failed");
  }

  return options.schema.parse(envelope.data);
}
