import { AppError } from "@/lib/errors/app-error";
import { parseCsv } from "@/lib/utils/csv";
import { importTaskBankSchema, type ImportTaskBankInput } from "@/schemas/admin";

function getCell(row: Record<string, string>, key: string) {
  return row[key] ?? "";
}

function parseNullableNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalJson(value: string) {
  if (!value) {
    return null;
  }

  return JSON.parse(value);
}

export function parseImportJson(text: string): ImportTaskBankInput {
  return importTaskBankSchema.parse(JSON.parse(text));
}

export function parseImportCsv(text: string): ImportTaskBankInput {
  const rows = parseCsv(text);

  const payload = {
    formatVersion: 1 as const,
    tasks: rows.map((row) => ({
      subjectCode: getCell(row, "subjectCode"),
      subjectName: getCell(row, "subjectName"),
      taskTypeCode: getCell(row, "taskTypeCode"),
      taskNumber: Number(getCell(row, "taskNumber")),
      taskTypeName: getCell(row, "taskTypeName"),
      taskTypeDescription: getCell(row, "taskTypeDescription"),
      taskTypeMaxScore: Number(getCell(row, "taskTypeMaxScore")),
      taskDifficulty: getCell(row, "taskDifficulty"),
      tags: getCell(row, "tags")
        ? getCell(row, "tags")
            .split("|")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      sourceStatus: getCell(row, "sourceStatus") || "VERIFIED",
      year: parseNullableNumber(getCell(row, "year")),
      sourceType: getCell(row, "sourceType") || "verified_import",
      sourceUrl: getCell(row, "sourceUrl") || null,
      title: getCell(row, "title"),
      problemText: getCell(row, "problemText"),
      assetsJson: parseOptionalJson(getCell(row, "assetsJson")),
      maxScore: Number(getCell(row, "maxScore")),
      metaJson: parseOptionalJson(getCell(row, "metaJson")),
      isPublished: getCell(row, "isPublished") ? getCell(row, "isPublished").toLowerCase() === "true" : true,
      criteria: JSON.parse(getCell(row, "criteriaJson")),
      referenceSolution: {
        solutionText: getCell(row, "referenceSolutionText"),
        notes: getCell(row, "referenceNotes") || null,
        rubricJson: parseOptionalJson(getCell(row, "rubricJson"))
      }
    }))
  };

  return importTaskBankSchema.parse(payload);
}

export async function parseTaskBankImportFile(file: File): Promise<ImportTaskBankInput> {
  const text = await file.text();
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith(".json")) {
      return parseImportJson(text);
    }

    if (fileName.endsWith(".csv")) {
      return parseImportCsv(text);
    }
  } catch (error) {
    throw new AppError("Import file validation failed", 400, "IMPORT_VALIDATION_FAILED", error);
  }

  throw new AppError("Only .json and .csv import files are supported", 400, "IMPORT_FILE_TYPE_INVALID");
}
