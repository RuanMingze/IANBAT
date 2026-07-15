import { useEffect, useRef, useState } from 'react';
import type { ChallengeContext } from './types';

export function Level16Catch({ onPass, onFail }: ChallengeContext) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);
  const stateRef = useRef({ ball: { x: 0, y: 0, vx: 0, vy: 0 }, paddle: 200, caught: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const W = canvas.width;
    const H = canvas.height;
    const s = stateRef.current;
    s.ball = { x: Math.random() * W, y: 20, vx: (Math.random() - 0.5) * 8, vy: 4 + Math.random() * 3 };
    let running = true;
    const required = 10;

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, W, H);
      const b = s.ball;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 10 || b.x > W - 10) b.vx *= -1;
      if (b.y > H - 20 && b.x > s.paddle - 28 && b.x < s.paddle + 28) {
        s.caught += 1;
        setScore(s.caught);
        if (s.caught >= required) {
          running = false;
          setResult(`接住 ${required} 个，通过`);
          setTimeout(onPass, 400);
          return;
        }
        b.x = Math.random() * W;
        b.y = 20;
        b.vx = (Math.random() - 0.5) * 10;
        b.vy = 4 + Math.random() * 4;
      } else if (b.y > H) {
        running = false;
        setResult('漏接，失败');
        setTimeout(onFail, 800);
        return;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(s.paddle - 28, H - 12, 56, 6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.paddle = ((e.clientX - rect.left) / rect.width) * W;
    };
    canvas.addEventListener('mousemove', onMove);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, [onPass, onFail]);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-zinc-400">移动鼠标控制底部挡板，接住 10 个下落球，漏一个即失败</p>
      <canvas ref={canvasRef} width={480} height={300} className="w-full max-w-lg rounded-xl border border-zinc-700" />
      <div className="text-xs text-zinc-500">已接 {score}/10</div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level17SliderMath({ onPass, onFail }: ChallengeContext) {
  const [target] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [val, setVal] = useState(5000);
  const [result, setResult] = useState('');
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(8);
  const dragging = useRef(false);

  useEffect(() => {
    if (done) return;
    if (time <= 0) {
      setDone(true);
      setResult('超时，失败');
      setTimeout(onFail, 800);
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time, done]);

  const onUp = () => {
    if (!dragging.current || done) return;
    dragging.current = false;
    setDone(true);
    const d = Math.abs(val - target);
    if (d <= 8) {
      setResult(`误差 ${d}，通过`);
      setTimeout(onPass, 400);
    } else {
      setResult(`误差 ${d}，失败`);
      setTimeout(onFail, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">8 秒内拖动滑块使数值精确等于目标，松开后直接判定（容差仅 8）</p>
      <div className="text-xs text-zinc-500">剩余 {time}s</div>
      <div className="text-3xl font-mono text-zinc-100">目标 {target}</div>
      <input
        type="range"
        min={1000}
        max={9999}
        value={val}
        onChange={(e) => setVal(+e.target.value)}
        onMouseDown={() => dragging.current = true}
        onMouseUp={onUp}
        onTouchStart={() => dragging.current = true}
        onTouchEnd={onUp}
        disabled={done}
        className="w-full max-w-lg accent-emerald-400"
      />
      <div className="text-2xl font-mono text-emerald-400">{val}</div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level18Avoid({ onPass, onFail }: ChallengeContext) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState('');
  const [time, setTime] = useState(0);
  const stateRef = useRef({
    player: { x: 250, y: 150 },
    obstacles: [] as { x: number; y: number; vx: number; vy: number }[],
    start: 0,
    over: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const W = canvas.width;
    const H = canvas.height;
    const s = stateRef.current;
    s.player = { x: W / 2, y: H / 2 };
    s.obstacles = Array.from({ length: 7 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
    }));
    s.start = performance.now();
    s.over = false;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.player.x = ((e.clientX - rect.left) / rect.width) * W;
      s.player.y = ((e.clientY - rect.top) / rect.height) * H;
    };
    canvas.addEventListener('mousemove', onMove);

    const tick = () => {
      if (s.over) return;
      const el = (performance.now() - s.start) / 1000;
      setTime(el);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, W, H);
      for (const o of s.obstacles) {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < 0 || o.x > W) o.vx *= -1;
        if (o.y < 0 || o.y > H) o.vy *= -1;
        ctx.beginPath();
        ctx.arc(o.x, o.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        const d = Math.hypot(o.x - s.player.x, o.y - s.player.y);
        if (d < 18) {
          s.over = true;
          setResult('被击中，失败');
          setTimeout(onFail, 700);
          return;
        }
      }
      ctx.beginPath();
      ctx.arc(s.player.x, s.player.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      if (el >= 8) {
        s.over = true;
        setResult('存活 8 秒，通过');
        setTimeout(onPass, 400);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      s.over = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, [onPass, onFail]);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-zinc-400">移动鼠标控制绿点，躲避 7 个红球，存活 8 秒</p>
      <canvas ref={canvasRef} width={500} height={300} className="w-full max-w-lg rounded-xl border border-zinc-700" />
      <div className="text-xs text-zinc-500">已存活 {time.toFixed(1)}s / 8s</div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level19PatternLock({ onPass, onFail }: ChallengeContext) {
  const [pattern] = useState(() => {
    const arr: number[] = [];
    const used = new Set<number>();
    while (arr.length < 6) {
      const n = Math.floor(Math.random() * 9);
      if (!used.has(n)) {
        used.add(n);
        arr.push(n);
      }
    }
    return arr;
  });
  const [showIdx, setShowIdx] = useState(0);
  const [phase, setPhase] = useState<'show' | 'input' | 'done'>('show');
  const [active, setActive] = useState(-1);
  const [input, setInput] = useState<number[]>([]);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (phase !== 'show') return;
    if (showIdx >= pattern.length) {
      setPhase('input');
      return;
    }
    setActive(pattern[showIdx]);
    const t1 = setTimeout(() => setActive(-1), 500);
    const t2 = setTimeout(() => setShowIdx((i) => i + 1), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showIdx, phase]);

  const click = (n: number) => {
    if (phase !== 'input') return;
    const ni = [...input, n];
    setInput(ni);
    if (ni[ni.length - 1] !== pattern[ni.length - 1]) {
      setResult('错误，失败');
      setPhase('done');
      setTimeout(onFail, 700);
      return;
    }
    if (ni.length === pattern.length) {
      setResult('图案正确，通过');
      setPhase('done');
      setTimeout(onPass, 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">记住 6 点闪烁顺序，按相同顺序点击九宫格</p>
      <div className="text-xs text-zinc-500">
        {phase === 'show' ? `展示 ${showIdx}/${pattern.length}` : phase === 'input' ? `输入 ${input.length}/${pattern.length}` : result}
      </div>
      <div className="grid grid-cols-3 gap-3 w-60">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={phase !== 'input'}
            className={`aspect-square rounded-full border-2 transition ${
              active === i ? 'bg-cyan-400 border-cyan-200 scale-110' : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700'
            } disabled:cursor-not-allowed`}
          />
        ))}
      </div>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level20FinalMemory({ onPass, onFail }: ChallengeContext) {
  const [target] = useState(() => {
    const len = 5 + Math.floor(Math.random() * 3);
    return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
  });
  const [phase, setPhase] = useState<'show' | 'input'>('show');
  const [val, setVal] = useState('');
  const [result, setResult] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== 'show') return;
    const t = setTimeout(() => {
      setPhase('input');
      inputRef.current?.focus();
    }, 2000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (val.length === target.length) {
      if (val === target) {
        setResult('记忆正确，通过');
        setTimeout(onPass, 400);
      } else {
        setResult('记忆错误，失败');
        setTimeout(onFail, 800);
      }
    }
  }, [val]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">最终关：记住显示的数字并输入，仅显示 2 秒</p>
      <div className="text-xs text-zinc-500">数字长度 {target.length}</div>
      {phase === 'show' && (
        <div className="text-5xl font-mono text-amber-400 tracking-widest px-8 py-4 bg-zinc-800 rounded-xl">
          {target}
        </div>
      )}
      {phase === 'input' && (
        <>
          <input
            ref={inputRef}
            value={val}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              setVal(v);
            }}
            inputMode="numeric"
            maxLength={target.length}
            className="px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-600 text-white text-center text-3xl font-mono w-full max-w-md"
            placeholder="输入数字"
          />
          <div className="text-sm text-zinc-400">已输入 {val.length}/{target.length}</div>
        </>
      )}
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}
