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
  }
) {
  const [user] = await db
    .update(users)
    .set({
      displayName: input.displayName,
      avatarDataUrl: input.avatarDataUrl,
      bio: input.bio,
      showPublicActivity: input.showPublicActivity,
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
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt
    });

  return user ?? null;
}
