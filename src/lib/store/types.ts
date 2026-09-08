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
  /** Human-readable adapter name for diagnostics. */
  readonly kind: "json" | "supabase";
}
