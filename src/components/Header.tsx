import React from 'react';
import { Video, Globe, DownloadCloud, Sparkles, Share2 } from 'lucide-react';

interface HeaderProps {
  onSelectTab?: (tab: string) => void;
  activeTab?: string;
  onOpenUpload?: () => void;
  onOpenWeChatModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  activeTab = 'subtitles',
  onOpenUpload,
  onOpenWeChatModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
          <Video className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          X-Trans <span className="font-normal text-slate-400 text-sm ml-1.5 hidden sm:inline">Twitter 视频下载与 AI 中文译配</span>
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectTab?.('subtitles')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
            activeTab === 'subtitles' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
          }`}
        >
          双语字幕
        </button>
        <button
          onClick={() => onSelectTab?.('translation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
            activeTab === 'translation' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
          }`}
        >
          推文精译
        </button>
        <button
          onClick={() => onSelectTab?.('glossary')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
            activeTab === 'glossary' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
          }`}
        >
          核心术语
        </button>
        <button
          onClick={() => onSelectTab?.('downloads')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
            activeTab === 'downloads' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
          }`}
        >
          下载中心
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <a
          href="/api/download-project-zip"
          download="x-trans-source-code.zip"
          className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          title="下载全部项目源码 ZIP 包（解压后可在个人电脑离线运行或推送到 GitHub）"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">下载源码包</span>
        </a>
        <button
          onClick={onOpenWeChatModal}
          className="px-3 py-2 text-xs font-semibold text-emerald-100 bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          title="转发到微信朋友圈与视频号"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>转发到微信</span>
        </button>
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">上传视频</span>
        </button>
      </div>
    </header>
  );
};
