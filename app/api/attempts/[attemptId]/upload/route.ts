import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeAttemptFile } from "@/lib/utils/serializers";
import { attemptService } from "@/server/services/attempt.service";
import { uploadService } from "@/server/services/upload.service";

type Params = {
  params: Promise<{ attemptId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { attemptId } = await params;
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);
    const uploaded = await uploadService.uploadAttemptFiles(files, `attempts/${attemptId}`);
    const attempt = await attemptService.attachFiles(attemptId, user.id, uploaded);

    return ok({
      files: attempt.files.map(serializeAttemptFile)
    });
  } catch (error) {
    return fail(error);
  }
}
