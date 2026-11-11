import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execFile } from 'child_process';
import util from 'util';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { getTweet } from 'react-tweet/api';

dotenv.config();

const execFilePromise = util.promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS & Range headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve public samples directly
app.use('/samples', express.static(path.join(__dirname, 'public', 'samples')));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Demo video catalog for 1-click testing
export interface DemoPost {
  id: string;
  title: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  tweetText: string;
  date: string;
  likes: number;
  retweets: number;
  videoUrl: string;
  duration: number;
  demoSubtitles: Array<{
    id: number;
    start: number;
    end: number;
    startFormatted: string;
    endFormatted: string;
    originalText: string;
    chineseText: string;
  }>;
  demoChineseTweet: string;
  demoSummary: string;
  demoVocabulary: Array<{ term: string; translation: string; context: string }>;
}

const DEMO_POSTS: Record<string, DemoPost> = {
  demo_ai: {
    id: 'demo_ai',
    title: 'Next-Gen AI & Multimodal Reasoning Keynote',
    authorName: 'AI Frontier Research',
    authorHandle: '@ai_frontier',
    authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    tweetText: 'Today we are introducing our breakthrough multimodal reasoning architecture. By integrating native audio, visual perception, and high-speed chain of thought, autonomous models can now comprehend real-world video streams in real-time with zero latency.',
    date: '10:45 AM · Nov 10, 2026',
    likes: 48200,
    retweets: 12400,
    videoUrl: '/samples/ai_keynote_demo.mp4',
    duration: 14,
    demoChineseTweet: '今天我们隆重推出突破性的多模态推理架构。通过原生融合音频、视觉感知以及超高速思维链，自主AI模型现在能够实现对现实世界视频流的实时零延迟理解。',
    demoSummary: '本次发布会聚焦新一代多模态推理架构，重点展示了视觉与原生音频联合处理能力，将视频理解延迟降至近乎零，为未来智能体系统奠定了核心基石。',
    demoSubtitles: [
      { id: 1, start: 0.5, end: 3.8, startFormatted: '00:00.500', endFormatted: '00:03.800', originalText: 'Welcome everyone. Today we are introducing our breakthrough multimodal architecture.', chineseText: '欢迎大家。今天我们隆重宣布我们突破性的多模态架构。' },
      { id: 2, start: 4.0, end: 7.6, startFormatted: '00:04.000', endFormatted: '00:07.600', originalText: 'By integrating native audio and vision, models reason directly over temporal video frames.', chineseText: '通过深度整合原生音频与视觉，模型能够直接对时序视频帧进行多维推理。' },
      { id: 3, start: 8.0, end: 11.2, startFormatted: '00:08.000', endFormatted: '00:11.200', originalText: 'This delivers unprecedented precision for real-world robotics and autonomous tasks.', chineseText: '这为真实世界的机器人交互与自主任务带来了前所未有的精准度。' },
      { id: 4, start: 11.5, end: 13.8, startFormatted: '00:11.500', endFormatted: '00:13.800', originalText: 'The future of intelligent computing starts right now.', chineseText: '智能计算的崭新未来，就从此刻正式启航。' },
    ],
    demoVocabulary: [
      { term: 'Multimodal Reasoning', translation: '多模态推理', context: '跨越文本、图像与声音的联合逻辑理解能力' },
      { term: 'Chain of Thought', translation: '思维链', context: 'AI模型展示逐步推理与问题分解过程的机制' },
      { term: 'Zero Latency', translation: '零延迟 / 极低时延', context: '流媒体视频输入与理解之间的即时响应' },
    ],
  },
  demo_starship: {
    id: 'demo_starship',
    title: 'Starship Orbital Flight & Super Heavy Catch',
    authorName: 'Space Exploration Ops',
    authorHandle: '@space_telemetry',
    authorAvatar: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=120&auto=format&fit=crop&q=80',
    tweetText: 'Starship Super Heavy booster just executed a precision landing burn and was successfully captured mid-air by the mechanical chopsticks at Starbase. Engineering history made today!',
    date: '3:15 PM · Nov 8, 2026',
    likes: 125000,
    retweets: 38900,
    videoUrl: '/samples/starship_flight_demo.mp4',
    duration: 14,
    demoChineseTweet: '星舰超重型助推器刚刚精准完成着陆反推点火，并在星际基地被机械臂（“筷子”）在空中完美捕获。今天，航天工程历史被彻底刷新！',
    demoSummary: '星舰完成了划时代的助推器空中机械臂捕获试验。通过高精度反推点火与气动控制，实现了火箭发射台全系统快速重复使用的关键飞跃。',
    demoSubtitles: [
      { id: 1, start: 0.6, end: 3.5, startFormatted: '00:00.600', endFormatted: '00:03.500', originalText: 'Super Heavy is currently descending through the lower atmosphere, transonic velocity.', chineseText: '超重型助推器正在穿过低层大气，目前处于跨音速状态。' },
      { id: 2, start: 3.8, end: 7.2, startFormatted: '00:03.800', endFormatted: '00:07.200', originalText: 'Landing burn ignition confirmed. Three center engines relit perfectly.', chineseText: '着陆反推点火确认！三台中心猛禽发动机完美重新点火。' },
      { id: 3, start: 7.5, end: 10.8, startFormatted: '00:07.500', endFormatted: '00:10.800', originalText: 'Approaching the tower... Mechanical catch arms are locked in position.', chineseText: '正接近发射塔……机械捕获臂（筷子）已锁定在就绪工位。' },
      { id: 4, start: 11.0, end: 13.9, startFormatted: '00:11.000', endFormatted: '00:13.900', originalText: 'Touchdown catch confirmed! We have caught the booster!', chineseText: '捕获成功！我们成功在空中抓住了助推器！' },
    ],
    demoVocabulary: [
      { term: 'Super Heavy Booster', translation: '超重型助推器', context: '星舰第一级大推力火箭箭体' },
      { term: 'Landing Burn', translation: '着陆反推点火', context: '火箭接近地面减速的关键推进制动' },
      { term: 'Mechanical Chopsticks', translation: '机械夹爪 / 捕获臂', context: '发射塔架上用于回收助推器的悬臂装置' },
    ],
  },
  demo_design: {
    id: 'demo_design',
    title: 'Hardware Philosophy & The Art of Simplicity',
    authorName: 'Industrial Craft Studio',
    authorHandle: '@design_craft',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    tweetText: 'Simplicity is not merely the absence of clutter. It is the consequence of solving deep complexity until every component feels inevitable, calm, and effortlessly human.',
    date: '8:20 PM · Nov 5, 2026',
    likes: 31400,
    retweets: 7800,
    videoUrl: '/samples/product_design_demo.mp4',
    duration: 14,
    demoChineseTweet: '极简绝不仅仅意味着剔除杂乱。它是洞悉并彻底化解深层复杂性后的必然成果——直至每一个细节都显得浑然天成、从容宁静，与人的体验完美交融。',
    demoSummary: '探讨工业产品设计与硬件极简哲学：真正的简约源自对复杂工程与人机交互的极致提炼，而非表面的装饰削减。',
    demoSubtitles: [
      { id: 1, start: 0.8, end: 4.2, startFormatted: '00:00.800', endFormatted: '00:04.200', originalText: 'When we set out to build this object, we rejected every superficial decoration.', chineseText: '当我们开始打造这款作品时，我们坚决摒弃了一切浮于表面的装饰。' },
      { id: 2, start: 4.5, end: 8.0, startFormatted: '00:04.500', endFormatted: '00:08.000', originalText: 'True simplicity requires resolving the deepest engineering constraints.', chineseText: '真正的极简，必须在最深层次上彻底攻克严苛的工程约束。' },
      { id: 3, start: 8.3, end: 11.6, startFormatted: '00:08.300', endFormatted: '00:11.600', originalText: 'Every radius, every seam, feels entirely natural to the human hand.', chineseText: '每一处弧度、每一道接缝，在手掌轻触的瞬间都显得如此自然妥帖。' },
      { id: 4, start: 11.9, end: 13.9, startFormatted: '00:11.900', endFormatted: '00:13.900', originalText: 'That is what we call intentional design.', chineseText: '这，就是我们所坚守的“倾注心力之设计”。' },
    ],
    demoVocabulary: [
      { term: 'Superficial Decoration', translation: '表面装饰 / 浮华修饰', context: '缺乏实质功能与结构意义的外在点缀' },
      { term: 'Intentional Design', translation: '意图明确的设计 / 凝练设计', context: '每个决策都具备清晰目的与人性考量的设计理念' },
      { term: 'Engineering Constraint', translation: '工程约束', context: '在物理尺寸、散热与材料强度上的客观限制' },
    ],
  },
};

