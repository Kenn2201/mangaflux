import { eq } from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import { users } from "./schema.js";

export async function updateUserProfile(
  db: MangaFluxDatabase,
  userId: string,
  input: {
    displayName: string | null;
    avatarDataUrl: string | null;
  }
) {
  const [user] = await db
    .update(users)
    .set({
      displayName: input.displayName,
      avatarDataUrl: input.avatarDataUrl,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarDataUrl: users.avatarDataUrl,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt
    });

  return user ?? null;
}
