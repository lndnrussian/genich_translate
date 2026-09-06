import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  BookOpen, 
  Sparkles,
  Info
} from 'lucide-react';
import { GlossaryItem } from '../types';
import { PRESET_GLOSSARIES } from '../utils/storage';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  glossary: GlossaryItem[];
  onSaveGlossary: (items: GlossaryItem[]) => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  glossary,
  onSaveGlossary,
}) => {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [comment, setComment] = useState('');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  if (!isOpen) return null;

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !target.trim()) return;

    const newItem: GlossaryItem = {
      id: `term_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      source: source.trim(),
      target: target.trim(),
      comment: comment.trim() || undefined,
    };

    onSaveGlossary([...glossary, newItem]);
    setSource('');
    setTarget('');
    setComment('');
  };

  const handleDeleteTerm = (id: string) => {
    onSaveGlossary(glossary.filter((g) => g.id !== id));
  };

  const handleLoadPreset = (key: string) => {
    const preset = PRESET_GLOSSARIES[key];
    if (!preset) return;

    // Filter out duplicates by source
    const existingSources = new Set(glossary.map((g) => g.source.toLowerCase()));
    const newItems: GlossaryItem[] = preset.items
      .filter((p) => !existingSources.has(p.source.toLowerCase()))
      .map((p) => ({
        id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        source: p.source,
        target: p.target,
        comment: p.comment,
      }));

    onSaveGlossary([...glossary, ...newItems]);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(glossary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `glossary_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    try {
      // Try JSON first
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        const formatted: GlossaryItem[] = parsed.map((item, idx) => ({
          id: item.id || `imported_${Date.now()}_${idx}`,
          source: String(item.source || item.term || ''),
          target: String(item.target || item.translation || ''),
          comment: item.comment,
        })).filter(i => i.source && i.target);

        onSaveGlossary([...glossary, ...formatted]);
        setShowImport(false);
        setImportText('');
        return;
      }
    } catch {
      // If not JSON, parse tab-separated or comma/equal-separated lines: "source = target" or "source\ttarget"
      const lines = importText.split('\n');
      const items: GlossaryItem[] = [];
      lines.forEach((line, idx) => {
        const parts = line.includes('=') ? line.split('=') : line.split('\t');
        if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
          items.push({
            id: `line_${Date.now()}_${idx}`,
            source: parts[0].trim(),
            target: parts[1].trim(),
          });
        }
      });
      if (items.length > 0) {
        onSaveGlossary([...glossary, ...items]);
        setShowImport(false);
        setImportText('');
      }
    }
  };

  const filteredGlossary = glossary.filter(
    (item) =>
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      item.target.toLowerCase().includes(search.toLowerCase()) ||
      (item.comment && item.comment.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded border border-[#d1d5db] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#3b82f6]" />
            <div>
              <h2 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                База терминов и глоссарий
              </h2>
              <p className="text-[11px] text-[#6b7280]">
                Обязательные соответствия терминов (названия брендов, имена, терминология)
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Add Form */}
          <form onSubmit={handleAddTerm} className="bg-[#f9fafb] p-3 rounded border border-[#d1d5db] space-y-2.5">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block">
              Добавить новый термин
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Оригинал (pipeline)"
                className="text-xs px-2.5 py-1.5 bg-white border border-[#d1d5db] rounded focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                required
              />
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Перевод (конвейер)"
                className="text-xs px-2.5 py-1.5 bg-white border border-[#d1d5db] rounded focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
                required
              />
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Контекст (опционально)"
                className="text-xs px-2.5 py-1.5 bg-white border border-[#d1d5db] rounded focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-black text-white rounded text-xs font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить термин</span>
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#3b82f6]" />
              <span>Типовые наборы:</span>
            </span>
            {Object.entries(PRESET_GLOSSARIES).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handleLoadPreset(key)}
                className="px-2 py-0.5 bg-white border border-[#d1d5db] hover:border-[#3b82f6] text-[#4b5563] hover:text-[#1a1a1a] rounded text-[11px] font-medium transition-colors"
              >
                + {preset.name}
              </button>
            ))}
          </div>

          {/* Import Panel (Toggleable) */}
          {showImport && (
            <div className="p-3 bg-[#f9fafb] rounded border border-[#d1d5db] space-y-2">
              <label className="text-xs font-medium text-[#1a1a1a] block">
                Вставьте JSON или строки "термин = перевод":
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={'pipeline = конвейер\nvalue proposition = ценностное предложение'}
                rows={4}
                className="w-full text-xs font-mono p-2 bg-white border border-[#d1d5db] rounded focus:ring-1 focus:ring-[#3b82f6] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="px-2.5 py-1 text-xs text-[#4b5563] hover:bg-[#e5e7eb] rounded"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="px-3 py-1 text-xs bg-[#1a1a1a] text-white font-medium rounded hover:bg-black"
                >
                  Импортировать
                </button>
              </div>
            </div>
          )}

          {/* Term List Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-2.5 top-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по терминам..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#d1d5db] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setShowImport(!showImport)}
                className="flex items-center gap-1 px-2.5 py-1 border border-[#d1d5db] bg-white hover:bg-[#f9fafb] rounded text-[#4b5563] font-medium transition-colors"
                title="Импорт"
              >
                <Upload className="w-3 h-3" />
                <span className="hidden sm:inline text-[11px]">Импорт</span>
              </button>
              {glossary.length > 0 && (
                <>
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1 px-2.5 py-1 border border-[#d1d5db] bg-white hover:bg-[#f9fafb] rounded text-[#4b5563] font-medium transition-colors"
                    title="Экспорт в JSON"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline text-[11px]">Экспорт</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Очистить весь глоссарий?')) {
                        onSaveGlossary([]);
                      }
                    }}
                    className="px-2 py-1 text-[#ef4444] hover:bg-[#fff5f5] rounded transition-colors text-[11px]"
                    title="Удалить все"
                  >
                    Очистить ({glossary.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Term Table / List Data Grid */}
          <div className="border border-[#d1d5db] rounded overflow-hidden">
            {filteredGlossary.length === 0 ? (
              <div className="p-6 text-center text-[#6b7280] text-xs space-y-1">
                <Info className="w-5 h-5 mx-auto text-[#9ca3af] mb-1.5" />
                <p className="font-medium text-[#1a1a1a]">Глоссарий пуст</p>
                <p className="text-[11px] text-[#6b7280]">
                  Добавьте термины выше или выберите типовой набор. Все термины будут строго соблюдаться моделью.
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-[#e5e7eb] text-xs">
                {filteredGlossary.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3.5 py-2 hover:bg-[#f9fafb] transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                      <div className="font-mono text-[#1a1a1a] truncate font-medium">
                        {item.source}
                      </div>
                      <div className="text-[#3b82f6] font-mono truncate font-medium">
                        → {item.target}
                      </div>
                      <div className="text-[#6b7280] text-[11px] truncate">
                        {item.comment || '—'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTerm(item.id)}
                      className="p-1 text-[#9ca3af] hover:text-[#ef4444] rounded transition-colors"
                      title="Удалить термин"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#6b7280]">
          <span className="font-mono text-[11px]">Total terms: {glossary.length}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-[#1a1a1a] hover:bg-black text-white rounded text-xs font-semibold transition-colors"
          >
            Готово
          </button>
        </div>

      </div>
    </div>
  );
};