// Helper: Extract tweet ID from varied Twitter/X URLs
function parseTweetId(inputUrl: string): string | null {
  const cleanUrl = inputUrl.trim();
  // Match patterns like /status/123456789 or /statuses/123456789
  const match = cleanUrl.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(?:\w+)\/status(?:es)?\/(\d+)/i) ||
                cleanUrl.match(/(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/i);
  if (match && match[1]) {
    return match[1];
  }
  // If user passed a bare numeric tweet id
  if (/^\d{15,22}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  return null;
}

// Resolution label helper
function getResolutionLabel(bitrate: number, url: string): { label: string; resolution: string } {
  if (bitrate > 1500000 || url.includes('1080x') || url.includes('/1080/')) {
    return { label: '1080p (Full HD)', resolution: '1920x1080' };
  }
  if (bitrate > 700000 || url.includes('720x') || url.includes('/720/')) {
    return { label: '720p (HD)', resolution: '1280x720' };
  }
  if (bitrate > 350000 || url.includes('480x') || url.includes('/480/')) {
    return { label: '480p (Standard)', resolution: '852x480' };
  }
  return { label: '360p (Mobile)', resolution: '640x360' };
}

// 1. Resolve Endpoint
app.post('/api/resolve', async (req: Request, res: Response) => {
  try {
    const { url, demoId } = req.body;

    // Check if user requested a demo post
    if (demoId && DEMO_POSTS[demoId]) {
      const demo = DEMO_POSTS[demoId];
      return res.json({
        success: true,
        isDemo: true,
        tweetId: demo.id,
        title: demo.title,
        text: demo.tweetText,
        author: {
          name: demo.authorName,
          screenName: demo.authorHandle,
          avatar: demo.authorAvatar,
        },
        metrics: {
          likes: demo.likes,
          retweets: demo.retweets,
          views: '1.4M',
        },
        createdAt: demo.date,
        videoVariants: [
          { label: '1080p (Full HD)', resolution: '1920x1080', bitrate: 2200000, url: demo.videoUrl },
          { label: '720p (HD)', resolution: '1280x720', bitrate: 900000, url: demo.videoUrl },
          { label: '480p (Standard)', resolution: '852x480', bitrate: 450000, url: demo.videoUrl },
        ],
        bestVideoUrl: demo.videoUrl,
        poster: '',
        duration: demo.duration,
        cachedTranslation: {
          chineseTweet: demo.demoChineseTweet,
          summary: demo.demoSummary,
          subtitles: demo.demoSubtitles,
          vocabulary: demo.demoVocabulary,
        },
      });
    }

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid Twitter/X post URL or video link.' });
    }

    const trimmedUrl = url.trim();

    // Check if input is a direct MP4/WebM video URL
    if (trimmedUrl.match(/\.(mp4|webm|m4v|mov)(\?.*)?$/i)) {
      const filename = path.basename(trimmedUrl.split('?')[0]);
      return res.json({
        success: true,
        tweetId: 'custom_video',
        title: filename,
        text: `Direct Video Source: ${filename}`,
        author: {
          name: 'Video Source',
          screenName: '@direct_stream',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        },
        metrics: { likes: 0, retweets: 0, views: 'Direct' },
        createdAt: new Date().toLocaleDateString('en-US'),
        videoVariants: [
          { label: 'Original Source Quality', resolution: 'Original', bitrate: 1500000, url: trimmedUrl },
        ],
        bestVideoUrl: trimmedUrl,
        poster: '',
        duration: 0,
      });
    }

    const tweetId = parseTweetId(trimmedUrl);
    if (!tweetId) {
      return res.status(400).json({
        error: 'Could not detect a valid Twitter/X post ID from the URL. Please ensure the link looks like https://x.com/username/status/123456789 or choose a demo clip.',
      });
    }

    // Attempt 1: Fetch via react-tweet syndication
    try {
      const tweetData = await getTweet(tweetId);
      if (tweetData) {
        let rawVariants: Array<{ content_type: string; url: string; bitrate?: number }> = [];

        // Check if tweet has mediaDetails
        if (tweetData.mediaDetails && Array.isArray(tweetData.mediaDetails)) {
          for (const media of tweetData.mediaDetails) {
            if ((media.type === 'video' || media.type === 'animated_gif') && media.video_info?.variants) {
              rawVariants = media.video_info.variants;
              break;
            }
          }
        }

        // Check if tweet has video property
        if (rawVariants.length === 0 && (tweetData as any).video?.variants) {
          rawVariants = (tweetData as any).video.variants;
        }

        const mp4Variants = rawVariants
          .filter((v) => v.content_type === 'video/mp4')
          .map((v) => {
            const resInfo = getResolutionLabel(v.bitrate || 0, v.url);
            return {
              label: resInfo.label,
              resolution: resInfo.resolution,
              bitrate: v.bitrate || 0,
              url: v.url,
            };
          })
          .sort((a, b) => b.bitrate - a.bitrate);

        if (mp4Variants.length > 0) {
          return res.json({
            success: true,
            tweetId: tweetData.id_str,
            title: `Tweet by @${tweetData.user.screen_name}`,
            text: tweetData.text,
            author: {
              name: tweetData.user.name,
              screenName: `@${tweetData.user.screen_name}`,
              avatar: tweetData.user.profile_image_url_https,
            },
            metrics: {
              likes: (tweetData as any).favorite_count || (tweetData as any).likes || 0,
              retweets: (tweetData as any).retweet_count || 0,
              views: (tweetData as any).views ? String((tweetData as any).views) : undefined,
            },
            createdAt: tweetData.created_at,
            videoVariants: mp4Variants,
            bestVideoUrl: mp4Variants[0].url,
            poster: (tweetData as any).mediaDetails?.[0]?.media_url_https || '',
            duration: 0,
          });
        }
      }
    } catch (syndicationErr: any) {
      console.warn('Syndication extraction failed or post deleted, trying yt-dlp fallback:', syndicationErr.message);
    }

    // Attempt 2: Use local yt-dlp extraction
    const ytdlpCandidates = process.platform === 'win32'
      ? [path.join(__dirname, 'bin', 'yt-dlp.exe'), path.join(__dirname, 'bin', 'yt-dlp')]
      : [path.join(__dirname, 'bin', 'yt-dlp')];
    const ytdlpPath = ytdlpCandidates.find((candidate) => fs.existsSync(candidate));
    if (ytdlpPath) {
      try {
        // Use execFile so the user-supplied URL is passed as an argument, not interpreted by a shell.
        const { stdout } = await execFilePromise(ytdlpPath, ['-j', '--no-warnings', trimmedUrl], { timeout: 12000 });
        if (stdout) {
          const info = JSON.parse(stdout);
          const formats = info.formats || [];
          const mp4Formats = formats
            .filter((f: any) => f.vcodec !== 'none' && (f.ext === 'mp4' || f.protocol?.includes('https')))
            .map((f: any) => ({
              label: `${f.height ? `${f.height}p` : 'MP4'} (${f.format_note || 'Standard'})`,
              resolution: f.resolution || (f.height ? `${f.width || '?'}x${f.height}` : 'Video'),
              bitrate: f.tbr || f.vbr || 0,
              url: f.url,
            }))
            .sort((a: any, b: any) => b.bitrate - a.bitrate);

          if (mp4Formats.length > 0) {
            return res.json({
              success: true,
              tweetId: info.id || tweetId,
              title: info.title || `Video from @${info.uploader || 'Twitter'}`,
              text: info.description || info.title || '',
              author: {
                name: info.uploader || 'Twitter User',
                screenName: `@${info.uploader_id || 'x'}`,
                avatar: info.thumbnail || '',
              },
              metrics: {
                likes: info.like_count || 0,
                retweets: info.repost_count || 0,
                views: info.view_count ? String(info.view_count) : undefined,
              },
              createdAt: info.upload_date || '',
              videoVariants: mp4Formats,
              bestVideoUrl: mp4Formats[0].url,
              poster: info.thumbnail || '',
              duration: info.duration || 0,
            });
          }
        }
      } catch (ytdlpErr: any) {
        console.warn('yt-dlp fallback also returned:', ytdlpErr.message);
      }
    }

    // If live Twitter API returns rate-limit or no video found, offer a graceful message
    return res.status(404).json({
      error: 'Could not find an accessible video in this Twitter/X post. The tweet may be private, age-restricted, or contains only photos. You can also test with one of our featured English demo clips or upload a video directly.',
    });
  } catch (error: any) {
    console.error('Error in /api/resolve:', error);
    res.status(500).json({ error: error.message || 'Failed to extract video from URL' });
  }
});

