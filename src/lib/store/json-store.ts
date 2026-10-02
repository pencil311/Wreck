import { promises as fs } from "node:fs";
import path from "node:path";
import { emptyUserData, type User, type UserData } from "@/domain/types";
import { PHOTO_EXT, type PhotoMime, type Store } from "./types";

/**
 * Local JSON persistence for development. Real, durable persistence with zero
 * native dependencies — appropriate for local dev and demos. Production uses
 * the Supabase adapter (see supabase-store.ts). User data is written under
 * .data/ which is git-ignored.
 */

const ROOT = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(ROOT, "users.json");
const DATA_DIR = path.join(ROOT, "data");

// A tiny in-process write queue so concurrent requests don't clobber the file.
let chain: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]", "utf8");
  }
}

async function readUsers(): Promise<User[]> {
  await ensure();
  const raw = await fs.readFile(USERS_FILE, "utf8");
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function dataFile(userId: string) {
  return path.join(DATA_DIR, `${userId}.json`);
}

export class JsonStore implements Store {
  readonly kind = "json" as const;

  createUser(input: { email: string; passwordHash: string; displayName: string }): Promise<User> {
    return serialize(async () => {
      const users = await readUsers();
      const email = input.email.toLowerCase().trim();
      if (users.some((u) => u.email === email)) {
        throw new Error("EMAIL_TAKEN");
      }
      const user: User = {
        id: `usr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        email,
        passwordHash: input.passwordHash,
        displayName: input.displayName.trim() || email.split("@")[0],
        createdAt: new Date().toISOString()
      };
      users.push(user);
      await writeUsers(users);
      await fs.writeFile(dataFile(user.id), JSON.stringify(emptyUserData(), null, 2), "utf8");
      return user;
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await readUsers();
    return users.find((u) => u.email === email.toLowerCase().trim()) ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await readUsers();
    return users.find((u) => u.id === id) ?? null;
  }

  async getData(userId: string): Promise<UserData> {
    await ensure();
    try {
      const raw = await fs.readFile(dataFile(userId), "utf8");
      const parsed = JSON.parse(raw) as UserData;
      // Merge with defaults so older records gain new fields safely.
      return { ...emptyUserData(), ...parsed, settings: { ...emptyUserData().settings, ...parsed.settings } };
    } catch {
      return emptyUserData();
    }
  }

  saveData(userId: string, data: UserData): Promise<void> {
    return serialize(async () => {
      await ensure();
      await fs.writeFile(dataFile(userId), JSON.stringify(data, null, 2), "utf8");
    });
  }

  /* ---- Meal photos: files under .data/photos/<userId>/<id>.<ext> ---- */

  async putPhoto(userId: string, id: string, bytes: Buffer, mime: PhotoMime): Promise<void> {
    const dir = photoDir(userId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${id}.${PHOTO_EXT[mime]}`), bytes);
  }

  async getPhoto(userId: string, id: string): Promise<{ bytes: Buffer; mime: PhotoMime } | null> {
    const dir = photoDir(userId);
    for (const mime of ["image/jpeg", "image/webp", "image/png"] as PhotoMime[]) {
      try {
        const bytes = await fs.readFile(path.join(dir, `${id}.${PHOTO_EXT[mime]}`));
        return { bytes, mime };
      } catch {
        /* try next extension */
      }
    }
    return null;
  }

  async deletePhotos(userId: string, ids: string[]): Promise<void> {
    const dir = photoDir(userId);
    await Promise.all(
      ids.flatMap((id) =>
        Object.values(PHOTO_EXT).map((ext) =>
          fs.rm(path.join(dir, `${id}.${ext}`), { force: true })
        )
      )
    );
  }

  async listPhotos(userId: string): Promise<{ id: string; ageMs: number }[]> {
    const dir = photoDir(userId);
    let names: string[];
    try {
      names = await fs.readdir(dir);
    } catch {
      return [];
    }
    const now = Date.now();
    const out: { id: string; ageMs: number }[] = [];
    for (const name of names) {
      const id = name.replace(/\.(jpg|webp|png)$/, "");
      if (id === name) continue; // not a photo file
      try {
        const st = await fs.stat(path.join(dir, name));
        out.push({ id, ageMs: now - st.mtimeMs });
      } catch {
        /* skip */
      }
    }
    return out;
  }
}

function photoDir(userId: string) {
  // userId is our own generated id, but keep it to a single path segment anyway.
  return path.join(ROOT, "photos", userId.replace(/[^a-zA-Z0-9_-]/g, ""));
}
