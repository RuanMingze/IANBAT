import { Code, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function CdnDocs() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iframeCode = `<iframe
  src="https://ianbat.ruanftrix.cn/cdn"
  width="100%"
  height="500"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin"
></iframe>`;

  const localIframeCode = `<iframe
  src="/cdn"
  width="100%"
  height="500"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin"
></iframe>`;

  const eventCode = `// 方法1: 监听 postMessage
window.addEventListener('message', (e) => {
  if (e.data?.type === 'ianbat_verification_result') {
    console.log('验证结果:', e.data);
    // e.data.success - 是否通过
    // e.data.successCount - 成功关卡数
    // e.data.failCount - 失败关卡数
    if (e.data.success) {
      // 验证通过，执行后续逻辑
    }
  }
});

// 方法2: 监听 CustomEvent
window.addEventListener('ianbat_verification', (e) => {
  console.log('验证结果:', e.detail);
  if (e.detail.success) {
    // 验证通过
  }
});`;

  const resetCode = `// 重置验证（让用户重新验证）
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({ type: 'ianbat_reset' }, '*');`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-sm font-medium mb-4">
            <Code size={14} />
            不适合正常网站
          </div>
          <h1 className="text-3xl font-black mb-4">IANBAT 超难人机验证</h1>
          <p className="text-zinc-400 text-lg">
            这是一个极其困难的人类验证系统，包含 20 项挑战。由于难度极高，不建议用于正常网站的用户验证场景。仅适合需要极高安全性的特殊场合。
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">嵌入方式</h2>
          <p className="text-zinc-400 mb-4">
            使用 iframe 将验证组件嵌入到你的网站中：
          </p>
          <div className="relative">
            <pre className="bg-zinc-950 rounded-xl p-4 text-sm overflow-x-auto">
              <code>{iframeCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(iframeCode)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            >
              {copied ? '已复制' : <Copy size={16} />}
            </button>
          </div>
          <p className="text-zinc-500 text-sm mt-4">
            注意：调整 height 属性以适应你的页面布局，建议至少设置为 500px。
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">获取验证结果</h2>
          <p className="text-zinc-400 mb-4">
            验证完成后，系统会通过两种方式通知父页面验证结果：
          </p>
          <div className="relative">
            <pre className="bg-zinc-950 rounded-xl p-4 text-sm overflow-x-auto">
              <code>{eventCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(eventCode)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            >
              {copied ? '已复制' : <Copy size={16} />}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="font-medium text-emerald-400 mb-1">验证通过条件</div>
              <div className="text-zinc-400">成功通关 ≥ 18 关</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="font-medium text-rose-400 mb-1">验证失败条件</div>
              <div className="text-zinc-400">成功通关 ≤ 17 关</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">重置验证</h2>
          <p className="text-zinc-400 mb-4">
            如果需要让用户重新进行验证，可以发送重置消息：
          </p>
          <div className="relative">
            <pre className="bg-zinc-950 rounded-xl p-4 text-sm overflow-x-auto">
              <code>{resetCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(resetCode)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            >
              {copied ? '已复制' : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4">
          <h3 className="font-bold text-zinc-300 mb-2">注意事项</h3>
          <ul className="text-zinc-400 text-sm space-y-1">
            <li>• 此验证系统难度极高，普通用户可能需要多次尝试才能通过</li>
            <li>• 嵌入的网站需要处理验证失败的情况，提供重试机制</li>
            <li>• 建议在 iframe 周围添加清晰的说明文字，告知用户这是人类验证</li>
            <li>• 由于难度原因，可能会导致用户流失，请谨慎使用</li>
          </ul>
        </div>

        <div className="mt-8 flex items-center gap-6 text-sm text-zinc-500">
          <a href="/cdn/demo" className="flex items-center gap-1 hover:text-white transition">
            查看演示 <ExternalLink size={14} />
          </a>
          <a href="/" className="flex items-center gap-1 hover:text-white transition">
            返回主页面 <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
