import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeSubject } from "@/lib/utils/serializers";
import { subjectService } from "@/server/services/subject.service";

export async function GET() {
  try {
    await getCurrentUser();
    const subjects = await subjectService.listSubjects();
    return ok(subjects.map(serializeSubject));
  } catch (error) {
    return fail(error);
  }
}
