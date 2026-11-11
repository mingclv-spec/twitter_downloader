import React from 'react';
import { ResolvedVideoData, TranslationPackage } from '../types';
import { Download, Film, FileText, FileCode, CheckCircle2 } from 'lucide-react';

interface DownloadCenterProps {
  tweet: ResolvedVideoData;
  translation?: TranslationPackage | null;
}

export const DownloadCenter: React.FC<DownloadCenterProps> = ({ tweet, translation }) => {
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
