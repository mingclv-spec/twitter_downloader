import React from 'react';
import { Video, Globe, DownloadCloud, Sparkles } from 'lucide-react';

interface HeaderProps {
  onSelectTab?: (tab: string) => void;
  activeTab?: string;
  onOpenUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectTab, activeTab = 'subtitles', onOpenUpload }) => {
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
          onClick={() => onSelectTab?.('archive')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
            activeTab === 'archive' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
          }`}
        >
          本地档案
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

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenUpload}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>上传本地视频</span>
        </button>
      </div>
    </header>
  );
};
