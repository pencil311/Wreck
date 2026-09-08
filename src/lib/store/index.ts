import "server-only";
import { JsonStore } from "./json-store";
import { SupabaseStore } from "./supabase-store";
import type { Store } from "./types";

/**
 * Choose the persistence adapter at runtime. If Supabase env vars are present
 * we use Postgres; otherwise we fall back to durable local JSON for dev. This
 * keeps the app fully runnable with zero external services while staying
 * production-ready.
 */
let singleton: Store | null = null;

export function getStore(): Store {
  if (singleton) return singleton;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    singleton = new SupabaseStore(url, serviceKey);
  } else {
    singleton = new JsonStore();
  }
  return singleton;
}

export type { Store } from "./types";
