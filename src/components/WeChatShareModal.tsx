import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ResolvedVideoData, TranslationPackage } from '../types';
import {
  X,
  QrCode,
  Share2,
  Copy,
  Check,
  Download,
  Smartphone,
  Sparkles,
  HelpCircle,
  Film,
  MessageCircle,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

interface WeChatShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweet: ResolvedVideoData;
  translation?: TranslationPackage | null;
  currentVideoUrl: string;
}

export const WeChatShareModal: React.FC<WeChatShareModalProps> = ({
  isOpen,
  onClose,
  tweet,
  translation,
  currentVideoUrl,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'qr' | 'caption' | 'poster' | 'guide'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCaptionType, setCopiedCaptionType] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [captionStyle, setCaptionStyle] = useState<'moments' | 'channels' | 'group'>('moments');
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const posterCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate current shareable URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const directVideoDownloadUrl = currentVideoUrl
    ? `${window.location.origin}/api/download-file?url=${encodeURIComponent(currentVideoUrl)}&filename=${encodeURIComponent(`[X-Trans]_${tweet.tweetId}.mp4`)}`
    : currentUrl;

  useEffect(() => {
    if (isOpen) {
      // Generate QR code for mobile scanning
      QRCode.toDataURL(directVideoDownloadUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, directVideoDownloadUrl]);

  if (!isOpen) return null;

  // Generate customized captions for WeChat
  const getWeChatCaption = (style: 'moments' | 'channels' | 'group') => {
    const title = tweet.title || '精选 Twitter 海外前沿视频';
    const chineseText = translation?.tweetTranslation || tweet.text;
    const summary = translation?.summary || '速览海外前沿动态与核心观点。';
    const author = `${tweet.author.name} (${tweet.author.screenName})`;

    if (style === 'moments') {
      return `【精选视频译配】${title}

${chineseText}

💡 核心要点速览：
${summary}

🎬 原推作者：${author}
#海外前沿 #科技洞察 #双语字幕`;
    }

    if (style === 'channels') {
      return `🎥 ${title}（中英双语熟肉）

${summary}

原推重点解读：
${chineseText}

原作者：${author}
#微信视频号 #海外精选 #前沿科技 #干货分享 #双语学习`;
    }

    // Group / Chat
    return `【群友分享 · Twitter 双语视频速递】
📌 标题：${title}
📝 概要：${summary}
👤 出处：${author}
👉 视频文件请查看上方或打开链接查看时间轴对齐双语字幕。`;
  };

  const handleCopyCaption = (style: 'moments' | 'channels' | 'group') => {
    const text = getWeChatCaption(style);
    navigator.clipboard.writeText(text);
    setCopiedCaptionType(style);
    setTimeout(() => setCopiedCaptionType(null), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Generate mobile share poster on canvas
  const handleDownloadPoster = async () => {
    setIsGeneratingPoster(true);
    try {
      const canvas = document.createElement('canvas');
      const width = 750;
      const height = 1150;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e293b');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Top brand header
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('X-Trans · 海外前沿精译速递', 50, 70);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('Twitter / X 视频中英双语字幕精选', 50, 105);

      // Card container
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 140, 670, 750, 24);
      ctx.fill();
      ctx.stroke();

      // Author Info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(tweet.author.name, 70, 195);

      ctx.fillStyle = '#60a5fa';
      ctx.font = '18px sans-serif';
      ctx.fillText(tweet.author.screenName + ' · ' + tweet.createdAt, 70, 230);

      // Title
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 32px sans-serif';
      const titleLines = wrapText(ctx, tweet.title || '精选前沿视频', 610);
      let yOffset = 290;
      titleLines.slice(0, 2).forEach((line) => {
        ctx.fillText(line, 70, yOffset);
        yOffset += 44;
      });

      // Divider line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(70, yOffset + 10);
      ctx.lineTo(680, yOffset + 10);
      ctx.stroke();
      yOffset += 45;

      // Chinese translation preview
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '22px sans-serif';
      const translationText = translation?.tweetTranslation || tweet.text;
      const transLines = wrapText(ctx, '【译文】' + translationText, 610);
      transLines.slice(0, 6).forEach((line) => {
        ctx.fillText(line, 70, yOffset);
        yOffset += 36;
      });

      yOffset = Math.max(yOffset + 20, 640);

      // Summary Box
      if (translation?.summary) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.beginPath();
        ctx.roundRect(70, yOffset, 610, 180, 16);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('💡 AI 核心要点精粹', 90, yOffset + 38);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '19px sans-serif';
        const sumLines = wrapText(ctx, translation.summary, 570);
        let sumY = yOffset + 75;
        sumLines.slice(0, 3).forEach((line) => {
          ctx.fillText(line, 90, sumY);
          sumY += 32;
        });
      }

      // Bottom QR code and callout
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
        });
        ctx.drawImage(qrImg, 70, 930, 160, 160);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('长按识别二维码', 260, 990);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('扫码直接在手机微信中保存高清视频', 260, 1025);
      ctx.fillText('实时查阅时间对齐中英双语字幕', 260, 1055);

      // Export canvas to download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `[X-Trans]_WeChat_Poster_${tweet.tweetId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Poster generation failed:', e);
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  // Helper: Canvas text wrap
  function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                转发到微信生态 (WeChat Repost Suite)
              </h3>
              <p className="text-xs text-slate-400">
                支持转发至微信朋友圈、微信视频号、群聊与公众号
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-900/60 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('qr')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'qr' ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>手机扫码发微信</span>
          </button>
          <button
            onClick={() => setActiveSubTab('caption')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'caption' ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>微信专用文案生成</span>
          </button>
          <button
            onClick={() => setActiveSubTab('poster')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'poster' ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>朋友圈高清海报</span>
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'guide' ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>视频号压制与发布指南</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SubTab 1: QR Code & Mobile Sync */}
          {activeSubTab === 'qr' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Container */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-3 rounded-lg shadow-md mb-3">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="WeChat QR Code" className="w-48 h-48 block" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                        生成二维码中...
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    使用微信「扫一扫」直接存入手机相册
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    微信扫码后长按视频或点击下载即可保存至手机发朋友圈
                  </p>
                </div>

                {/* Direct Actions & Workflow */}
                <div className="space-y-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>手机微信发布极速流程 (只需 3 步)</span>
                    </h4>
                    <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>
                        <strong>扫码或下载</strong>：用微信扫描左侧二维码，点击「下载视频」保存到手机相册。
                      </li>
                      <li>
                        <strong>一键复制文案</strong>：在下方复制已自动翻译整理好的微信文案。
                      </li>
                      <li>
                        <strong>直接发布</strong>：打开微信朋友圈或视频号，从相册选取该视频并粘贴文案即可！
                      </li>
                    </ol>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCopyCaption('moments')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      {copiedCaptionType === 'moments' ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>已复制朋友圈文案！可直接去微信粘贴</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>一键复制微信朋友圈文案</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      <span>复制电脑端网页分享链接</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: WeChat Caption Generator */}
          {activeSubTab === 'caption' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setCaptionStyle('moments')}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                    captionStyle === 'moments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  朋友圈精简风格
                </button>
                <button
                  onClick={() => setCaptionStyle('channels')}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                    captionStyle === 'channels' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  视频号深度导读风（带话题）
                </button>
                <button
                  onClick={() => setCaptionStyle('group')}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                    captionStyle === 'group' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  微信群聊速递风
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {captionStyle === 'moments'
                      ? '朋友圈文案预览'
                      : captionStyle === 'channels'
                      ? '视频号发布描述预览'
                      : '微信群分享消息'}
                  </span>
                  <button
                    onClick={() => handleCopyCaption(captionStyle)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCaptionType === captionStyle ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>已复制！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制此文案</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={getWeChatCaption(captionStyle)}
                  rows={8}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none resize-none selection:bg-emerald-600"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                提示：文案已由 AI 根据推文正文与视频内容自动融合提炼，包含吸睛标题、双语重点与出处标签，复制后直接发布即可获得极佳互动效果。
              </p>
            </div>
          )}

          {/* SubTab 3: Moments Poster Share */}
          {activeSubTab === 'poster' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-48 aspect-[9/14] bg-slate-900 rounded-lg border border-slate-700 shadow-md flex flex-col justify-between p-3 shrink-0 overflow-hidden text-[10px]">
                  <div className="border-b border-slate-800 pb-1.5">
                    <p className="font-bold text-sky-400 truncate">X-Trans 精选速递</p>
                    <p className="text-slate-400 truncate text-[9px]">{tweet.author.name}</p>
                  </div>
                  <div className="space-y-1 my-2">
                    <p className="font-semibold text-amber-200 line-clamp-2">{tweet.title}</p>
                    <p className="text-slate-300 line-clamp-3 text-[9px]">
                      {translation?.summary || tweet.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    {qrDataUrl && <img src={qrDataUrl} className="w-8 h-8 rounded" alt="qr" />}
                    <span className="text-[8px] text-slate-400">长按识别看双语视频</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">朋友圈 9:16 高清图文卡片海报</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    如果不想发纯视频，可在朋友圈发布由本工具自动排版的高清图文海报。
                    海报内嵌视频中文核心摘要、原推精华与识别二维码，好友长按即可在微信内秒看带字幕的原版视频。
                  </p>
                  <button
                    onClick={handleDownloadPoster}
                    disabled={isGeneratingPoster}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingPoster ? '正在生成海报图片...' : '下载高清海报 (保存发朋友圈)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 4: WeChat Channels & Moments Detailed Guide */}
          {activeSubTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Film className="w-4 h-4" />
                  <span>微信视频号发布（推荐 · 打造高质量熟肉）</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                  <li>
                    <strong>画质推荐</strong>：下载 1080p 或 720p MP4 视频，视频号最高支持 1GB 文件大小。
                  </li>
                  <li>
                    <strong>自动字幕压制（剪映 30 秒教程）</strong>：
                    在下载中心点击「下载 .SRT」，打开剪映/CapCut新建草稿，导入刚刚下载的 MP4 视频；点击「文本」-「导入本地字幕文件」选择刚刚保存的 <code>.srt</code> 文件，中英双语字幕秒级贴合！导出视频即可上传到视频号。
                  </li>
                  <li>
                    <strong>文案与封面</strong>：使用本工具一键生成的「视频号深度导读风」文案，带话题标签（如 #科技前沿 #海外翻译）可大幅提升平台算法推荐权重。
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-blue-400 text-sm flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  <span>微信朋友圈发布规范</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                  <li>
                    <strong>30秒以内视频</strong>：微信朋友圈支持直接从手机相册上传播放。
                  </li>
                  <li>
                    <strong>长视频技巧</strong>：若视频超过 30 秒，建议先在微信发到「视频号」，然后点击视频号右上角「分享到朋友圈」，即可在朋友圈实现长视频高清无缝畅看！
                  </li>
                  <li>
                    <strong>海报卡片图文</strong>：也可以保存我们自动生成的「朋友圈高清海报图片」，配上一键复制的短文案发布，视觉冲击力极高。
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>X-Trans · 微信生态一键转推方案</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
