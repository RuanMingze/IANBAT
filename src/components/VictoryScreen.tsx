import { useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw, Trophy } from 'lucide-react';

interface Props {
  onRestart: () => void;
  onViewLeaderboard: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export function VictoryScreen({ onRestart, onViewLeaderboard }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const lastFireRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#22c55e', '#10b981', '#14b8a6', '#0ea5e9', '#3b82f6'];

    const explode = (x: number, y: number) => {
      const count = 20 + Math.floor(Math.random() * 15);
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 1 + Math.random() * 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 80 + Math.random() * 60,
          color: Math.random() < 0.7 ? baseColor : colors[Math.floor(Math.random() * colors.length)],
          size: 1 + Math.random() * 2,
        });
      }
    };

    const tick = (now: number) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (now - lastFireRef.current > 2000) {
        lastFireRef.current = now;
        const x = canvas.width * (0.2 + Math.random() * 0.6);
        const y = canvas.height * (0.3 + Math.random() * 0.3);
        explode(x, y);
      }

      const ps = particlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += 1;
        p.vy += 0.02;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        const alpha = (1 - p.life / p.maxLife) * 0.4;
        if (alpha <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-zinc-900 to-slate-950">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="text-emerald-400" size={56} />
          </div>
          <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            验证通过
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            恭喜你成功通过了全部 20 项挑战。系统已确认你不是人工智能。
          </p>
        </div>

        <div className="bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
          <p className="text-zinc-300 text-sm mb-2">
            <span className="text-emerald-400 font-medium">小贴士</span>
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            长时间专注挑战后，建议闭上眼睛休息 1-2 分钟，放松眼部肌肉。适当远眺窗外风景，有助于缓解视觉疲劳。
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={onViewLeaderboard}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 text-zinc-900 font-bold hover:bg-emerald-400 transition-all duration-300 hover:scale-105"
          >
            <Trophy size={18} /> 排行榜
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-zinc-800/80 text-white font-bold hover:bg-zinc-700/80 transition-all duration-300 border border-zinc-700"
          >
            <RefreshCw size={18} /> 再来一次
          </button>
        </div>

        <div className="text-zinc-600 text-xs mt-4">
          感谢你的参与，休息一下吧
        </div>
      </div>
    </div>
  );
}