// Helper: Format seconds to SRT / VTT timecodes
function formatSrtTimestamp(seconds: number): string {
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

function formatVttTimestamp(seconds: number): string {
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}

// 2. Translate Endpoint (Gemini 3.8 Flash)
app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const {
      tweetText = '',
      title = '',
      videoUrl = '',
      targetLanguage = 'zh-CN', // 'zh-CN' (Simplified) or 'zh-TW' (Traditional)
      demoId,
    } = req.body;

    const isTraditional = targetLanguage === 'zh-TW';
    const langTargetName = isTraditional ? 'Traditional Chinese (繁體中文)' : 'Simplified Chinese (简体中文)';

    // If it's a known demo post, return the pre-cached authentic translation or re-synthesize
    if (demoId && DEMO_POSTS[demoId]) {
      const demo = DEMO_POSTS[demoId];
      // Generate SRT and VTT
      const srt = demo.demoSubtitles
        .map((sub, i) => `${i + 1}\n${formatSrtTimestamp(sub.start)} --> ${formatSrtTimestamp(sub.end)}\n${sub.originalText}\n${sub.chineseText}\n`)
        .join('\n');

      const vtt = 'WEBVTT\n\n' + demo.demoSubtitles
        .map((sub, i) => `${i + 1}\n${formatVttTimestamp(sub.start)} --> ${formatVttTimestamp(sub.end)}\n${sub.chineseText}\n${sub.originalText}\n`)
        .join('\n');

      return res.json({
        success: true,
        detectedLanguage: 'English',
        targetLanguage,
        tweetTranslation: demo.demoChineseTweet,
        summary: demo.demoSummary,
        subtitles: demo.demoSubtitles,
        srtContent: srt,
        vttContent: vtt,
        glossary: demo.demoVocabulary,
      });
    }

    // Call Gemini 3.8 Flash
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(403).json({
        error: 'Gemini API key is not configured. Please verify your API key in Settings > Secrets.',
        code: 'MISSING_API_KEY',
      });
    }

    const systemPrompt = `You are an elite bilingual translator, localization engineer, and audiovisual subtitler specializing in translating English Twitter/X video content into natural, high-grade ${langTargetName}.
Requirements:
1. Detect whether the post and speech content is in English. If in English (or other non-Chinese language), translate into fluent, culturally authentic ${langTargetName}.
2. Translate the original tweet post caption / text into polished Chinese.
3. Transcribe and timestamp the speech segments into a chronological array of bilingual subtitle cues (English originalText and Chinese chineseText). If audio is unavailable, segment the post text into coherent timed sentences suitable for video subtitles (3 to 6 segments spanning 15 seconds).
4. Provide a clear executive summary (内容摘要) in Chinese (2-3 sentences).
5. Extract 3-5 core terminology / vocabulary keywords with their translation and brief contextual explanation in Chinese.
6. Return only valid JSON conforming strictly to the requested schema.`;

    const userPrompt = `Content to analyze and translate into ${langTargetName}:
Tweet Title / Context: "${title}"
Tweet Post Text: "${tweetText}"
Video Source: "${videoUrl}"

Please produce the comprehensive translation package.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING, description: 'Source language detected (e.g. English, Chinese, etc.)' },
            tweetTranslation: { type: Type.STRING, description: 'High quality Chinese translation of the tweet post text' },
            summary: { type: Type.STRING, description: 'Executive summary of video content in Chinese' },
            subtitles: {
              type: Type.ARRAY,
              description: 'Timed subtitle segments',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  start: { type: Type.NUMBER, description: 'Start time in seconds' },
                  end: { type: Type.NUMBER, description: 'End time in seconds' },
                  startFormatted: { type: Type.STRING, description: 'Start time formatted (e.g. 00:01.500)' },
                  endFormatted: { type: Type.STRING, description: 'End time formatted (e.g. 00:04.200)' },
                  originalText: { type: Type.STRING, description: 'Original English speech/sentence' },
                  chineseText: { type: Type.STRING, description: 'Translated Chinese subtitle' },
                },
                required: ['id', 'start', 'end', 'startFormatted', 'endFormatted', 'originalText', 'chineseText'],
              },
            },
            glossary: {
              type: Type.ARRAY,
              description: 'Key vocabulary terms and bilingual definitions',
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ['term', 'translation', 'context'],
              },
            },
          },
          required: ['detectedLanguage', 'tweetTranslation', 'summary', 'subtitles', 'glossary'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Build SRT & VTT formats
    const subs = parsedData.subtitles || [];
    const srt = subs
      .map(
        (sub: any, i: number) =>
          `${i + 1}\n${formatSrtTimestamp(sub.start)} --> ${formatSrtTimestamp(sub.end)}\n${sub.originalText}\n${sub.chineseText}\n`
      )
      .join('\n');

    const vtt =
      'WEBVTT\n\n' +
      subs
        .map(
          (sub: any, i: number) =>
            `${i + 1}\n${formatVttTimestamp(sub.start)} --> ${formatVttTimestamp(sub.end)}\n${sub.chineseText}\n${sub.originalText}\n`
        )
        .join('\n');

    return res.json({
      success: true,
      detectedLanguage: parsedData.detectedLanguage || 'English',
      targetLanguage,
      tweetTranslation: parsedData.tweetTranslation || '',
      summary: parsedData.summary || '',
      subtitles: subs,
      srtContent: srt,
      vttContent: vtt,
      glossary: parsedData.glossary || [],
    });
  } catch (err: any) {
    console.error('Error in /api/translate:', err);
    if (err.status === 403 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('API_KEY')) {
      return res.status(403).json({
        error: 'Gemini API authentication failed. Please select or verify your API key in the Settings > Secrets panel.',
      });
    }
    return res.status(500).json({ error: err.message || 'Failed to translate video content' });
  }
});

// 3. Proxy Video Stream Endpoint (bypasses CORS & hotlinking blocks)
app.get('/api/proxy-video', async (req: Request, res: Response) => {
  try {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).send('Missing url parameter');
    }

    // If local sample file
    if (videoUrl.startsWith('/samples/') || videoUrl.startsWith('samples/')) {
      const filePath = path.join(__dirname, 'public', videoUrl);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    // Forward range request to remote server
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://twitter.com/',
    };
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await fetch(videoUrl, { headers });
    res.status(response.status);

    response.headers.forEach((val, key) => {
      // Don't forward restrictive security headers
      if (!['access-control-allow-origin', 'content-security-policy'].includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');

    if (!response.body) {
      return res.end();
    }

    // Stream response
    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };
    await pump();
  } catch (err: any) {
    console.error('Error proxying video:', err);
    if (!res.headersSent) {
      res.status(502).send('Error streaming video: ' + err.message);
    }
  }
});

// 4. Download Trigger Endpoint (forces file save with clean filename)
app.get('/api/download-file', async (req: Request, res: Response) => {
  try {
    const fileUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'twitter_video.mp4';
    const type = (req.query.type as string) || 'video/mp4';

    if (!fileUrl) {
      return res.status(400).send('Missing url parameter');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', type);

    if (fileUrl.startsWith('/samples/') || fileUrl.startsWith('samples/')) {
      const filePath = path.join(__dirname, 'public', fileUrl);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://twitter.com/',
      },
    });

    if (!response.body) {
      return res.end();
    }

    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };
    await pump();
  } catch (err: any) {
    console.error('Download file error:', err);
    res.status(500).send('Download failed: ' + err.message);
  }
});

// 5. Mount Vite or static build
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`X-Trans server listening on port ${PORT} (isProd=${isProd})`);
});
