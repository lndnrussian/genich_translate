import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Star, 
  Trash2, 
  ArrowRight, 
  RotateCcw, 
  History as HistoryIcon,
  Copy,
  Check
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onDelete,
  onToggleStar,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (onlyStarred && !item.starred) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.sourceText.toLowerCase().includes(q) ||
      item.translatedText.toLowerCase().includes(q) ||
      item.register.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded border border-[#d1d5db] shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-[#3b82f6]" />
            <div>
              <h2 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                История переводов
              </h2>
              <p className="text-[11px] text-[#6b7280]">
                Локальное хранилище сессий с возможностью восстановления настроек и текста
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6b7280] hover:text-[#1a1a1a] rounded hover:bg-[#e5e7eb] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-2.5 bg-[#f9fafb] border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по оригиналу или переводу..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#d1d5db] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                onlyStarred
                  ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                  : 'bg-white text-[#4b5563] border-[#d1d5db] hover:bg-[#f9fafb]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-500 text-amber-500' : 'text-[#9ca3af]'}`} />
              <span>Избранное</span>
            </button>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Очистить всю историю переводов?')) {
                    onClearAll();
                  }
                }}
                className="text-[#6b7280] hover:text-[#ef4444] transition-colors py-1 px-2 text-[11px]"
              >
                Очистить всю
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-[#f9fafb]">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-[#9ca3af] text-xs space-y-1">
              <HistoryIcon className="w-6 h-6 mx-auto mb-1.5 text-[#d1d5db]" />
              <p className="font-medium text-[#4b5563]">История пуста или ничего не найдено</p>
              <p className="text-[11px] text-[#9ca3af]">Все выполненные переводы сохраняются здесь локально.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#d1d5db] rounded p-3 hover:border-[#3b82f6] transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-[#6b7280]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold px-1.5 py-0.2 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] rounded text-[10px] uppercase">
                      {item.detectedDirection || item.direction}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#f3f4f6] text-[#4b5563] rounded text-[10px] font-medium">
                      {item.register}
                    </span>
                    <span className="text-[#d1d5db]">•</span>
                    <span className="font-mono text-[10px]">{formatDate(item.timestamp)}</span>
                    {item.decisionsCount > 0 && (
                      <span className="text-[#3b82f6] font-mono text-[10px]">
                        • {item.decisionsCount} dec
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleStar(item.id)}
                      className="p-1 text-[#9ca3af] hover:text-amber-500 rounded transition-colors"
                      title={item.starred ? 'Убрать из избранного' : 'В избранное'}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.starred ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleCopy(item.translatedText, item.id)}
                      className="p-1 text-[#9ca3af] hover:text-[#1a1a1a] rounded transition-colors"
                      title="Скопировать перевод"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-[#9ca3af] hover:text-[#ef4444] rounded transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#f9fafb] p-2 rounded border border-[#e5e7eb] text-[#4b5563] line-clamp-3 font-mono text-[11px]">
                    {item.sourceText}
                  </div>
                  <div className="bg-white p-2 rounded border border-[#d1d5db] text-[#1a1a1a] line-clamp-3 text-[11px]">
                    {item.translatedText}
                  </div>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    onClick={() => {
                      onRestore(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#1a1a1a] hover:text-[#3b82f6] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Восстановить в редактор</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#f9fafb] border-t border-[#e5e7eb] flex justify-between items-center text-xs text-[#6b7280]">
          <span className="font-mono text-[11px]">Total sessions: {history.length}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-[#1a1a1a] hover:bg-black text-white rounded text-xs font-semibold transition-colors"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
