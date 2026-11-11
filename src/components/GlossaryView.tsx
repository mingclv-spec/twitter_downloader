import React from 'react';
import { GlossaryItem } from '../types';
import { BookOpen, Copy, Check } from 'lucide-react';

interface GlossaryViewProps {
  glossary: GlossaryItem[];
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ glossary }) => {
  const [copiedTerm, setCopiedTerm] = React.useState<string | null>(null);

  const handleCopy = (item: GlossaryItem) => {
    navigator.clipboard.writeText(`${item.term}: ${item.translation} (${item.context})`);
    setCopiedTerm(item.term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">视频核心术语与词汇表 (Terminology)</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          共 {glossary.length} 个专业词汇
        </span>
      </div>

      {glossary.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          暂无词汇数据，分析视频并完成翻译后自动提取专业术语
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/40">
                <th className="py-2.5 px-3">英文原词 (Term)</th>
                <th className="py-2.5 px-3">中文释义 (Translation)</th>
                <th className="py-2.5 px-3">语境解析 (Context)</th>
                <th className="py-2.5 px-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {glossary.map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-blue-400 font-mono whitespace-nowrap">
                    {item.term}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-amber-200 whitespace-nowrap">
                    {item.translation}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {item.context}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-1 hover:text-white text-slate-400 transition-colors"
                      title="复制此术语释义"
                    >
                      {copiedTerm === item.term ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
