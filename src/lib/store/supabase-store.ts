import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emptyUserData, type User, type UserData } from "@/domain/types";
import { PHOTO_EXT, type PhotoMime, type Store } from "./types";

const PHOTO_BUCKET = "food-photos";

/**
 * Production persistence via Supabase/Postgres.
 *
 * Expected schema (see supabase/schema.sql):
 *   users(id uuid pk, email text unique, password_hash text,
 *         display_name text, created_at timestamptz)
 *   user_data(user_id uuid pk references users(id), data jsonb)
 *
 * This adapter uses the service role key and therefore must only ever be
 * constructed on the server. Row Level Security guards direct client access;
 * all app reads/writes go through server code using this adapter.
 */
export class SupabaseStore implements Store {
  readonly kind = "supabase" as const;
  private client: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  async createUser(input: { email: string; passwordHash: string; displayName: string }): Promise<User> {
    const email = input.email.toLowerCase().trim();
    const existing = await this.getUserByEmail(email);
    if (existing) throw new Error("EMAIL_TAKEN");

    const { data, error } = await this.client
      .from("users")
      .insert({
        email,
        password_hash: input.passwordHash,
        display_name: input.displayName.trim() || email.split("@")[0]
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "INSERT_FAILED");

    const user = rowToUser(data);
    await this.client.from("user_data").insert({ user_id: user.id, data: emptyUserData() });
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data } = await this.client
      .from("users")
      .select()
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    return data ? rowToUser(data) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data } = await this.client.from("users").select().eq("id", id).maybeSingle();
    return data ? rowToUser(data) : null;
  }

  async getData(userId: string): Promise<UserData> {
    const { data } = await this.client
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    const stored = (data?.data as UserData) ?? emptyUserData();
    return { ...emptyUserData(), ...stored, settings: { ...emptyUserData().settings, ...stored.settings } };
  }

  async saveData(userId: string, data: UserData): Promise<void> {
    const { error } = await this.client
      .from("user_data")
      .upsert({ user_id: userId, data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
  }

  /* ---- Meal photos: private bucket food-photos, path <userId>/<id>.<ext> ---- */

  async putPhoto(userId: string, id: string, bytes: Buffer, mime: PhotoMime): Promise<void> {
    const { error } = await this.client.storage
      .from(PHOTO_BUCKET)
      .upload(`${userId}/${id}.${PHOTO_EXT[mime]}`, bytes, { contentType: mime, upsert: true });
    if (error) throw new Error(error.message);
  }

  async getPhoto(userId: string, id: string): Promise<{ bytes: Buffer; mime: PhotoMime } | null> {
    for (const mime of ["image/jpeg", "image/webp", "image/png"] as PhotoMime[]) {
      const { data } = await this.client.storage
        .from(PHOTO_BUCKET)
        .download(`${userId}/${id}.${PHOTO_EXT[mime]}`);
      if (data) {
        const bytes = Buffer.from(await data.arrayBuffer());
        return { bytes, mime };
      }
    }
    return null;
  }

  async deletePhotos(userId: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const paths = ids.flatMap((id) =>
      Object.values(PHOTO_EXT).map((ext) => `${userId}/${id}.${ext}`)
    );
    await this.client.storage.from(PHOTO_BUCKET).remove(paths);
  }

  async listPhotos(userId: string): Promise<{ id: string; ageMs: number }[]> {
    const { data } = await this.client.storage.from(PHOTO_BUCKET).list(userId, { limit: 1000 });
    if (!data) return [];
    const now = Date.now();
    return data
      .map((f) => {
        const id = f.name.replace(/\.(jpg|webp|png)$/, "");
        if (id === f.name) return null;
        const ts = f.updated_at ?? f.created_at;
        return { id, ageMs: ts ? now - new Date(ts).getTime() : 0 };
      })
      .filter((x): x is { id: string; ageMs: number } => x !== null);
  }
}

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    displayName: String(row.display_name ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}
