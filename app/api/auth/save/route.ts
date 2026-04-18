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

function writeDB(data: object) {
  writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export async function PUT(request: Request) {
  try {
    const { userId, gameData } = await request.json();

    if (!userId || !gameData) {
      return NextResponse.json({ success: false, error: 'userId and gameData are required.' });
    }

    const db = readDB();
    const idx = db.users.findIndex((u: Record<string, string>) => u.id === userId);

    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'User not found.' });
    }

    db.users[idx].gameData = gameData;
    writeDB(db);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[save]', err);
    return NextResponse.json({ success: false, error: 'Server error.' });
  }
}
