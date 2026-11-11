export interface VideoVariant {
  label: string;
  resolution: string;
  bitrate: number;
  url: string;
}

export interface SubtitleCue {
  id: number;
  start: number;
  end: number;
  startFormatted: string;
  endFormatted: string;
  originalText: string;
  chineseText: string;
}

export interface GlossaryItem {
  term: string;
  translation: string;
  context: string;
}

export interface TweetAuthor {
  name: string;
  screenName: string;
  avatar: string;
}

export interface TweetMetrics {
  likes: number;
  retweets: number;
  views?: string;
}

export interface ResolvedVideoData {
  tweetId: string;
  title: string;
  text: string;
  author: TweetAuthor;
  metrics: TweetMetrics;
  createdAt: string;
  videoVariants: VideoVariant[];
  bestVideoUrl: string;
  poster?: string;
  duration?: number;
  isDemo?: boolean;
  cachedTranslation?: {
    chineseTweet: string;
    summary: string;
    subtitles: SubtitleCue[];
    vocabulary: GlossaryItem[];
  };
}

export interface TranslationPackage {
  detectedLanguage: string;
  targetLanguage: 'zh-CN' | 'zh-TW';
  tweetTranslation: string;
  summary: string;
  subtitles: SubtitleCue[];
  srtContent: string;
  vttContent: string;
  glossary: GlossaryItem[];
}
