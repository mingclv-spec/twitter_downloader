import React, { useState, useEffect, useRef } from 'react';
import { SubtitleCue } from '../types';
import { Search, Copy, Check, Download, Play, FileText } from 'lucide-react';

interface SubtitleListProps {
  subtitles: SubtitleCue[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  srtContent?: string;
  vttContent?: string;
  tweetId?: string;
}

export const SubtitleList: React.FC<SubtitleListProps> = ({
  subtitles,
  currentTime,
  onSeek,
  srtContent,
  vttContent,
  tweetId = 'video',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter subtitles based on search term
  const filteredCues = subtitles.filter(
    (c) =>
      c.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.chineseText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCue = subtitles.find(
    (c) => currentTime >= c.start && currentTime <= c.end + 0.1
  );

  // Auto-scroll to active cue smoothly
  useEffect(() => {
    if (activeItemRef.current && listContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeCue?.id]);

  const handleCopyLine = (cue: SubtitleCue, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${cue.chineseText}\n${cue.originalText}`);
    setCopiedId(cue.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = subtitles
      .map((c) => `[${c.startFormatted} --> ${c.endFormatted}]\n中: ${c.chineseText}\nEN: ${c.originalText}\n`)
      .join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadFile = (content: string, ext: 'srt' | 'vtt' | 'txt') => {
    const mime = ext === 'vtt' ? 'text/vtt' : 'text/plain';
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `[X-Trans]_${tweetId}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Top Header & Search Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">时间轴双语台词字幕</h3>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {subtitles.length} 条台词
          </span>
        </div>

        {/* Search input & Bulk Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="搜索中英文字幕..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleCopyAll}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-xs flex items-center gap-1 cursor-pointer shrink-0"
            title="复制全部字幕"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">复制</span>
          </button>

          <button
            onClick={() => downloadFile(srtContent || '', 'srt')}
            disabled={!srtContent}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer shrink-0"
            title="下载 SRT 字幕文件"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.SRT</span>
          </button>

          <button
            onClick={() => downloadFile(vttContent || '', 'vtt')}
            disabled={!vttContent}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer shrink-0"
            title="下载 VTT 字幕文件"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.VTT</span>
          </button>
        </div>
      </div>

      {/* Subtitle List */}
      <div ref={listContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[500px]">
        {filteredCues.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {searchTerm ? '未找到包含该关键词的字幕行' : '暂无台词字幕，解析视频或选择样例后即可自动生成'}
          </div>
        ) : (
          filteredCues.map((cue) => {
            const isActive = activeCue?.id === cue.id;
            return (
              <div
                key={cue.id}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSeek(cue.start)}
                className={`group p-3 rounded-lg border transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">#{cue.id.toString().padStart(2, '0')}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-blue-400 font-medium">{cue.startFormatted}</span>
                    <span className="text-slate-600">→</span>
                    <span>{cue.endFormatted}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleCopyLine(cue, e)}
                      className="p-1 hover:text-white text-slate-400 rounded transition-colors"
                      title="复制本句中英字幕"
                    >
                      {copiedId === cue.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="text-[11px] text-blue-400 font-sans flex items-center gap-0.5">
                      <Play className="w-3 h-3 fill-current" />
                      跳转
                    </span>
                  </div>
                </div>

                {/* Chinese Subtitle Text */}
                <p className="text-sm font-medium text-amber-200/90 leading-snug">
                  {cue.chineseText}
                </p>

                {/* English Original Subtitle Text */}
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {cue.originalText}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
