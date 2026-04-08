import { ZodError } from "zod";

import { AppError } from "@/lib/errors/app-error";

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError("Validation failed", 400, "VALIDATION_ERROR", error.flatten());
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError("Unknown error");
}
