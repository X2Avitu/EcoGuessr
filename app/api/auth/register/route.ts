import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = join(process.cwd(), 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');

function readDB() {
  if (!existsSync(USERS_FILE)) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
}

function writeDB(data: object) {
  writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' });
    }
    if (username.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Username must be at least 3 characters.' });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const db = readDB();

    if (db.users.find((u: Record<string, string>) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Email is already registered.' });
    }
    if (db.users.find((u: Record<string, string>) => u.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Username is already taken.' });
    }

    const newUser = {
      id: randomUUID(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password, // local-only: no hashing needed for local JSON
      createdAt: new Date().toISOString(),
      gameData: {
        streak: null,
        collection: [],
        playedToday: null,
      },
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _pw, ...safe } = newUser;
    return NextResponse.json({ success: true, user: safe });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ success: false, error: 'Server error. Please try again.' });
  }
}
