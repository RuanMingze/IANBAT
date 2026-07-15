import { useEffect, useState } from 'react';
import { fetchLeaderboard, type LeaderboardEntry } from '../lib/supabase';
import { Trophy, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export function Leaderboard({ onBack }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft size={18} /> 返回
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Trophy className="text-amber-400" /> 排行榜
          </h1>
          <button onClick={load} className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> 刷新
          </button>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
          {error && <div className="p-4 text-rose-400 text-sm">加载失败：{error}</div>}
          {loading ? (
            <div className="p-8 text-center text-zinc-500">加载中…</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">还没有人上榜，成为第一个吧</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/60 text-zinc-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">排名</th>
                  <th className="px-4 py-3 text-left">昵称</th>
                  <th className="px-4 py-3 text-center">通过关数</th>
                  <th className="px-4 py-3 text-center">状态</th>
                  <th className="px-4 py-3 text-right">用时</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id} className={`border-t border-zinc-800 ${i < 3 ? 'bg-zinc-800/30' : ''}`}>
                    <td className="px-4 py-3">
                      {i === 0 ? <span className="text-amber-400 font-bold">1</span> :
                       i === 1 ? <span className="text-zinc-300 font-bold">2</span> :
                       i === 2 ? <span className="text-orange-400 font-bold">3</span> :
                       <span className="text-zinc-500">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.nickname}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{e.levels_passed}/20</td>
                    <td className="px-4 py-3 text-center">
                      {e.passed_all ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">通关</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 text-xs">未通关</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{e.passed_all ? fmtTime(e.total_time_ms) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
