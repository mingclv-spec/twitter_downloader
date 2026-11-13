import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { SubtitleList } from './components/SubtitleList';
import { TweetDetail } from './components/TweetDetail';
import { GlossaryView } from './components/GlossaryView';
import { DownloadCenter } from './components/DownloadCenter';
import { SampleSelector } from './components/SampleSelector';
import { ResolvedVideoData, TranslationPackage } from './types';
import { Search, Sparkles, Loader2, Upload, AlertCircle, RefreshCw, Languages, FileVideo } from 'lucide-react';

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'subtitles' | 'translation' | 'glossary' | 'downloads'>('subtitles');
  const [targetLanguage, setTargetLanguage] = useState<'zh-CN' | 'zh-TW'>('zh-CN');

  const [videoData, setVideoData] = useState<ResolvedVideoData | null>(null);
  const [currentVariantUrl, setCurrentVariantUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [translationResult, setTranslationResult] = useState<TranslationPackage | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string>('demo_ai');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load default demo on initial mount
  useEffect(() => {
    loadDemo('demo_ai');
  }, []);

  const loadDemo = async (demoId: string) => {
    setIsResolving(true);
    setErrorMessage(null);
    setActiveSampleId(demoId);

    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || '无法加载样例');
      }

      setVideoData(data);
      setCurrentVariantUrl(data.bestVideoUrl);
      setCurrentTime(0);

      // Also trigger / load the translation package
      if (data.cachedTranslation) {
        setTranslationResult({
          detectedLanguage: 'English',
          targetLanguage,
          tweetTranslation: data.cachedTranslation.chineseTweet,
          summary: data.cachedTranslation.summary,
          subtitles: data.cachedTranslation.subtitles,
          srtContent: data.cachedTranslation.subtitles
            .map((s: any, i: number) => `${i + 1}\n00:00:0${Math.floor(s.start)},000 --> 00:00:0${Math.floor(s.end)},000\n${s.originalText}\n${s.chineseText}\n`)
            .join('\n'),
          vttContent:
            'WEBVTT\n\n' +
            data.cachedTranslation.subtitles
              .map((s: any, i: number) => `${i + 1}\n00:00:0${Math.floor(s.start)}.000 --> 00:00:0${Math.floor(s.end)}.000\n${s.chineseText}\n${s.originalText}\n`)
              .join('\n'),
          glossary: data.cachedTranslation.vocabulary,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleResolveUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) {
      setErrorMessage('请输入 Twitter / X 推文链接或直链视频地址');
      return;
    }

    setIsResolving(true);
    setErrorMessage(null);
    setActiveSampleId('');

    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '解析失败，请检查链接是否包含可访问的视频');
      }

      setVideoData(data);
      setCurrentVariantUrl(data.bestVideoUrl);
      setCurrentTime(0);
      setTranslationResult(null);

      // Automatically start AI Translation if English
      startTranslation(data);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsResolving(false);
    }
  };

  const startTranslation = async (currentData?: ResolvedVideoData | null) => {
    const target = currentData || videoData;
    if (!target) return;

    setIsTranslating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweetText: target.text,
          title: target.title,
          videoUrl: target.bestVideoUrl,
          targetLanguage,
          demoId: target.isDemo ? target.tweetId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '翻译失败，请检查后台模型配置');
      }

      setTranslationResult(data);
    } catch (err: any) {
      setErrorMessage(`翻译提示: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Local File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const mockData: ResolvedVideoData = {
      tweetId: `local_${Date.now()}`,
      title: file.name,
      text: `本地上传视频: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      author: {
        name: '本地媒体文件',
        screenName: '@local_user',
        avatar: '',
      },
      metrics: { likes: 0, retweets: 0, views: 'Local' },
      createdAt: new Date().toLocaleDateString('zh-CN'),
      videoVariants: [
        { label: '原始上传画质', resolution: 'Original', bitrate: 0, url: localUrl },
      ],
      bestVideoUrl: localUrl,
      duration: 0,
    };

    setVideoData(mockData);
    setCurrentVariantUrl(localUrl);
    setCurrentTime(0);
    setTranslationResult(null);
    setActiveSampleId('');
    startTranslation(mockData);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Contract Compliant Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab: string) => setActiveTab(tab as any)}
        onOpenUpload={() => fileInputRef.current?.click()}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search & Input Strip */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <form onSubmit={handleResolveUrl} className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="粘贴 Twitter / X 视频推文链接 (如 https://x.com/username/status/...) 或直链 MP4..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Target Language Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg p-1 shrink-0">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1.5" />
              <button
                type="button"
                onClick={() => setTargetLanguage('zh-CN')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  targetLanguage === 'zh-CN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                简体中文
              </button>
              <button
                type="button"
                onClick={() => setTargetLanguage('zh-TW')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  targetLanguage === 'zh-TW' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                繁體中文
              </button>
            </div>

            {/* Resolve & Download Button */}
            <button
              type="submit"
              disabled={isResolving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              {isResolving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在解析视频...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>解析视频</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Selector */}
          <SampleSelector
            activeSampleId={activeSampleId}
            onSelectSample={(id) => loadDemo(id)}
          />
        </section>

        {/* Error Callout if any */}
        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3.5 flex items-start gap-3 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-rose-300/80 mt-0.5">
                提示：若推文设置了隐私权限或受防盗链保护，可直接选取上方预置测试样例体验完整双语字幕与高清下载。
              </p>
            </div>
          </div>
        )}

        {/* Workspace Grid */}
        {videoData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Video Player & Tweet Comparison (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Video Player */}
              <VideoPlayer
                videoUrl={videoData.bestVideoUrl}
                variants={videoData.videoVariants}
                currentVariantUrl={currentVariantUrl}
                onSelectVariant={(url) => setCurrentVariantUrl(url)}
                subtitles={translationResult?.subtitles || []}
                currentTime={currentTime}
                onTimeUpdate={(t) => setCurrentTime(t)}
                onSeek={(t) => setCurrentTime(t)}
                title={videoData.title}
                tweetId={videoData.tweetId}
              />

              {/* Translation Trigger Bar */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">检测源语言:</span>
                  <span className="font-semibold text-white">
                    {translationResult?.detectedLanguage || 'English (英语)'}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400">目标译文:</span>
                  <span className="font-semibold text-blue-400">
                    {targetLanguage === 'zh-CN' ? '简体中文' : '繁體中文'}
                  </span>
                </div>

                <button
                  onClick={() => startTranslation()}
                  disabled={isTranslating}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>免费翻译中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{translationResult ? '重新生成中文翻译' : '开始 AI 中文翻译'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tweet Side-by-Side Details */}
              <TweetDetail tweet={videoData} translation={translationResult} />
            </div>

            {/* Right Column: Tabbed Subtitle & Resource Manager (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Segmented Control for Right Column Tabs */}
              <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('subtitles')}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'subtitles' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  双语字幕
                </button>
                <button
                  onClick={() => setActiveTab('translation')}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'translation' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  推文精译
                </button>
                <button
                  onClick={() => setActiveTab('glossary')}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'glossary' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  核心术语
                </button>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'downloads' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  下载中心
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'subtitles' && (
                <SubtitleList
                  subtitles={translationResult?.subtitles || []}
                  currentTime={currentTime}
                  onSeek={(sec) => setCurrentTime(sec)}
                  srtContent={translationResult?.srtContent}
                  vttContent={translationResult?.vttContent}
                  tweetId={videoData.tweetId}
                />
              )}

              {activeTab === 'translation' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-white text-sm">中文精译速览</h3>
                  <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-3">
                    <p className="text-xs text-slate-400 font-medium">AI 视频内容概要:</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {translationResult?.summary || '暂无概要，请点击上方“开始 AI 中文翻译”'}
                    </p>
                  </div>
                  <div className="bg-blue-950/20 p-4 rounded-lg border border-blue-900/40 space-y-2">
                    <p className="text-xs text-blue-400 font-medium">推文正文译本:</p>
                    <p className="text-sm text-amber-200/90 leading-relaxed font-sans">
                      {translationResult?.tweetTranslation || '暂无译本'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'glossary' && (
                <GlossaryView glossary={translationResult?.glossary || []} />
              )}

              {activeTab === 'downloads' && (
                <DownloadCenter tweet={videoData} translation={translationResult} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>X-Trans · Twitter 视频多清晰度下载与免费文本翻译</p>
      </footer>
    </div>
  );
}
