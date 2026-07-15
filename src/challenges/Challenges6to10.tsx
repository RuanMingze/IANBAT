import { useEffect, useRef, useState } from 'react';
import type { ChallengeContext } from './types';

export function Level6MemorySequence({ onPass, onFail }: ChallengeContext) {
  const [seq] = useState(() => Array.from({ length: 8 }, () => Math.floor(Math.random() * 9)));
  const [showIdx, setShowIdx] = useState(0);
  const [phase, setPhase] = useState<'show' | 'input' | 'done'>('show');
  const [inputIdx, setInputIdx] = useState(0);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (phase !== 'show') return;
    if (showIdx >= seq.length) {
      setPhase('input');
      return;
    }
    setActive(seq[showIdx]);
    const t1 = setTimeout(() => setActive(-1), 500);
    const t2 = setTimeout(() => setShowIdx((i) => i + 1), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showIdx, phase, seq]);

  const click = (n: number) => {
    if (phase !== 'input') return;
    if (n === seq[inputIdx]) {
      const ni = inputIdx + 1;
      setInputIdx(ni);
      if (ni >= seq.length) {
        setResult('序列正确');
        setPhase('done');
        setTimeout(onPass, 400);
      }
    } else {
      setResult('错误，失败');
      setPhase('done');
      setTimeout(onFail, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">记住 8 位数字闪烁顺序并复现</p>
      <div className="text-2xl font-mono tracking-widest text-zinc-300 h-10">
        {phase === 'show' ? `展示 ${showIdx}/${seq.length}` : phase === 'input' ? `输入 ${inputIdx}/${seq.length}` : result}
      </div>
      <div className="grid grid-cols-3 gap-2 w-64">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={phase !== 'input'}
            className={`aspect-square rounded-lg text-lg font-bold transition ${
              active === i ? 'bg-cyan-400 text-zinc-900 scale-110' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            } disabled:cursor-not-allowed`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Level7DragExact({ onPass, onFail }: ChallengeContext) {
  const [target] = useState(() => 18 + Math.random() * 64);
  const [pos, setPos] = useState(50);
  const [result, setResult] = useState('');
  const dragging = useRef(false);

  const onDown = (e: React.MouseEvent) => {
    dragging.current = true;
    move(e);
  };
  const move = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const bar = e.currentTarget as HTMLDivElement;
    const rect = bar.getBoundingClientRect();
    const p = ((e.clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const d = Math.abs(pos - target);
    if (d <= 1.2) {
      setResult('精准对齐，通过');
      setTimeout(onPass, 400);
    } else {
      setResult(`偏差 ${d.toFixed(2)}%，失败`);
      setTimeout(onFail, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">拖动滑块到目标位置，仔细观察细微差别</p>
      <div
        onMouseDown={onDown}
        onMouseMove={move}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        className="relative w-full max-w-lg h-10 bg-zinc-800 rounded-full border border-zinc-700 cursor-pointer"
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
          style={{ left: `calc(${target}% - 2px)`, background: '#2b2b2f' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-400 border-2 border-emerald-200 shadow-lg"
          style={{ left: `calc(${pos}% - 16px)` }}
        />
      </div>
      <div className="text-xs text-zinc-500">当前位置 {pos.toFixed(2)}%</div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level8Reaction({ onPass, onFail }: ChallengeContext) {
  const [state, setState] = useState<'ready' | 'wait' | 'go' | 'done' | 'early'>('ready');
  const [reaction, setReaction] = useState(0);
  const [result, setResult] = useState('');
  const startRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [round, setRound] = useState(0);
  const [sum, setSum] = useState(0);

  const begin = () => {
    setState('wait');
    const delay = 800 + Math.random() * 1200;
    timeoutRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setState('go');
    }, delay);
  };

  const click = () => {
    if (state === 'ready') {
      begin();
      return;
    }
    if (state === 'wait') {
      clearTimeout(timeoutRef.current);
      setState('early');
      setResult('提前点击，失败');
      setTimeout(onFail, 700);
      return;
    }
    if (state === 'go') {
      const rt = performance.now() - startRef.current;
      setReaction(rt);
      const ns = sum + rt;
      setSum(ns);
      const nr = round + 1;
      setRound(nr);
      if (nr >= 4) {
        const avg = ns / 4;
        if (avg <= 280) {
          setResult(`平均 ${avg.toFixed(0)}ms，通过`);
          setState('done');
          setTimeout(onPass, 500);
        } else {
          setResult(`平均 ${avg.toFixed(0)}ms，失败`);
          setState('done');
          setTimeout(onFail, 800);
        }
      } else {
        begin();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">屏幕变绿立即点击，4 轮平均反应 ≤ 280ms，提前点击即失败</p>
      <div
        onClick={click}
        className={`w-full h-56 rounded-xl flex items-center justify-center text-2xl font-bold cursor-pointer transition-colors ${
          state === 'go' ? 'bg-emerald-500 text-zinc-900' : state === 'wait' ? 'bg-rose-700 text-white' : state === 'ready' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-300'
        }`}
      >
        {state === 'ready' && '点击开始'}
        {state === 'wait' && '等待…（提前点失败）'}
        {state === 'go' && '点击！'}
        {state === 'early' && '太早了'}
        {state === 'done' && result}
      </div>
      <div className="text-xs text-zinc-500">轮次 {round}/4  反应 {reaction.toFixed(0)}ms</div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level9MathRace({ onPass, onFail }: ChallengeContext) {
  const [problems] = useState(() => {
    const arr: { q: string; a: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
      let a = Math.floor(Math.random() * 90) + 10;
      let b = Math.floor(Math.random() * 90) + 10;
      if (op === '-' && b > a) [a, b] = [b, a];
      const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
      arr.push({ q: `${a} ${op} ${b}`, a: ans });
    }
    return arr;
  });
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState('');
  const [result, setResult] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [idx]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setResult('超时，失败');
      setTimeout(onFail, 800);
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleSubmit = () => {
    if (idx >= problems.length) return;
    if (+val === problems[idx].a) {
      const ni = idx + 1;
      setIdx(ni);
      setVal('');
      if (ni >= problems.length) {
        setResult('全部正确，通过');
        setTimeout(onPass, 400);
      }
    } else {
      setResult('错误，失败');
      setTimeout(onFail, 800);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">20 秒内心算 8 道两位数运算，错一题即失败</p>
      <div className="text-xs text-zinc-500">剩余时间 {timeLeft}s  题 {Math.min(idx + 1, problems.length)}/{problems.length}</div>
      <div className="text-4xl font-mono text-zinc-100">{idx < problems.length ? problems[idx].q : '完成'}</div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          inputMode="numeric"
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white text-center text-xl w-40"
          placeholder="答案"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-900 font-bold hover:bg-emerald-400 transition-colors"
        >
          提交
        </button>
      </div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level10Trail({ onPass, onFail }: ChallengeContext) {
  const [path] = useState(() => {
    const pts: { x: number; y: number }[] = [];
    let x = 10 + Math.random() * 10;
    let y = 20 + Math.random() * 50;
    for (let i = 0; i < 14; i++) {
      pts.push({ x, y });
      if (i < 13) {
        x += 5 + Math.random() * 4;
        x = Math.min(x, 88);
        y += (Math.random() - 0.5) * 14;
        y = Math.max(8, Math.min(88, y));
      }
    }
    return pts;
  });
  const [visited, setVisited] = useState<boolean[]>(() => path.map(() => false));
  const [cur, setCur] = useState(0);
  const [result, setResult] = useState('');
  const failed = useRef(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (failed.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (cur < path.length) {
      const p = path[cur];
      const d = Math.hypot(x - p.x, y - p.y);
      if (d <= 3) {
        const nv = [...visited];
        nv[cur] = true;
        setVisited(nv);
        const nc = cur + 1;
        setCur(nc);
        if (nc >= path.length) {
          setResult('轨迹完成，通过');
          setTimeout(onPass, 400);
        }
      } else if (cur > 0) {
        const prev = path[cur - 1];
        const dp = Math.hypot(x - prev.x, y - prev.y);
        if (dp > 8) {
          failed.current = true;
          setResult('脱离轨迹，失败');
          setTimeout(onFail, 700);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-zinc-400">从起点沿圆点路径滑动到终点，偏离即失败</p>
      <div
        onMouseMove={onMove}
        className="relative w-full h-72 bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden cursor-crosshair"
      >
        {path.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full transition-colors"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: i === 0 || i === path.length - 1 ? '14px' : '10px',
              height: i === 0 || i === path.length - 1 ? '14px' : '10px',
              transform: 'translate(-50%, -50%)',
              background: visited[i] ? '#22c55e' : i === 0 ? '#22c55e' : i === path.length - 1 ? '#ef4444' : '#52525b',
            }}
          />
        ))}
      </div>
      <div className="text-xs text-zinc-500">进度 {cur}/{path.length}</div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}
