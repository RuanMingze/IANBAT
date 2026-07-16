import { useEffect, useState } from 'react';
import { ShieldCheck, Brain, Flame, ArrowRight, X, Trophy, User, RefreshCw, Code, Zap, Lock } from 'lucide-react';
import { CHALLENGES } from './challenges/registry';
import { TOTAL_LEVELS, type ChallengeContext } from './challenges/types';
import { VictoryScreen } from './components/VictoryScreen';
import { Leaderboard } from './components/Leaderboard';
import { submitScore } from './lib/supabase';

type Screen = 'home' | 'playing' | 'victory' | 'leaderboard' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [level, setLevel] = useState(0);
  const [nickname, setNickname] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);

  const startGame = () => {
    const name = nameInput.trim() || '匿名挑战者';
    setNickname(name);
    setLevel(0);
    setStartTime(performance.now());
    setSuccessCount(0);
    setFailCount(0);
    setScreen('playing');
  };

  const handlePass = () => {
    const next = level + 1;
    setSuccessCount((c) => c + 1);
    if (next >= TOTAL_LEVELS) {
      const total = performance.now() - startTime;
      setSubmitting(true);
      setSubmitError('');
      submitScore(nickname, successCount + 1, successCount + 1 === TOTAL_LEVELS, Math.floor(total))
        .then(() => {
          setScreen('result');
        })
        .catch((err) => {
          setSubmitError((err as Error).message);
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      setLevel(next);
    }
  };

  const handleFail = () => {
    const next = level + 1;
    setFailCount((c) => c + 1);
    if (next >= TOTAL_LEVELS) {
      const total = performance.now() - startTime;
      setSubmitting(true);
      setSubmitError('');
      submitScore(nickname, successCount, false, Math.floor(total))
        .then(() => {
          setScreen('result');
        })
        .catch((err) => {
          setSubmitError((err as Error).message);
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      setLevel(next);
    }
  };

  const handleSkip = async (password: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`https://iampd.ruanftrix.cn/?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (data.match) {
        const total = performance.now() - startTime;
        setSuccessCount(TOTAL_LEVELS);
        setFailCount(0);
        await submitScore(nickname, TOTAL_LEVELS, true, Math.floor(total));
        setScreen('result');
      }
      return data;
    } catch {
      return { match: false, tip: '网络错误' };
    } finally {
      setSubmitting(false);
    }
  };

  if (screen === 'leaderboard') {
    return <Leaderboard onBack={() => setScreen('home')} />;
  }

  const score = Math.round((successCount / TOTAL_LEVELS) * 100);

  if (screen === 'victory') {
    return <VictoryScreen onRestart={() => setScreen('home')} onViewLeaderboard={() => setScreen('leaderboard')} />;
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        score={score}
        successCount={successCount}
        failCount={failCount}
        onRetry={() => {
          setLevel(0);
          setSuccessCount(0);
          setFailCount(0);
          setStartTime(performance.now());
          setScreen('playing');
        }}
        onHome={() => setScreen('home')}
        onViewLeaderboard={() => setScreen('leaderboard')}
      />
    );
  }

  if (screen === 'playing') {
    const meta = CHALLENGES[level];
    const Component = meta.Component;
    const ctx: ChallengeContext = { level, onPass: handlePass, onFail: handleFail };
    return (
      <div className="min-h-screen aurora-bg grid-bg flex flex-col">
        <Header
          level={level}
          nickname={nickname}
          onQuit={() => setScreen('home')}
          startTime={startTime}
          successCount={successCount}
          failCount={failCount}
          onSkip={() => setShowSkipModal(true)}
        />
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-2xl bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 sm:p-8 animate-slide-up">
            <div className="mb-5">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  关卡 {level + 1}/{TOTAL_LEVELS}
                </span>
                <span>{meta.subtitle}</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{meta.title}</h2>
              <p className="text-sm text-zinc-400 mt-1">{meta.instruction}</p>
            </div>
            <Component {...ctx} />
            {submitting && (
              <div className="mt-4 text-center text-sm text-zinc-400">提交成绩中…</div>
            )}
            {submitError && (
              <div className="mt-4 text-center text-sm text-rose-400">{submitError}</div>
            )}
          </div>
        </div>
        <ProgressBar current={level} total={TOTAL_LEVELS} />
        {showSkipModal && (
          <SkipModal onClose={() => setShowSkipModal(false)} onSubmit={handleSkip} />
        )}
      </div>
    );
  }

  return <HomeScreen onStart={startGame} nameInput={nameInput} setNameInput={setNameInput} onViewLeaderboard={() => setScreen('leaderboard')} />;
}

function HomeScreen({
  onStart,
  nameInput,
  setNameInput,
  onViewLeaderboard,
}: {
  onStart: () => void;
  nameInput: string;
  setNameInput: (v: string) => void;
  onViewLeaderboard: () => void;
}) {
  return (
    <div className="min-h-screen aurora-bg grid-bg flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="relative z-10 w-full max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-6 relative">
          <ShieldCheck className="text-emerald-400" size={40} />
          <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 animate-pulse-ring" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
          人类身份验证
        </h1>
        <p className="text-zinc-400 mb-8 text-base sm:text-lg">
          请完成 <span className="text-emerald-400 font-bold">20 项</span> 挑战以证明你不是 AI。失败可继续，最终根据成功关数评分。
        </p>

        <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <User className="text-emerald-400" size={20} />
            </div>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              placeholder="输入昵称（将记入排行榜）"
              className="flex-1 bg-transparent text-white outline-none placeholder:text-zinc-600"
            />
          </div>
          <button
            onClick={onStart}
            className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-900 font-bold text-lg hover:bg-emerald-400 transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            开始验证 <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Feature icon={<Brain className="text-cyan-400" size={20} />} label="记忆" />
          <Feature icon={<Flame className="text-amber-400" size={20} />} label="反应" />
          <Feature icon={<ShieldCheck className="text-emerald-400" size={20} />} label="精度" />
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={onViewLeaderboard}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
          >
            <Trophy size={16} /> 查看排行榜
          </button>
          <a
            href="/cdn/docs"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
          >
            <Code size={16} /> CDN 嵌入文档
          </a>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
      {icon}
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

function Header({
  level,
  nickname,
  onQuit,
  startTime,
  successCount,
  failCount,
  onSkip,
}: {
  level: number;
  nickname: string;
  onQuit: () => void;
  startTime: number;
  successCount: number;
  failCount: number;
  onSkip: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setElapsed(performance.now() - startTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startTime]);

  const s = Math.floor(elapsed / 1000);
  const time = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-emerald-400" size={22} />
        <span className="font-bold text-white hidden sm:inline">人类验证</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-zinc-400">玩家 <span className="text-white font-medium">{nickname}</span></span>
        <span className="text-zinc-400 hidden sm:inline">用时 <span className="text-emerald-400 font-mono">{time}</span></span>
        <span className="text-zinc-400">成功 <span className="text-emerald-400 font-bold">{successCount}</span> / 失败 <span className="text-rose-400 font-bold">{failCount}</span></span>
        <span className="text-zinc-400">关卡 <span className="text-white font-bold">{level + 1}/{TOTAL_LEVELS}</span></span>
        <button onClick={onSkip} className="text-zinc-500 hover:text-amber-400 transition" title="一键跳关">
          <Zap size={18} />
        </button>
        <button onClick={onQuit} className="text-zinc-500 hover:text-rose-400 transition">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="h-1.5 bg-zinc-900">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ResultScreen({
  score,
  successCount,
  failCount,
  onRetry,
  onHome,
  onViewLeaderboard,
}: {
  score: number;
  successCount: number;
  failCount: number;
  onRetry: () => void;
  onHome: () => void;
  onViewLeaderboard: () => void;
}) {
  const isPerfect = score === 100;
  const isPassed = score >= 90;

  const getStatusColor = () => {
    if (isPerfect) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', grad: 'linear-gradient(135deg, #34d399, #10b981)' };
    if (isPassed) return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', grad: 'linear-gradient(135deg, #fbbf24, #f59e0b)' };
    return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', grad: 'linear-gradient(135deg, #f87171, #ef4444)' };
  };

  const colors = getStatusColor();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-zinc-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-80 h-80 rounded-full ${colors.bg} blur-3xl`} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-lg">
        <div className="relative">
          <div className={`w-24 h-24 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center`}>
            {isPerfect ? (
              <ShieldCheck className={colors.text} size={48} />
            ) : isPassed ? (
              <Trophy className={colors.text} size={48} />
            ) : (
              <X className={colors.text} size={48} />
            )}
          </div>
          <div className={`absolute inset-0 rounded-full border ${colors.text}/20 animate-ping`} style={{ animationDuration: '3s' }} />
        </div>

        <div>
          <h1 className={`text-3xl sm:text-4xl font-black ${colors.text} tracking-tight mb-2`}>
            {isPerfect ? '验证通过' : isPassed ? '成绩良好' : '验证失败'}
          </h1>

          <div className="text-5xl sm:text-6xl font-black mb-4" style={{
            background: colors.grad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {score}分
          </div>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-400">{successCount}</div>
            <div className="text-xs text-zinc-500">成功关卡</div>
          </div>
          <div className="w-px bg-zinc-700/50" />
          <div className="text-center">
            <div className="text-xl font-bold text-rose-400">{failCount}</div>
            <div className="text-xs text-zinc-500">失败关卡</div>
          </div>
        </div>

        <div className="bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-5 border border-zinc-700/30">
          <p className="text-zinc-300 text-sm mb-2">
            <span className="text-emerald-400 font-medium">小贴士</span>
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            长时间专注挑战后，建议闭上眼睛休息 1-2 分钟，放松眼部肌肉。适当远眺窗外风景，有助于缓解视觉疲劳。
          </p>
        </div>

        <p className="text-zinc-400 text-sm max-w-md">
          {isPerfect ? '完美通过所有挑战，系统确认你不是人工智能' :
           isPassed ? '成绩达到及格线，验证通过' :
           `得分低于 90 分，未能通过验证。${failCount > 0 ? `共失败 ${failCount} 关，建议加强训练后重试` : ''}`}
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={onRetry} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-zinc-900 font-bold hover:bg-emerald-400 transition-all duration-300">
            <RefreshCw size={18} /> 再来一次
          </button>
          <button onClick={onHome} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800/60 text-white font-bold hover:bg-zinc-700/60 transition-all duration-300 border border-zinc-700/50">
            返回首页
          </button>
          <button onClick={onViewLeaderboard} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700/50 text-zinc-400 font-bold hover:bg-zinc-800/40 transition-all duration-300">
            <Trophy size={18} /> 排行榜
          </button>
        </div>

        <div className="text-zinc-600 text-xs mt-4">
          感谢你的参与，休息一下吧
        </div>
      </div>
    </div>
  );
}

function SkipModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (password: string) => Promise<{ match: boolean; tip: string }>;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    setLoading(true);
    setError('');
    const result = await onSubmit(password);
    setLoading(false);
    if (!result.match) {
      setError(result.tip);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Zap className="text-amber-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">一键跳关</h2>
        </div>
        <p className="text-zinc-400 text-sm mb-6">
          输入管理员密码可跳过所有挑战直接获得满分成绩。此功能仅对主页面开放，CDN 模式不可用。
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="输入密码"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50 transition"
            />
          </div>

          {error && (
            <div className="text-sm text-rose-400 flex items-center gap-2">
              <X size={14} /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 font-medium hover:bg-zinc-700 transition"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '验证中…' : '确认'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
