import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, ShieldCheck, X } from 'lucide-react';

interface VerificationResult {
  success: boolean;
  successCount: number;
  failCount: number;
}

export function CdnDemo() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'ianbat_verification_result') {
      setVerificationResult(e.data);
      if (e.data.success) {
        setLoginSuccess(true);
        setShowModal(false);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      return;
    }
    setShowModal(true);
    setVerificationResult(null);
  };

  const handleResetVerification = () => {
    const iframe = document.querySelector('iframe#verification-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'ianbat_reset' }, '*');
    }
    setVerificationResult(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setVerificationResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {loginSuccess ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-emerald-400" size={40} />
            </div>
            <h1 className="text-3xl font-black text-emerald-400 mb-2">登录成功</h1>
            <p className="text-zinc-400 mb-8">
              欢迎回来，{username}！<br />
              人机验证已通过，您已成功登录系统。
            </p>
            <button
              onClick={() => {
                setLoginSuccess(false);
                setUsername('');
                setPassword('');
              }}
              className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition"
            >
              返回登录页面
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-4">
                <ShieldCheck className="text-emerald-400" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">安全登录</h1>
              <p className="text-zinc-500 text-sm">
                登录前需完成超难人机验证，防止自动化攻击
              </p>
            </div>

            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">用户名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 transition"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={!username.trim() || !password.trim()}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                    username.trim() && password.trim()
                      ? 'bg-emerald-500 text-zinc-900 hover:bg-emerald-400 active:scale-[0.98]'
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck size={20} />
                  登录（需验证）
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-zinc-600">
                <p>本演示展示如何将 IANBAT 人机验证集成到登录流程中</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-zinc-500">
              <a href="/cdn/docs" className="hover:text-white transition">
                查看集成文档
              </a>
              <span className="w-px h-4 bg-zinc-800" />
              <a href="/" className="hover:text-white transition">
                返回主页
              </a>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <ShieldCheck className="text-emerald-400" size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">人机验证</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-zinc-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <iframe
                  id="verification-iframe"
                  src="/cdn"
                  width="100%"
                  height="480"
                  frameBorder="0"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={() => setLoading(false)}
                  className="bg-zinc-950 rounded-xl"
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 rounded-xl">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-sm text-zinc-500">加载中...</span>
                    </div>
                  </div>
                )}
              </div>
              {verificationResult && !verificationResult.success && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-rose-400">验证失败，请重试</span>
                  <button
                    onClick={handleResetVerification}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs font-medium hover:bg-zinc-700 transition"
                  >
                    <RefreshCw size={14} /> 重新验证
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}