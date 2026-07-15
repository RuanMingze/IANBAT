import { useEffect, useRef, useState } from 'react';
import type { ChallengeContext } from './types';

export function Level11TypeExact({ onPass, onFail }: ChallengeContext) {
  const target = 'accommodation';
  const [val, setVal] = useState('');
  const [result, setResult] = useState('');
  const [time, setTime] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    if (time <= 0) {
      setResult('超时，失败');
      setTimeout(onFail, 700);
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const v = raw.toLowerCase();
    setVal(v);
    if (v.length > target.length) {
      setResult('输入过长，失败');
      setTimeout(onFail, 700);
      return;
    }
    for (let i = 0; i < v.length; i++) {
      const char = v[i];
      if (!/^[a-z]$/.test(char)) {
        setResult('检测到非英文字符，请切换英文输入法，失败');
        setTimeout(onFail, 700);
        return;
      }
      if (char !== target[i]) {
        setResult(`第 ${i + 1} 个字母错误，失败`);
        setTimeout(onFail, 700);
        return;
      }
    }
    if (v === target) {
      setResult('完全正确，通过');
      setTimeout(onPass, 400);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setResult('禁止粘贴，失败');
    setTimeout(onFail, 700);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">10 秒内输入"住处"的正式英语单词</p>
      <div className="text-2xl font-mono text-zinc-100 tracking-wide px-4 py-3 bg-zinc-800 rounded-lg">_______</div>
      <div className="text-xs text-zinc-500">剩余 {time}s</div>
      <input
        ref={inputRef}
        value={val}
        onChange={onChange}
        onPaste={onPaste}
        inputMode="text"
        pattern="[a-zA-Z]+"
        className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white text-center text-lg w-full max-w-md"
        placeholder="在此输入"
      />
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level12OddOneOut({ onPass, onFail }: ChallengeContext) {
  const [round, setRound] = useState(0);
  const [result, setResult] = useState('');
  const [items, setItems] = useState(() => makeRound());

  function makeRound() {
    const base = Math.floor(Math.random() * 360);
    const odd = (base + 8 + Math.random() * 6) % 360;
    const arr = Array.from({ length: 9 }, () => base);
    const idx = Math.floor(Math.random() * 9);
    arr[idx] = odd;
    return { arr, idx, base, odd };
  }

  const click = (i: number) => {
    if (i === items.idx) {
      const nr = round + 1;
      setRound(nr);
      if (nr >= 5) {
        setResult('5 轮全对，通过');
        setTimeout(onPass, 400);
      } else {
        setItems(makeRound());
      }
    } else {
      setResult('选错，失败');
      setTimeout(onFail, 700);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">找出色相与其他不同的方块，5 轮，色差极小</p>
      <div className="text-xs text-zinc-500">轮次 {round + 1}/5</div>
      <div className="grid grid-cols-3 gap-2 w-72">
        {items.arr.map((h, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            className="aspect-square rounded-lg border border-zinc-700 hover:scale-105 transition"
            style={{ background: `hsl(${h}, 65%, 52%)` }}
          />
        ))}
      </div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level13Countdown({ onPass, onFail }: ChallengeContext) {
  const [target] = useState(() => 3000 + Math.floor(Math.random() * 4000));
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState('');
  const startRef = useRef(0);
  const rafRef = useRef(0);

  const start = () => {
    setRunning(true);
    setElapsed(0);
    startRef.current = performance.now();
    const tick = () => {
      const e = performance.now() - startRef.current;
      setElapsed(e);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (!running) return;
    setRunning(false);
    cancelAnimationFrame(rafRef.current);
    const e = performance.now() - startRef.current;
    const d = Math.abs(e - target);
    if (d <= 80) {
      setResult(`误差 ${d.toFixed(0)}ms，通过`);
      setTimeout(onPass, 400);
    } else {
      setResult(`误差 ${d.toFixed(0)}ms，失败`);
      setTimeout(onFail, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">按"开始"计时，按"停止"，使经过时间接近目标，误差 ≤ 80ms</p>
      <div className="text-3xl font-mono text-zinc-100">目标 {target}ms</div>
      <div className="text-3xl font-mono text-emerald-400">{elapsed.toFixed(0)}ms</div>
      {!running ? (
        <button onClick={start} className="px-8 py-3 rounded-lg bg-emerald-500 text-zinc-900 font-bold">开始</button>
      ) : (
        <button onClick={stop} className="px-8 py-3 rounded-lg bg-rose-500 text-white font-bold">停止</button>
      )}
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level14Maze({ onPass, onFail }: ChallengeContext) {
  const [maze] = useState(() => {
    const N = 13;
    const grid: number[][] = Array.from({ length: N }, () => Array(N).fill(1));
    const stack: [number, number][] = [[1, 1]];
    grid[1][1] = 0;
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
      let moved = false;
      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx > 0 && nx < N - 1 && ny > 0 && ny < N - 1 && grid[ny][nx] === 1) {
          grid[ny][nx] = 0;
          grid[cy + dy / 2][cx + dx / 2] = 0;
          stack.push([nx, ny]);
          moved = true;
          break;
        }
      }
      if (!moved) stack.pop();
    }
    grid[N - 2][N - 2] = 0;
    return grid;
  });
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [result, setResult] = useState('');
  const [time, setTime] = useState(7);
  const goal = { x: maze.length - 2, y: maze.length - 2 };

  useEffect(() => {
    if (time <= 0) {
      setResult('时间耗尽，失败');
      setTimeout(onFail, 800);
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const d = dirs[e.key];
      if (!d) return;
      e.preventDefault();
      const nx = pos.x + d[0];
      const ny = pos.y + d[1];
      if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length && maze[ny][nx] === 0) {
        setPos({ x: nx, y: ny });
        if (nx === goal.x && ny === goal.y) {
          setResult('到达终点，通过');
          setTimeout(onPass, 400);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pos, maze, goal, onPass]);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-zinc-400">7 秒内用方向键穿越迷宫到达右下角终点</p>
      <div className="text-xs text-zinc-500">剩余 {time}s</div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${maze[0].length}, 24px)`,
          gridTemplateRows: `repeat(${maze.length}, 24px)`,
        }}
      >
        {maze.flatMap((row, y) =>
          row.map((cell, x) => {
            const isPlayer = pos.x === x && pos.y === y;
            const isGoal = goal.x === x && goal.y === y;
            return (
              <div
                key={`${x}-${y}`}
                className={`border border-zinc-900 ${
                  cell === 1 ? 'bg-zinc-700' : isGoal ? 'bg-emerald-500' : isPlayer ? 'bg-amber-400' : 'bg-zinc-900'
                }`}
              />
            );
          }),
        )}
      </div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level15HoldDuration({ onPass, onFail }: ChallengeContext) {
  const [target] = useState(() => 2000 + Math.floor(Math.random() * 3000));
  const [held, setHeld] = useState(0);
  const [holding, setHolding] = useState(false);
  const [result, setResult] = useState('');
  const startRef = useRef(0);
  const rafRef = useRef(0);

  const start = () => {
    if (holding) return;
    setHolding(true);
    startRef.current = performance.now();
    const tick = () => {
      setHeld(performance.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  const release = () => {
    if (!holding) return;
    setHolding(false);
    cancelAnimationFrame(rafRef.current);
    const e = performance.now() - startRef.current;
    const d = Math.abs(e - target);
    if (d <= 100) {
      setResult(`误差 ${d.toFixed(0)}ms，通过`);
      setTimeout(onPass, 400);
    } else {
      setResult(`误差 ${d.toFixed(0)}ms，失败`);
      setTimeout(onFail, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">按住按钮，松开时使持续时间接近目标，误差 ≤ 100ms（无进度条）</p>
      <div className="text-3xl font-mono text-zinc-100">目标 {target}ms</div>
      <div className="text-3xl font-mono text-amber-400">{held.toFixed(0)}ms</div>
      <button
        onMouseDown={start}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={start}
        onTouchEnd={release}
        className={`px-12 py-6 rounded-xl font-bold text-lg select-none ${holding ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-700 text-white'}`}
      >
        {holding ? '按住中…' : '按住我'}
      </button>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}
