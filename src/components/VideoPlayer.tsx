import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Download, Subtitles, Settings, RotateCcw } from 'lucide-react';
import { SubtitleCue, VideoVariant } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  variants: VideoVariant[];
  currentVariantUrl: string;
  onSelectVariant: (url: string) => void;
  subtitles: SubtitleCue[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
  title?: string;
  tweetId?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  variants,
  currentVariantUrl,
  onSelectVariant,
  subtitles,
  currentTime,
  onTimeUpdate,
  title = 'Twitter Video',
  tweetId = 'video',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [subtitleMode, setSubtitleMode] = useState<'bilingual' | 'chinese' | 'english' | 'none'>('bilingual');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showSettings, setShowSettings] = useState(false);

  // Compute active subtitle cue based on currentTime
  const activeCue = subtitles.find(
    (cue) => currentTime >= cue.start && currentTime <= cue.end + 0.1
  );

  // Determine actual playable URL
  const playableSrc = React.useMemo(() => {
    if (!currentVariantUrl) return '';
    if (currentVariantUrl.startsWith('blob:') || currentVariantUrl.startsWith('/samples/')) {
      return currentVariantUrl;
    }
    // Route external video through proxy to avoid CORS/Hotlinking blocks
    return `/api/proxy-video?url=${encodeURIComponent(currentVariantUrl)}`;
  }, [currentVariantUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    onTimeUpdate(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    onTimeUpdate(newTime);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownloadVideo = () => {
    const filename = `[X-Trans]_${tweetId}.mp4`;
    const downloadUrl = `/api/download-file?url=${encodeURIComponent(currentVariantUrl)}&filename=${encodeURIComponent(filename)}`;
    window.location.href = downloadUrl;
  };

  // Font size classes
  const fontClass = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
  }[fontSize];

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-xl group select-none flex flex-col justify-center"
    >
      {/* Video Element */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
        {playableSrc ? (
          <video
            ref={videoRef}
            src={playableSrc}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
          />
        ) : (
          <div className="text-slate-500 text-sm flex items-center justify-center h-full">
            暂无视频信号，请解析有效推文链接或选取测试样例
          </div>
        )}

        {/* Dynamic Subtitle Overlay */}
        {subtitleMode !== 'none' && activeCue && (
          <div className="absolute bottom-16 inset-x-4 md:inset-x-8 pointer-events-none flex flex-col items-center justify-end z-20 transition-all">
            <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-lg text-center max-w-3xl border border-slate-700/60 shadow-2xl">
              {/* Chinese Translation */}
              {(subtitleMode === 'bilingual' || subtitleMode === 'chinese') && (
                <p className={`font-semibold text-amber-300 tracking-wide drop-shadow ${fontClass}`}>
                  {activeCue.chineseText}
                </p>
              )}
              {/* English Source */}
              {(subtitleMode === 'bilingual' || subtitleMode === 'english') && (
                <p className={`text-slate-200 mt-0.5 font-normal tracking-normal drop-shadow opacity-90 ${fontSize === 'sm' ? 'text-xs md:text-sm' : 'text-sm md:text-base'}`}>
                  {activeCue.originalText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Play Pause Center Indicator */}
        {!isPlaying && playableSrc && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 hover:bg-blue-500 transition-transform cursor-pointer"
            aria-label="Play video"
          >
            <Play className="w-7 h-7 ml-1 fill-white" />
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-3 flex flex-col gap-2 z-30">
        {/* Scrubber Bar */}
        <div
          onClick={handleProgressClick}
          className="relative h-1.5 w-full bg-slate-800 hover:h-2 rounded-full cursor-pointer transition-all overflow-hidden"
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4 text-slate-300 text-xs">
          {/* Left: Play/Pause, Volume, Timestamps */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  onTimeUpdate(0);
                }
              }}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="重新播放"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 rounded-lg accent-blue-500 cursor-pointer hidden sm:inline"
              />
            </div>

            <span className="font-mono tabular-nums text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Subtitle Settings, Quality, Download, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Subtitle Mode Segmented Switch */}
            <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700">
              <button
                onClick={() => setSubtitleMode('bilingual')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  subtitleMode === 'bilingual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                双语
              </button>
              <button
                onClick={() => setSubtitleMode('chinese')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  subtitleMode === 'chinese' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setSubtitleMode('english')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  subtitleMode === 'english' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                英文
              </button>
              <button
                onClick={() => setSubtitleMode('none')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  subtitleMode === 'none' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                关
              </button>
            </div>

            {/* Quality Selector */}
            {variants.length > 0 && (
              <select
                value={currentVariantUrl}
                onChange={(e) => onSelectVariant(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {variants.map((v, i) => (
                  <option key={i} value={v.url}>
                    {v.label}
                  </option>
                ))}
              </select>
            )}

            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-blue-500 cursor-pointer hidden md:inline"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>

            {/* Download Video Button */}
            <button
              onClick={handleDownloadVideo}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="下载当前画质 MP4 视频"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">下载视频</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="全屏播放"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
