import { ok } from "@/lib/api/response";
import { demoSubjects } from "@/lib/demo/content";
import { serializeSubject } from "@/lib/utils/serializers";
import { subjectService } from "@/server/services/subject.service";

export async function GET() {
  try {
    const subjects = await subjectService.listSubjects();
    return ok(subjects.length > 0 ? subjects.map(serializeSubject) : demoSubjects);
  } catch (error) {
    return ok(demoSubjects);
  }
}
