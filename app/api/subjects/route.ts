import { ok } from "@/lib/api/response";
import { getOptionalCurrentUser } from "@/lib/auth/server";
import { demoSubjects } from "@/lib/demo/content";
import { serializeSubject } from "@/lib/utils/serializers";
import { subjectService } from "@/server/services/subject.service";

export async function GET() {
  try {
    const user = await getOptionalCurrentUser();
    const subjects = user ? await subjectService.listSubjectsForUser(user.id) : await subjectService.listSubjects();

    return ok(subjects.length > 0 ? subjects.map(serializeSubject) : user ? [] : demoSubjects);
  } catch (error) {
    return ok(demoSubjects);
  }
}
