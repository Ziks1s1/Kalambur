import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/server";
import { parseTaskBankImportFile } from "@/lib/admin/import-parser";
import { AppError } from "@/lib/errors/app-error";
import { adminService } from "@/server/services/admin.service";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError("Import file is required", 400, "IMPORT_FILE_REQUIRED");
    }

    const payload = await parseTaskBankImportFile(file);
    const result = await adminService.importTaskBank(payload);

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
