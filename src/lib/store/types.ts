import type { User, UserData } from "@/domain/types";

/**
 * Persistence contract. Two adapters implement it: a local JSON store for
 * development and a Supabase/Postgres store for production. The app only ever
 * talks to this interface, so swapping backends changes nothing above.
 */
export interface Store {
  createUser(input: { email: string; passwordHash: string; displayName: string }): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  getData(userId: string): Promise<UserData>;
  saveData(userId: string, data: UserData): Promise<void>;

  /* ---- Meal photos (private, owned per user) ---- */
  putPhoto(userId: string, id: string, bytes: Buffer, mime: PhotoMime): Promise<void>;
  getPhoto(userId: string, id: string): Promise<{ bytes: Buffer; mime: PhotoMime } | null>;
  deletePhotos(userId: string, ids: string[]): Promise<void>;
  /** Every stored photo id for this user, with how long ago it was written. */
  listPhotos(userId: string): Promise<{ id: string; ageMs: number }[]>;

  /** Human-readable adapter name for diagnostics. */
  readonly kind: "json" | "supabase";
}

export type PhotoMime = "image/jpeg" | "image/webp" | "image/png";
export const PHOTO_EXT: Record<PhotoMime, string> = {
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/png": "png"
};
