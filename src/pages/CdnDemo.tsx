import { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface VerificationResult {
  success: boolean;
  successCount: number;
  failCount: number;
}

export function CdnDemo() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ianbat_verification_result') {
        setResult(e.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleReset = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'ianbat_reset' }, '*');
    }
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">CDN 嵌入演示</h1>
          <p className="text-zinc-400">
            本页面展示如何将 IANBAT 验证组件嵌入到其他网站中。由于尚未部署到生产环境，iframe 内容暂时无法显示。
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">验证组件嵌入示例</span>
            <a
              href="/cdn/docs"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition"
            >
              查看文档 <ExternalLink size={12} />
            </a>
          </div>
          <div className="relative">
            <iframe
              src="/cdn"
              width="100%"
              height="550"
              frameBorder="0"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setLoading(false)}
              className="bg-zinc-950"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-sm text-zinc-500">加载中...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className={`rounded-2xl border p-6 mb-8 ${
            result.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.success ? '验证通过' : '验证失败'}
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  成功 {result.successCount} 关，失败 {result.failCount} 关
                </p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition"
              >
                <RefreshCw size={16} /> 重新验证
              </button>
            </div>
          </div>
        )}

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4">
          <h3 className="font-bold text-zinc-300 mb-2">关于演示</h3>
          <ul className="text-zinc-400 text-sm space-y-1">
            <li>• 本页面使用相对路径 `/cdn` 作为 iframe 源，模拟本地开发环境</li>
            <li>• 在生产环境中，请使用完整 URL：`https://ianbat.ruanftrix.cn/cdn`</li>
            <li>• 验证结果会通过 postMessage 传递给父页面</li>
            <li>• 通过监听 `ianbat_verification_result` 消息类型获取验证结果</li>
          </ul>
        </div>

        <div className="mt-8 flex items-center gap-4 text-sm text-zinc-500">
          <a href="/cdn/docs" className="hover:text-white transition">
            返回文档
          </a>
          <a href="/" className="hover:text-white transition">
            返回主页
          </a>
        </div>
      </div>
    </div>
  );
}
