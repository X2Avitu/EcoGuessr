// Client-side session management + server sync helpers

export interface Session {
  id: string;
  username: string;
  email: string;
}

const SESSION_KEY = 'ecoguesser_session';

// ─── Session ─────────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

// ─── Server ↔ localStorage sync ───────────────────────────────────────────────

/** Called after login: copies server game data into localStorage so the game picks it up */
export function importGameDataFromServer(gameData: {
  streak?: unknown;
  collection?: unknown;
  playedToday?: unknown;
}): void {
  if (typeof window === 'undefined') return;
  if (gameData.streak) localStorage.setItem('ecoguesser_streak', JSON.stringify(gameData.streak));
  if (Array.isArray(gameData.collection)) localStorage.setItem('ecoguesser_collection', JSON.stringify(gameData.collection));
  if (gameData.playedToday !== undefined) {
    if (gameData.playedToday) {
      localStorage.setItem('ecoguesser_played_today', JSON.stringify(gameData.playedToday));
    } else {
      localStorage.removeItem('ecoguesser_played_today');
    }
  }
}

/** Called after a game round: pushes current localStorage game data up to the server */
export async function saveGameDataToServer(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const gameData = {
      streak: JSON.parse(localStorage.getItem('ecoguesser_streak') || 'null'),
      collection: JSON.parse(localStorage.getItem('ecoguesser_collection') || '[]'),
      playedToday: JSON.parse(localStorage.getItem('ecoguesser_played_today') || 'null'),
    };
    await fetch('/api/auth/save', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gameData }),
    });
  } catch {
    // Fail silently — localStorage is still the source of truth locally
  }
}
