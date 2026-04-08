import { AppError } from "@/lib/errors/app-error";
import { parseCsv } from "@/lib/utils/csv";
import { importTaskBankSchema, type ImportTaskBankInput } from "@/schemas/admin";

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
      subjectCode: row.subjectCode,
      subjectName: row.subjectName,
      taskTypeCode: row.taskTypeCode,
      taskNumber: Number(row.taskNumber),
      taskTypeName: row.taskTypeName,
      taskTypeDescription: row.taskTypeDescription,
      taskTypeMaxScore: Number(row.taskTypeMaxScore),
      taskDifficulty: row.taskDifficulty,
      tags: row.tags ? row.tags.split("|").map((item) => item.trim()).filter(Boolean) : [],
      sourceStatus: row.sourceStatus || "VERIFIED",
      year: parseNullableNumber(row.year),
      sourceType: row.sourceType || "verified_import",
      sourceUrl: row.sourceUrl || null,
      title: row.title,
      problemText: row.problemText,
      assetsJson: parseOptionalJson(row.assetsJson),
      maxScore: Number(row.maxScore),
      metaJson: parseOptionalJson(row.metaJson),
      isPublished: row.isPublished ? row.isPublished.toLowerCase() === "true" : true,
      criteria: JSON.parse(row.criteriaJson),
      referenceSolution: {
        solutionText: row.referenceSolutionText,
        notes: row.referenceNotes || null,
        rubricJson: parseOptionalJson(row.rubricJson)
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
