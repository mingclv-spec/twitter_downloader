import React from 'react';
import { Sparkles, Cpu, Rocket, Palette } from 'lucide-react';

interface SampleSelectorProps {
  onSelectSample: (sampleId: string) => void;
  activeSampleId?: string;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({ onSelectSample, activeSampleId }) => {
  const samples = [
    {
      id: 'demo_ai',
      icon: Cpu,
      title: '多模态 AI 架构发布演讲',
      author: '@ai_frontier',
      description: '探讨多模态时序视频流实时推理与自主智能体落地',
      color: 'text-sky-400',
    },
    {
      id: 'demo_starship',
      icon: Rocket,
      title: '星舰空中机械臂捕获助推器',
      author: '@space_telemetry',
      description: '任务控制中心着陆反推与塔架筷子夹火箭现场语音',
      color: 'text-purple-400',
    },
    {
      id: 'demo_design',
      icon: Palette,
      title: '硬件极简美学与设计哲学',
      author: '@design_craft',
      description: '深入剖析工业产品设计中“少即是多”的人机交互内涵',
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">快速试用测试样例 (1-Click Presets)</span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          内置原生英文音频与双语对齐，可直接测试下载与翻译全流程
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {samples.map((s) => {
          const Icon = s.icon;
          const isSelected = activeSampleId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSample(s.id)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-md bg-slate-800 shrink-0 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{s.title}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.author}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{s.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
