import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeSubject } from "@/lib/utils/serializers";
import { updateUserSubjectsSchema } from "@/schemas/profile";
import { subjectService } from "@/server/services/subject.service";

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = updateUserSubjectsSchema.parse(await request.json());
    const subjects = await subjectService.replaceUserSubjects(user.id, body.subjectIds);
    return ok(subjects.map(serializeSubject));
  } catch (error) {
    return fail(error);
  }
}
