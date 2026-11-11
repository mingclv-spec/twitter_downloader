import React, { useState } from 'react';
import { ResolvedVideoData, TranslationPackage } from '../types';
import { Twitter, Heart, Repeat, Eye, Calendar, Copy, Check, Sparkles } from 'lucide-react';

interface TweetDetailProps {
  tweet: ResolvedVideoData;
  translation?: TranslationPackage | null;
}

export const TweetDetail: React.FC<TweetDetailProps> = ({ tweet, translation }) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);

  const handleCopy = (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Author Header & Clean Unboxed Metadata */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {tweet.author.avatar ? (
            <img
              src={tweet.author.avatar}
              alt={tweet.author.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {tweet.author.name.charAt(0)}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
              {tweet.author.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{tweet.author.screenName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                {tweet.createdAt}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Typographic Metrics */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums shrink-0">
          <div className="flex items-center gap-1" title="点赞数">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>{tweet.metrics.likes.toLocaleString()}</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div className="flex items-center gap-1" title="转发数">
            <Repeat className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tweet.metrics.retweets.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Two Column Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Original Post */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>原推英文正文 (Original Post)</span>
              <button
                onClick={() => handleCopy(tweet.text, true)}
                className="hover:text-white transition-colors flex items-center gap-1"
                title="复制原推文本"
              >
                {copiedOriginal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>复制</span>
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {tweet.text || '暂无文字描述'}
            </p>
          </div>
        </div>

        {/* Right: Chinese Translation */}
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-400 mb-2 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI 中文精译 (Chinese Translation)
              </span>
              <button
                onClick={() => handleCopy(translation?.tweetTranslation || '', false)}
                disabled={!translation?.tweetTranslation}
                className="hover:text-blue-200 disabled:opacity-40 transition-colors flex items-center gap-1"
                title="复制中文翻译"
              >
                {copiedTranslation ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>复制</span>
              </button>
            </div>
            <p className="text-sm text-amber-200/95 leading-relaxed font-sans whitespace-pre-line">
              {translation?.tweetTranslation || (
                <span className="text-slate-500 italic">点击“开始AI中文翻译”后即可生成精译内容...</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary Section if available */}
      {translation?.summary && (
        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI 视频核心要点提炼 (Executive Summary)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {translation.summary}
          </p>
        </div>
      )}
    </div>
  );
};
