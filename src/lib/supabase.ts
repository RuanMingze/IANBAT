import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  levels_passed: number;
  passed_all: boolean;
  total_time_ms: number;
  created_at: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('id, nickname, levels_passed, passed_all, total_time_ms, created_at')
    .order('levels_passed', { ascending: false })
    .order('total_time_ms', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  const entries = (data as LeaderboardEntry[]) ?? [];
  const seen = new Set<string>();
  const unique: LeaderboardEntry[] = [];

  for (const entry of entries) {
    if (!seen.has(entry.nickname)) {
      seen.add(entry.nickname);
      unique.push(entry);
    }
  }

  return unique.slice(0, 100);
}

export async function submitScore(
  nickname: string,
  levelsPassed: number,
  passedAll: boolean,
  totalTimeMs: number,
): Promise<LeaderboardEntry | null> {
  const existingCheck = await supabase
    .from('leaderboard')
    .select('id, levels_passed')
    .eq('nickname', nickname)
    .limit(1);

  if (existingCheck.error) throw existingCheck.error;

  if (existingCheck.data && existingCheck.data.length > 0) {
    const existing = existingCheck.data[0];
    if (levelsPassed <= existing.levels_passed) {
      return null;
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .update({
        levels_passed: levelsPassed,
        passed_all: passedAll,
        total_time_ms: totalTimeMs,
      })
      .eq('id', existing.id)
      .select('id, nickname, levels_passed, passed_all, total_time_ms, created_at')
      .single();
    if (error) throw error;
    return data as LeaderboardEntry;
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert({
      nickname,
      levels_passed: levelsPassed,
      passed_all: passedAll,
      total_time_ms: totalTimeMs,
    })
    .select('id, nickname, levels_passed, passed_all, total_time_ms, created_at')
    .single();
  if (error) throw error;
  return data as LeaderboardEntry;
}
