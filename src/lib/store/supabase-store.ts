import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emptyUserData, type User, type UserData } from "@/domain/types";
import type { Store } from "./types";

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
