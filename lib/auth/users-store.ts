import "server-only";

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type StoredUser = {
  email: string;
  name: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
};

export type PasswordResetRecord = {
  email: string;
  token: string;
  expiresAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const RESETS_FILE = path.join(DATA_DIR, "password-resets.json");

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeUsers(users: StoredUser[]) {
  await ensureDataDir();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(
  email: string,
): Promise<StoredUser | undefined> {
  const norm = email.trim().toLowerCase();
  const users = await readUsers();
  return users.find((u) => u.email === norm);
}

export async function addUser(user: StoredUser): Promise<void> {
  const users = await readUsers();
  const norm = user.email.toLowerCase();
  if (users.some((u) => u.email === norm)) {
    throw new Error("EMAIL_IN_USE");
  }
  users.push({ ...user, email: norm });
  await writeUsers(users);
}

export async function updateUserPassword(
  email: string,
  passwordSalt: string,
  passwordHash: string,
): Promise<boolean> {
  const norm = email.trim().toLowerCase();
  const users = await readUsers();
  const idx = users.findIndex((u) => u.email === norm);
  if (idx < 0) return false;
  users[idx] = { ...users[idx], passwordSalt, passwordHash };
  await writeUsers(users);
  return true;
}

export async function readResets(): Promise<PasswordResetRecord[]> {
  try {
    const raw = await readFile(RESETS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeResets(records: PasswordResetRecord[]) {
  await ensureDataDir();
  await writeFile(RESETS_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function setPasswordResetToken(
  email: string,
  token: string,
  ttlMs: number,
): Promise<void> {
  const norm = email.trim().toLowerCase();
  const now = Date.now();
  const others = (await readResets()).filter((r) => r.email !== norm);
  others.push({
    email: norm,
    token,
    expiresAt: new Date(now + ttlMs).toISOString(),
  });
  await writeResets(others);
}

export async function consumePasswordResetToken(
  token: string,
): Promise<string | null> {
  const records = await readResets();
  const now = Date.now();
  const match = records.find(
    (r) => r.token === token && new Date(r.expiresAt).getTime() > now,
  );
  if (!match) return null;
  const next = records.filter((r) => r.token !== token);
  await writeResets(next);
  return match.email;
}
