import React, { useEffect, useMemo, useState } from 'react';
import { ResolvedVideoData, TranslationPackage } from '../types';
import { Download, Film, FileText, FileCode, Copy, ExternalLink, ClipboardCheck } from 'lucide-react';

interface DownloadCenterProps {
  tweet: ResolvedVideoData;
  translation?: TranslationPackage | null;
}

export const DownloadCenter: React.FC<DownloadCenterProps> = ({ tweet, translation }) => {
  const suggestedTitle = useMemo(() => {
    const source = (translation?.tweetTranslation || tweet.title || tweet.text || '精彩视频分享').replace(/\s+/g, ' ').trim();
    return source.length > 50 ? source.slice(0, 47) + '...' : source;
  }, [tweet.title, tweet.text, translation?.tweetTranslation]);
  const [wechatTitle, setWechatTitle] = useState(suggestedTitle);
  const [wechatDescription, setWechatDescription] = useState(
    [translation?.summary, translation?.tweetTranslation, '#精彩视频'].filter(Boolean).join('\n\n')
  );
  const [copiedField, setCopiedField] = useState<'title' | 'description' | 'xhs-title' | 'xhs-description' | null>(null);
  const [xhsTitle, setXhsTitle] = useState(suggestedTitle.slice(0, 20));
  const [xhsDescription, setXhsDescription] = useState(
    [translation?.summary, translation?.tweetTranslation, '#小红书 #视频分享'].filter(Boolean).join('\n\n')
  );
  useEffect(() => setXhsTitle(suggestedTitle.slice(0, 20)), [suggestedTitle]);
  useEffect(() => {
    setXhsDescription([translation?.summary, translation?.tweetTranslation, '#小红书 #视频分享'].filter(Boolean).join('\n\n'));
  }, [translation?.summary, translation?.tweetTranslation]);
  useEffect(() => setWechatTitle(suggestedTitle), [suggestedTitle]);
  useEffect(() => {
    setWechatDescription([translation?.summary, translation?.tweetTranslation, '#精彩视频'].filter(Boolean).join('\n\n'));
  }, [translation?.summary, translation?.tweetTranslation]);

  const copyWechatText = async (value: string, field: 'title' | 'description') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      const input = document.createElement('textarea');
      input.value = value;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedField(field);
    }
  };
  const triggerDownload = (url: string, filename: string) => {
    const downloadEndpoint = `/api/download-file?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    window.location.href = downloadEndpoint;
  };

  const downloadTextFile = (content: string, filename: string, type = 'text/plain') => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const md = `# [X-Trans] Twitter 视频中英双语纪要报告

- **发布作者**: ${tweet.author.name} (${tweet.author.screenName})
- **发布日期**: ${tweet.createdAt}
- **推文原 ID**: ${tweet.tweetId}
- **点赞 / 转发**: ${tweet.metrics.likes} / ${tweet.metrics.retweets}

---

## 1. 原推正文与中文精译

### 原文 (English)
${tweet.text}

### 中文翻译 (Chinese)
${translation?.tweetTranslation || '未翻译'}

---

## 2. 视频内容要点提炼
${translation?.summary || '暂无提炼'}

---

## 3. 核心专业术语表
${(translation?.glossary || [])
  .map((g) => `- **${g.term}**: ${g.translation} —— ${g.context}`)
  .join('\n')}

---

## 4. 双语对齐台词剧本
${(translation?.subtitles || [])
  .map(
    (s) => `### [${s.startFormatted} -> ${s.endFormatted}]
- **中**: ${s.chineseText}
- **英**: ${s.originalText}
`
  )
  .join('\n')}
`;
    downloadTextFile(md, `[X-Trans]_Report_${tweet.tweetId}.md`, 'text/markdown');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">资源与多格式下载中心</h3>
        </div>
        <span className="text-xs text-slate-400">
          支持离线保存高清视频、标准字幕及 Markdown 报告
        </span>
      </div>

      {/* WeChat Channels desktop publishing helper */}
      <section className="rounded-xl border border-emerald-800/70 bg-emerald-950/20 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-white">发布到微信视频号（电脑端）</h4>
            <p className="text-[11px] text-slate-400 mt-1">先下载 MP4，再复制文案并打开官方助手上传</p>
          </div>
          <span className="text-[10px] rounded-full border border-emerald-700/70 px-2 py-1 text-emerald-300">Windows / Mac</span>
        </div>
        <div className="space-y-2">
          <label className="block text-xs text-slate-300">
            视频标题
            <input value={wechatTitle} onChange={(e) => setWechatTitle(e.target.value)} maxLength={50} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" placeholder="编辑视频标题" />
            <span className="mt-1 block text-right text-[10px] text-slate-500">{wechatTitle.length}/50</span>
          </label>
          <div>
            <label className="block text-xs text-slate-300" htmlFor="wechat-description">视频描述 / 话题</label>
            <textarea id="wechat-description" value={wechatDescription} onChange={(e) => setWechatDescription(e.target.value)} rows={4} maxLength={1000} className="mt-1 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" placeholder="编辑视频描述，可添加 #话题" />
            <span className="mt-1 block text-right text-[10px] text-slate-500">{wechatDescription.length}/1000</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => copyWechatText(wechatTitle, 'title')} disabled={!wechatTitle.trim()} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1.5">
            {copiedField === 'title' ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedField === 'title' ? '标题已复制' : '复制标题'}
          </button>
          <button type="button" onClick={() => copyWechatText(wechatDescription, 'description')} disabled={!wechatDescription.trim()} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1.5">
            {copiedField === 'description' ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedField === 'description' ? '描述已复制' : '复制描述'}
          </button>
          <a href="https://channels.weixin.qq.com/platform/post/create" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 flex items-center gap-1.5">
            打开视频号助手上传 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">操作：下载上方 MP4 → 打开视频号助手并扫码登录 → 上传本地视频 → 粘贴标题和描述 → 检查封面、可见范围及版权声明 → 手动发表。此功能不会读取或保存微信登录信息，也不会自动发布。</p>
      </section>

      {/* Xiaohongshu desktop publishing helper */}
      <section className="rounded-xl border border-rose-800/70 bg-rose-950/20 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-white">发布到小红书（电脑端）</h4>
            <p className="text-[11px] text-slate-400 mt-1">下载 MP4 到电脑，准备笔记文案，再到官方创作平台上传</p>
          </div>
          <span className="text-[10px] rounded-full border border-rose-700/70 px-2 py-1 text-rose-300">Windows / Mac</span>
        </div>
        <div className="space-y-2">
          <label className="block text-xs text-slate-300">
            笔记标题
            <input value={xhsTitle} onChange={(e) => setXhsTitle(e.target.value)} maxLength={20} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-rose-500" placeholder="编辑小红书标题" />
            <span className="mt-1 block text-right text-[10px] text-slate-500">{xhsTitle.length}/20</span>
          </label>
          <div>
            <label className="block text-xs text-slate-300" htmlFor="xiaohongshu-description">笔记正文 / 话题标签</label>
            <textarea id="xiaohongshu-description" value={xhsDescription} onChange={(e) => setXhsDescription(e.target.value)} rows={4} maxLength={2000} className="mt-1 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-rose-500" placeholder="编辑笔记正文，添加相关话题标签" />
            <span className="mt-1 block text-right text-[10px] text-slate-500">{xhsDescription.length}/2000</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => copyWechatText(xhsTitle, 'xhs-title')} disabled={!xhsTitle.trim()} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1.5">
            {copiedField === 'xhs-title' ? <ClipboardCheck className="h-3.5 w-3.5 text-rose-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedField === 'xhs-title' ? '标题已复制' : '复制标题'}
          </button>
          <button type="button" onClick={() => copyWechatText(xhsDescription, 'xhs-description')} disabled={!xhsDescription.trim()} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1.5">
            {copiedField === 'xhs-description' ? <ClipboardCheck className="h-3.5 w-3.5 text-rose-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedField === 'xhs-description' ? '正文已复制' : '复制正文'}
          </button>
          <a href="https://creator.xiaohongshu.com/publish/publish?source=official&target=video" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 flex items-center gap-1.5">
            打开小红书创作平台 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">操作：先下载上方 MP4 → 打开小红书创作平台并登录 → 选择视频发布 → 上传本地 MP4 → 粘贴标题和正文 → 检查封面、话题及版权信息 → 手动发布。此功能不会读取或保存小红书登录信息，也不会自动发布。</p>
      </section>

      {/* Video Resolutions */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-blue-400" />
          <span>可用视频分辨率 (MP4)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tweet.videoVariants.map((variant, i) => (
            <div
              key={i}
              className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg p-3 flex items-center justify-between transition-colors"
            >
              <div>
                <p className="text-xs font-semibold text-white">{variant.label}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                  <span>{variant.resolution}</span>
                  {variant.bitrate > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{Math.round(variant.bitrate / 1000)} kbps</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() =>
                  triggerDownload(variant.url, `[X-Trans]_${tweet.tweetId}_${variant.resolution}.mp4`)
                }
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-medium"
              >
                <Download className="w-3 h-3" />
                <span>下载</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subtitles & Document Exports */}
      <div className="pt-2 border-t border-slate-800">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>字幕与双语文档导出</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* SRT Subtitle */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">SubRip (.SRT)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">支持剪映、PR、Final Cut 导入</p>
            </div>
            <button
              onClick={() =>
                downloadTextFile(translation?.srtContent || '', `[X-Trans]_${tweet.tweetId}.srt`)
              }
              disabled={!translation?.srtContent}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3 h-3" />
              <span>SRT</span>
            </button>
          </div>

          {/* VTT Subtitle */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">WebVTT (.VTT)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">HTML5 视频网页轨道标准格式</p>
            </div>
            <button
              onClick={() =>
                downloadTextFile(translation?.vttContent || '', `[X-Trans]_${tweet.tweetId}.vtt`, 'text/vtt')
              }
              disabled={!translation?.vttContent}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3 h-3" />
              <span>VTT</span>
            </button>
          </div>

          {/* Markdown Report */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Markdown 报告 (.MD)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">完整双语对齐与核心术语档案</p>
            </div>
            <button
              onClick={handleExportMarkdown}
              disabled={!translation}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <FileCode className="w-3 h-3 text-emerald-400" />
              <span>文档</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
