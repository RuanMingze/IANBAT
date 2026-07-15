import { useEffect, useState, useCallback } from 'react';
import { CHALLENGES } from '../challenges/registry';
import { TOTAL_LEVELS, type ChallengeContext } from '../challenges/types';

interface CdnResult {
  success: boolean;
  successCount: number;
  failCount: number;
}

export function CdnEmbed() {
  const [level, setLevel] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<CdnResult | null>(null);

  const sendResult = useCallback((res: CdnResult) => {
    setResult(res);
    try {
      if (window.parent) {
        window.parent.postMessage({
          type: 'ianbat_verification_result',
          ...res,
        }, '*');
      }
    } catch {
    }
    window.dispatchEvent(new CustomEvent('ianbat_verification', { detail: res }));
  }, []);

  const handlePass = useCallback(() => {
    const next = level + 1;
    const newSuccess = successCount + 1;
    setSuccessCount(newSuccess);
    if (next >= TOTAL_LEVELS) {
      const passed = newSuccess >= 18;
      sendResult({
        success: passed,
        successCount: newSuccess,
        failCount,
      });
      setDone(true);
    } else {
      setLevel(next);
    }
  }, [level, successCount, failCount, sendResult]);

  const handleFail = useCallback(() => {
    const next = level + 1;
    const newFail = failCount + 1;
    setFailCount(newFail);
    if (next >= TOTAL_LEVELS) {
      const passed = successCount >= 18;
      sendResult({
        success: passed,
        successCount,
        failCount: newFail,
      });
      setDone(true);
    } else {
      setLevel(next);
    }
  }, [level, successCount, failCount, sendResult]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ianbat_reset') {
        setLevel(0);
        setSuccessCount(0);
        setFailCount(0);
        setDone(false);
        setResult(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (done && result) {
    return (
      <div className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-6 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          result.success ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-rose-500/15 border border-rose-500/30'
        }`}>
          {result.success ? (
            <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
        <h2 className={`text-xl font-bold mb-2 ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
          {result.success ? '验证通过' : '验证失败'}
        </h2>
        <p className="text-zinc-400 text-sm">
          成功 {result.successCount} / {TOTAL_LEVELS} 关
        </p>
        <button
          onClick={() => {
            setLevel(0);
            setSuccessCount(0);
            setFailCount(0);
            setDone(false);
            setResult(null);
          }}
          className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition"
        >
          重新验证
        </button>
      </div>
    );
  }

  const meta = CHALLENGES[level];
  const Component = meta.Component;
  const ctx: ChallengeContext = { level, onPass: handlePass, onFail: handleFail };

  return (
    <div className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            {level + 1}/{TOTAL_LEVELS}
          </span>
          <span>{meta.subtitle}</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">{meta.title}</h2>
        <p className="text-sm text-zinc-400 mt-0.5">{meta.instruction}</p>
      </div>
      <Component {...ctx} />
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>成功 {successCount}</span>
        <span>失败 {failCount}</span>
      </div>
    </div>
  );
}
