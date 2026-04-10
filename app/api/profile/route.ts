import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeSubject, serializeUser } from "@/lib/utils/serializers";
import { userProfileSchema } from "@/schemas/profile";
import { profileService } from "@/server/services/profile.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const profile = await profileService.getProfile(user.id);

    return ok(
      userProfileSchema.parse({
        user: serializeUser(profile.user),
        selectedSubjects: profile.selectedSubjects.map(serializeSubject),
        availableSubjects: profile.availableSubjects.map(serializeSubject),
        activityDays: profile.activityDays,
        subjectStats: profile.subjectStats
      })
    );
  } catch (error) {
    return fail(error);
  }
}
