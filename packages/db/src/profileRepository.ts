import { eq } from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import { users } from "./schema.js";

export async function updateUserProfile(
  db: MangaFluxDatabase,
  userId: string,
  input: {
    displayName: string | null;
    avatarDataUrl: string | null;
    bio: string | null;
    showPublicActivity: boolean;
    showJoinedDate: boolean;
    notificationEmailEnabled: boolean;
    notificationQuietHoursEnabled: boolean;
    notificationQuietHoursStart: string;
    notificationQuietHoursEnd: string;
    notificationTimeZone: string;
  }
) {
  const [user] = await db
    .update(users)
    .set({
      displayName: input.displayName,
      avatarDataUrl: input.avatarDataUrl,
      bio: input.bio,
      showPublicActivity: input.showPublicActivity,
      showJoinedDate: input.showJoinedDate,
      notificationEmailEnabled: input.notificationEmailEnabled,
      notificationQuietHoursEnabled: input.notificationQuietHoursEnabled,
      notificationQuietHoursStart: input.notificationQuietHoursStart,
      notificationQuietHoursEnd: input.notificationQuietHoursEnd,
      notificationTimeZone: input.notificationTimeZone,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarDataUrl: users.avatarDataUrl,
      bio: users.bio,
      showPublicActivity: users.showPublicActivity,
      showJoinedDate: users.showJoinedDate,
      communityRestricted: users.communityRestricted,
      notificationEmailEnabled: users.notificationEmailEnabled,
      notificationQuietHoursEnabled: users.notificationQuietHoursEnabled,
      notificationQuietHoursStart: users.notificationQuietHoursStart,
      notificationQuietHoursEnd: users.notificationQuietHoursEnd,
      notificationTimeZone: users.notificationTimeZone,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt
    });

  return user ?? null;
}
