import React, { useCallback, useEffect, useState } from 'react';
import { Archive, RefreshCw, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface ArchiveItem {
  tweetId: string;
  sourceUrl: string;
  title: string;
  text: string;
  authorName: string;
  authorHandle: string;
  createdAt: string;
  targetLanguage: string;
  savedAt: string;
  translation?: {
    tweetTranslation?: string;
    summary?: string;
    detectedLanguage?: string;
  } | null;
}

export const ArchivePanel: React.FC = () => {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadArchive = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/archive?limit=200');
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || '无法读取本地档案');
      setItems(data.posts || []);
    } catch (err: any) {
      setError(err.message || '读取本地档案失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadArchive(); }, [loadArchive]);

  const deleteItem = async (tweetId: string) => {
    if (!window.confirm('确定从本地档案中删除这条记录吗？')) return;
    try {
      const response = await fetch(`/api/archive/${encodeURIComponent(tweetId)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || '删除失败');
      setItems((current) => current.filter((item) => item.tweetId !== tweetId));
      if (selectedId === tweetId) setSelectedId(null);
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  const selected = items.find((item) => item.tweetId === selectedId);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-blue-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">本地内容档案</h2>
            <p className="text-xs text-slate-500 mt-0.5">SQLite · {items.length} 条已保存记录</p>
          </div>
        </div>
        <button onClick={loadArchive} disabled={loading} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> 刷新
        </button>
      </div>

      {error && <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-900 rounded-lg p-3">{error}</p>}
      {loading && items.length === 0 && <p className="text-sm text-slate-400">正在读取档案...</p>}
      {!loading && items.length === 0 && !error && (
        <div className="text-center py-12 space-y-2">
          <Archive className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300">档案库还是空的</p>
          <p className="text-xs text-slate-500">解析 X/Twitter 推文后，系统会自动保存推文资料与 AI 翻译。</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            {items.map((item) => (
              <article key={item.tweetId} className={`border rounded-lg p-3 transition-colors ${selectedId === item.tweetId ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800 bg-slate-950/50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => setSelectedId(selectedId === item.tweetId ? null : item.tweetId)} className="text-left min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white line-clamp-2">{item.title || item.text || item.tweetId}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{item.authorName} {item.authorHandle}</p>
                    <p className="text-[10px] text-slate-500 mt-1">ID: {item.tweetId}</p>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setSelectedId(selectedId === item.tweetId ? null : item.tweetId)} title="查看详情" className="p-1.5 text-slate-400 hover:text-white">
                      {selectedId === item.tweetId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteItem(item.tweetId)} title="删除档案" className="p-1.5 text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">保存时间：{item.savedAt}</p>
              </article>
            ))}
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 min-h-48">
            {selected ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">{selected.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{selected.authorName} {selected.authorHandle} · {selected.createdAt}</p>
                  {selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 mt-2">打开原推 <ExternalLink className="w-3 h-3" /></a>}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">原始内容</p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.text || '无原文内容'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-blue-400 mb-1">中文翻译</p>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{selected.translation?.tweetTranslation || '尚未生成翻译'}</p>
                </div>
                {selected.translation?.summary && (
                  <div>
                    <p className="text-[11px] font-semibold text-amber-400 mb-1">内容摘要</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{selected.translation.summary}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center">选择左侧记录，查看原文、中文翻译与摘要。</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
