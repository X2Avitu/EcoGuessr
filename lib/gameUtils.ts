import { SPECIES_DATABASE, Species } from './species';

export function getRandomPracticeSpecies(excludeIds: string[] = []): Species {
  const available = SPECIES_DATABASE.filter(s => !excludeIds.includes(s.id));
  const pool = available.length > 0 ? available : SPECIES_DATABASE;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Daily Species Selection ──────────────────────────────────────────────────
// Deterministic: same species for every player on the same calendar date

export function getDailySpecies(): Species {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % SPECIES_DATABASE.length;
  return SPECIES_DATABASE[index];
}

export function getDailySpeciesId(): string {
  return getDailySpecies().id;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

const SCORES_BY_HINTS_USED = [500, 400, 300, 200, 100];

export function calculateScore(hintsRevealed: number): number {
  const idx = Math.max(0, Math.min(hintsRevealed - 1, SCORES_BY_HINTS_USED.length - 1));
  return SCORES_BY_HINTS_USED[idx];
}

// ─── Emoji / Shareable Result ─────────────────────────────────────────────────

export function getShareableEmojis(hintsRevealed: number, correct: boolean): string {
  const total = 5;
  const boxes: string[] = [];
  for (let i = 1; i <= total; i++) {
    if (i < hintsRevealed) boxes.push('🟥'); // used hint without guessing
    else if (i === hintsRevealed) boxes.push(correct ? '🟩' : '🟥');
    else boxes.push('⬛');
  }
  return boxes.join('');
}

export function buildShareText(speciesName: string, hintsRevealed: number, correct: boolean, score: number): string {
  const emojis = getShareableEmojis(hintsRevealed, correct);
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `🌿 EcoGuesser — ${date}\n${emojis}\n${correct ? `✅ ${speciesName} (${score} pts)` : `❌ ${speciesName}`}\nPlay at ecoguesser.app`;
}

// ─── Streak & Persistence ────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string; // 'YYYY-MM-DD'
  totalCorrect: number;
  totalPlayed: number;
}

export interface CollectedSpecies {
  id: string;
  dateCollected: string;
  hintsUsed: number;
  score: number;
}

const STREAK_KEY = 'ecoguesser_streak';
const COLLECTION_KEY = 'ecoguesser_collection';
const PLAYED_TODAY_KEY = 'ecoguesser_played_today';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') return { currentStreak: 0, longestStreak: 0, lastPlayedDate: '', totalCorrect: 0, totalPlayed: 0 };
  const raw = localStorage.getItem(STREAK_KEY);
  if (!raw) return { currentStreak: 0, longestStreak: 0, lastPlayedDate: '', totalCorrect: 0, totalPlayed: 0 };
  return JSON.parse(raw) as StreakData;
}

export function saveStreakData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function recordGameResult(correct: boolean, hintsUsed: number, score: number, speciesId: string): void {
  if (typeof window === 'undefined') return;
  const today = todayString();
  const streak = getStreakData();

  streak.totalPlayed += 1;
  if (correct) streak.totalCorrect += 1;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (correct) {
    if (streak.lastPlayedDate === yStr || streak.lastPlayedDate === '') {
      streak.currentStreak += 1;
    } else if (streak.lastPlayedDate !== today) {
      streak.currentStreak = 1;
    }
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  } else {
    if (streak.lastPlayedDate !== today) streak.currentStreak = 0;
  }
  streak.lastPlayedDate = today;
  saveStreakData(streak);

  if (correct) addToCollection({ id: speciesId, dateCollected: today, hintsUsed, score });

  localStorage.setItem(PLAYED_TODAY_KEY, JSON.stringify({ date: today, correct, score, speciesId }));
}

export function hasPlayedToday(): { played: boolean; correct?: boolean; score?: number; speciesId?: string } {
  if (typeof window === 'undefined') return { played: false };
  const raw = localStorage.getItem(PLAYED_TODAY_KEY);
  if (!raw) return { played: false };
  const data = JSON.parse(raw);
  if (data.date !== todayString()) return { played: false };
  return { played: true, correct: data.correct, score: data.score, speciesId: data.speciesId };
}

// ─── Collection ──────────────────────────────────────────────────────────────

export function getCollection(): CollectedSpecies[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(COLLECTION_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as CollectedSpecies[];
}

export function addToCollection(entry: CollectedSpecies): void {
  if (typeof window === 'undefined') return;
  const col = getCollection();
  if (!col.find(e => e.id === entry.id)) {
    col.push(entry);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(col));
  }
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export function computeEarnedBadges(collection: CollectedSpecies[]): Badge[] {
  const badges: Badge[] = [];
  const ids = collection.map(c => c.id);
  const count = ids.length;

  const animalIds = ['axolotl','kakapo','saola','snow-leopard','pangolin','blue-footed-booby','narwhal','okapi','mantis-shrimp','glass-frog','dumbo-octopus'];
  const plantIds = ['victoria-amazonica','rafflesia','dragon-blood-tree','welwitschia','corpse-flower','ghost-orchid'];
  const fungiIds = ['fly-agaric','zombie-fungus','bleeding-tooth-fungus'];

  const animals = ids.filter(id => animalIds.includes(id)).length;
  const plants = ids.filter(id => plantIds.includes(id)).length;
  const fungi = ids.filter(id => fungiIds.includes(id)).length;

  if (count >= 1) badges.push({ id: 'first', emoji: '🌱', title: 'First Discovery', description: 'Identified your first species.' });
  if (count >= 5) badges.push({ id: 'explorer', emoji: '🔭', title: 'Field Explorer', description: 'Identified 5 species.' });
  if (count >= 10) badges.push({ id: 'naturalist', emoji: '🌍', title: 'Naturalist', description: 'Identified 10 species.' });
  if (count >= 20) badges.push({ id: 'master', emoji: '🏆', title: 'EcoMaster', description: 'Identified all 20 species!' });
  if (animals >= 3) badges.push({ id: 'zoologist', emoji: '🦁', title: 'Zoologist', description: 'Identified 3 animal species.' });
  if (plants >= 3) badges.push({ id: 'botanist', emoji: '🌿', title: 'Botanist', description: 'Identified 3 plant species.' });
  if (fungi >= 2) badges.push({ id: 'mycologist', emoji: '🍄', title: 'Mycologist', description: 'Identified 2 fungi species.' });

  const crSpecies = ['axolotl','kakapo','saola'];
  if (crSpecies.some(id => ids.includes(id))) badges.push({ id: 'guardian', emoji: '🛡️', title: 'Rainforest Guardian', description: 'Identified a Critically Endangered species.' });

  const perfectGames = collection.filter(c => c.hintsUsed === 1);
  if (perfectGames.length >= 1) badges.push({ id: 'perfect', emoji: '⚡', title: 'Perfect Eye', description: 'Guessed a species on the very first hint!' });

  return badges;
}
