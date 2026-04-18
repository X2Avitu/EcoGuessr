import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');

function readDB() {
  if (!existsSync(USERS_FILE)) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' });
    }

    const db = readDB();
    const user = db.users.find(
      (u: Record<string, string>) =>
        u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'Incorrect email or password.' });
    }

    const { password: _pw, ...safe } = user;
    return NextResponse.json({ success: true, user: safe });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ success: false, error: 'Server error. Please try again.' });
  }
}
