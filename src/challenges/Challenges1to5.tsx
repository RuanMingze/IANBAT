import { useEffect, useRef, useState } from 'react';
import type { ChallengeContext } from './types';

export function Level1PreciseClick({ onPass, onFail }: ChallengeContext) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [hits, setHits] = useState(0);
  const [msg, setMsg] = useState('');
  const [lastMiss, setLastMiss] = useState<{ x: number; y: number; d: number } | null>(null);
  const required = 5;
  const dotRadius = 1;
  const tolerance = 1;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (size.w === 0 || size.h === 0) return;
    const margin = 40;
    setTarget({
      x: margin + Math.random() * (size.w - margin * 2),
      y: margin + Math.random() * (size.h - margin * 2),
    });
  }, [size, hits]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const d = Math.hypot(cx - target.x, cy - target.y);
    if (d <= dotRadius + tolerance) {
      setHits((h) => {
        const nh = h + 1;
        if (nh >= required) {
          setMsg('完美命中');
          setTimeout(onPass, 250);
        } else {
          setMsg(`命中 ${nh}/${required}`);
        }
        return nh;
      });
      setLastMiss(null);
    } else {
      setLastMiss({ x: cx, y: cy, d });
      setMsg(`偏差 ${d.toFixed(1)}px（容差仅 ${dotRadius + tolerance}px），失败`);
      setTimeout(onFail, 900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-zinc-400">
        连续 5 次像素级点击红点正中心。红点半径 {dotRadius}px，容差仅 {tolerance}px
      </p>
      <div
        ref={containerRef}
        onClick={onClick}
        className="relative w-full h-72 bg-zinc-900/80 rounded-xl border border-zinc-700 cursor-crosshair overflow-hidden"
      >
        {size.w > 0 && (
          <>
            <div
              className="absolute rounded-full border border-red-300/40"
              style={{
                left: target.x,
                top: target.y,
                width: (dotRadius + tolerance) * 2,
                height: (dotRadius + tolerance) * 2,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="absolute rounded-full bg-red-500"
              style={{
                left: target.x,
                top: target.y,
                width: dotRadius * 2,
                height: dotRadius * 2,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 6px 2px rgba(239,68,68,0.6)',
              }}
            />
            {lastMiss && (
              <>
                <div
                  className="absolute rounded-full bg-rose-400/80"
                  style={{
                    left: lastMiss.x,
                    top: lastMiss.y,
                    width: 6,
                    height: 6,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                <svg className="absolute inset-0 pointer-events-none" width={size.w} height={size.h}>
                  <line
                    x1={target.x}
                    y1={target.y}
                    x2={lastMiss.x}
                    y2={lastMiss.y}
                    stroke="rgba(244,63,94,0.6)"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                </svg>
              </>
            )}
          </>
        )}
      </div>
      <div className="text-xs text-zinc-500">命中 {hits}/{required}</div>
      <div className="text-sm font-medium text-zinc-300 h-5">{msg}</div>
    </div>
  );
}

export function Level2Pinball({ onPass, onFail }: ChallengeContext) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [charging, setCharging] = useState(false);
  const [power, setPower] = useState(0);
  const [result, setResult] = useState('');
  const [phase, setPhase] = useState<'aim' | 'flying' | 'done'>('aim');
  const stateRef = useRef({
    ball: { x: 40, y: 0, vx: 0, vy: 0 },
    target: { x: 0, y: 0, r: 14 },
    flying: false,
    landed: false,
    ground: 0,
    targetX: 0,
  });
  const powerRef = useRef(0);
  const chargingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const W = canvas.width;
    const H = canvas.height;
    const ground = H - 16;
    const targetX = W * (0.62 + Math.random() * 0.28);
    stateRef.current.target.x = targetX;
    stateRef.current.target.y = ground;
    stateRef.current.targetX = targetX;
    stateRef.current.ground = ground;
    stateRef.current.ball = { x: 40, y: ground, vx: 0, vy: 0 };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, ground);
      ctx.lineTo(W, ground);
      ctx.stroke();

      const tg = stateRef.current.target;
      ctx.beginPath();
      ctx.arc(tg.x, tg.y - 4, tg.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34,197,94,0.18)';
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tg.x, tg.y - 4, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      const b = stateRef.current.ball;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      if (chargingRef.current) {
        ctx.fillStyle = 'rgba(245,158,11,0.85)';
        ctx.fillRect(50, ground - 60, powerRef.current * 1.6, 10);
        ctx.strokeStyle = '#52525b';
        ctx.strokeRect(50, ground - 60, 160, 10);

        const pulseRadius = 10 + powerRef.current * 0.5;
        const alpha = 0.3 - (powerRef.current / 100) * 0.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,158,11,${alpha})`;
        ctx.fill();
      }

      if (stateRef.current.flying) {
        const b2 = stateRef.current.ball;
        b2.vy += 0.28;
        b2.x += b2.vx;
        b2.y += b2.vy;
        if (b2.y >= ground) {
          b2.y = ground;
          stateRef.current.flying = false;
          stateRef.current.landed = true;
          const d = Math.abs(b2.x - stateRef.current.targetX);
          if (d <= stateRef.current.target.r) {
            setResult('精准着陆');
            setPhase('done');
            setTimeout(onPass, 500);
          } else {
            setResult(`偏差 ${d.toFixed(0)}px，失败`);
            setPhase('done');
            setTimeout(onFail, 900);
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [onPass, onFail]);

  const ivRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const startCharge = () => {
    if (phase !== 'aim') return;
    setCharging(true);
    chargingRef.current = true;
    let p = 0;
    ivRef.current = setInterval(() => {
      p += 2.2;
      if (p >= 100) {
        p = 100;
        clearInterval(ivRef.current);
      }
      setPower(p);
      powerRef.current = p;
    }, 30);
  };
  const release = () => {
    if (phase !== 'aim' || !chargingRef.current) return;
    clearInterval(ivRef.current);
    const p = powerRef.current;
    setCharging(false);
    chargingRef.current = false;
    setPhase('flying');
    const b = stateRef.current.ball;
    b.x = 40;
    b.y = stateRef.current.ground;
    b.vx = 2 + p * 0.12;
    b.vy = -(6 + p * 0.18);
    stateRef.current.flying = true;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-zinc-400">按住按钮蓄力，松开发射。蓄力越久飞得越远，必须落入绿色靶心（容差极小）</p>
      <canvas
        ref={canvasRef}
        width={520}
        height={300}
        className="w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900"
      />
      <button
        onMouseDown={startCharge}
        onMouseUp={release}
        onTouchStart={startCharge}
        onTouchEnd={release}
        disabled={phase !== 'aim'}
        className="px-8 py-3 rounded-lg bg-amber-500 text-zinc-900 font-bold disabled:opacity-40 select-none active:scale-95 transition"
      >
        {charging ? `蓄力 ${power.toFixed(0)}%` : '按住蓄力'}
      </button>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level3ColorMatch({ onPass, onFail }: ChallengeContext) {
  const [target] = useState(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return { r, g, b };
  });
  const [pick, setPick] = useState({ r: 128, g: 128, b: 128 });
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState('');

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    const d = Math.hypot(target.r - pick.r, target.g - pick.g, target.b - pick.b);
    if (d <= 18) {
      setResult(`色差 ${d.toFixed(1)}，通过`);
      setTimeout(onPass, 500);
    } else {
      setResult(`色差 ${d.toFixed(1)}，失败`);
      setTimeout(onFail, 900);
    }
  };

  const swatch = (c: { r: number; g: number; b: number }) => `rgb(${c.r},${c.g},${c.b})`;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-400">还原目标颜色，RGB 三通道误差均需极小（总色差 ≤ 18）</p>
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-24 h-24 rounded-lg border border-zinc-600" style={{ background: swatch(target) }} />
          <span className="text-xs text-zinc-500">目标</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-24 h-24 rounded-lg border border-zinc-600" style={{ background: swatch(pick) }} />
          <span className="text-xs text-zinc-500">你的</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {(['r', 'g', 'b'] as const).map((ch) => (
          <label key={ch} className="flex items-center gap-3 text-sm text-zinc-300">
            <span className="w-6 uppercase">{ch}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={pick[ch]}
              onChange={(e) => setPick((p) => ({ ...p, [ch]: +e.target.value }))}
              className="flex-1 accent-emerald-400"
            />
            <span className="w-10 text-right tabular-nums">{pick[ch]}</span>
          </label>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={submitted}
        className="px-6 py-2 rounded-lg bg-emerald-500 text-zinc-900 font-bold disabled:opacity-40"
      >
        提交
      </button>
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level4TargetClick({ onPass, onFail }: ChallengeContext) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(8);
  const [result, setResult] = useState('');
  const stateRef = useRef({ target: { x: 0, y: 0, r: 12 }, clicked: false });
  const required = 8;

  useEffect(() => {
    if (time <= 0) {
      if (score >= required) {
        setResult(`点击 ${score} 次，通过`);
        setTimeout(onPass, 400);
      } else {
        setResult(`仅点击 ${score} 次，目标 ${required}，失败`);
        setTimeout(onFail, 800);
      }
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    let raf = 0;

    const resetTarget = () => {
      stateRef.current.target = {
        x: 40 + Math.random() * (W - 80),
        y: 40 + Math.random() * (H - 80),
        r: 8 + Math.random() * 8,
      };
      stateRef.current.clicked = false;
    };
    resetTarget();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, W, H);

      const t = stateRef.current.target;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59,130,246,0.1)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#60a5fa';
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * W;
      const cy = ((e.clientY - rect.top) / rect.height) * H;
      const t = stateRef.current.target;
      const d = Math.hypot(cx - t.x, cy - t.y);
      if (d <= t.r) {
        if (!stateRef.current.clicked) {
          stateRef.current.clicked = true;
          setScore((s) => {
            const ns = s + 1;
            if (ns >= required) {
              setResult(`点击 ${ns} 次，通过`);
              cancelAnimationFrame(raf);
              setTimeout(onPass, 400);
            } else {
              resetTarget();
            }
            return ns;
          });
        }
      } else {
        setResult('点击偏差过大，失败');
        cancelAnimationFrame(raf);
        setTimeout(onFail, 800);
      }
    };
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('click', onClick);
    };
  }, [onPass, onFail]);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-zinc-400">8 秒内点击移动的蓝色目标 {required} 次，点偏即失败</p>
      <div className="flex gap-6 text-xs text-zinc-500">
        <span>剩余 {time}s</span>
        <span>得分 {score}/{required}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={480}
        height={280}
        className="w-full max-w-lg rounded-xl border border-zinc-700 cursor-crosshair"
      />
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}

export function Level5NumberMemory({ onPass, onFail }: ChallengeContext) {
  const [target] = useState(() => {
    const len = 6 + Math.floor(Math.random() * 2);
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
    }, 2500);
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
      <p className="text-sm text-zinc-400">记住显示的数字并输入，仅显示 2.5 秒</p>
      <div className="text-xs text-zinc-500">数字长度 {target.length}</div>
      {phase === 'show' && (
        <div className="text-5xl font-mono text-amber-400 tracking-widest px-8 py-6 bg-zinc-800 rounded-xl border border-zinc-700">
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
            className="px-6 py-4 rounded-xl bg-zinc-800 border border-zinc-600 text-white text-center text-4xl font-mono w-full max-w-md"
            placeholder="输入数字"
          />
          <div className="text-sm text-zinc-400">已输入 {val.length}/{target.length}</div>
        </>
      )}
      <div className="text-sm font-medium text-zinc-300 h-5">{result}</div>
    </div>
  );
}
