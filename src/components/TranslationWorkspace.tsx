import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Trash2, 
  ClipboardPaste, 
  Type, 
  Download, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Edit3,
  BookOpen
} from 'lucide-react';
import { formatRussianTypography, formatEnglishTypography, detectLanguage } from '../utils/typography';
import { TranslationSettings } from '../types';

interface TranslationWorkspaceProps {
  sourceText: string;
  onChangeSourceText: (text: string) => void;
  translatedText: string;
  onChangeTranslatedText: (text: string) => void;
  onTranslate: () => void;
  isLoading: boolean;
  settings: TranslationSettings;
  processingTimeMs?: number;
  detectedDirection?: 'ru-en' | 'en-ru';
}

const SAMPLE_TEXTS: Array<{ label: string; text: string; dir: 'ru-en' | 'en-ru' }> = [
  {
    label: 'Художественная проза (RU → EN)',
    dir: 'ru-en',
    text: 'Вечерний Петербург дышал сыростью и холодным гранитом. Он стоял на набережной, чувствуя, как время утекает сквозь пальцы, словно невская вода, и думал о том, что всё произошедшее было не случайностью, а неизбежной платой за гордость.',
  },
  {
    label: 'Идиомы и реалии (EN → RU)',
    dir: 'en-ru',
    text: 'Let\'s not beat around the bush — our competitor just pulled a rabbit out of a hat with their new product release. We need to bite the bullet, burn the midnight oil, and hit the ground running tomorrow morning.',
  },
  {
    label: 'Маркетинг и копирайтинг (RU → EN)',
    dir: 'ru-en',
    text: 'Мы создаем инструменты, которые не просто экономят ваше время, а возвращают радость чистого творчества. Никакой рутины — только безупречный результат с первого клика.',
  },
  {
    label: 'Деловые переговоры (EN → RU)',
    dir: 'en-ru',
    text: 'Pursuant to our prior discussion, we would like to reiterate our commitment to the proposed partnership, subject to mutually agreeable indemnification clauses and due diligence findings.',
  },
];

export const TranslationWorkspace: React.FC<TranslationWorkspaceProps> = ({
  sourceText,
  onChangeSourceText,
  translatedText,
  onChangeTranslatedText,
  onTranslate,
  isLoading,
  settings,
  processingTimeMs,
  detectedDirection,
}) => {
  const [copied, setCopied] = useState(false);
  const [typographyApplied, setTypographyApplied] = useState(false);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-detect language
  const detectedLang = detectLanguage(sourceText);

  // Ctrl/Cmd + Enter to trigger translation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isLoading && sourceText.trim()) {
          onTranslate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, sourceText, onTranslate]);

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeSourceText(text);
      }
    } catch {
      // Fallback
    }
  };

  const handleApplyTypography = () => {
    if (!translatedText) return;
    // Determine whether target is Russian or English
    const targetIsRu = detectedDirection === 'en-ru' || settings.direction === 'en-ru';
    const formatted = targetIsRu
      ? formatRussianTypography(translatedText, settings.typography)
      : formatEnglishTypography(translatedText);

    onChangeTranslatedText(formatted);
    setTypographyApplied(true);
    setTimeout(() => setTypographyApplied(false), 2000);
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translation_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sourceWords = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const targetWords = translatedText.trim() ? translatedText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      
      {/* Sample text bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#6b7280]">
          <BookOpen className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Примеры:</span>
          <div className="flex flex-wrap gap-1">
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => onChangeSourceText(sample.text)}
                className="px-2 py-0.5 bg-white hover:bg-[#f3f4f6] text-[#4b5563] border border-[#d1d5db] rounded text-[11px] font-medium transition-colors"
              >
                {sample.label.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[#6b7280] font-mono text-[11px] hidden sm:flex items-center gap-1.5">
          <span className="opacity-70">Клавиши:</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-[#d1d5db] rounded text-[10px] text-[#1a1a1a] font-semibold">
            ⌘ / Ctrl + Enter
          </kbd>
        </div>
      </div>

      {/* Main Dual Editor Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Source Text Panel */}
        <div className="bg-white rounded border border-[#d1d5db] shadow-2xs flex flex-col min-h-[380px] sm:min-h-[420px] focus-within:border-[#1a1a1a] transition-all">
          
          {/* Source Header */}
          <div className="h-10 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide">
                Исходный текст ({detectedLang === 'ru' ? 'RU' : detectedLang === 'en' ? 'EN' : 'AUTO'})
              </span>
              {detectedLang !== 'unknown' && (
                <span className="px-1.5 py-0.2 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] rounded text-[10px] font-mono font-medium">
                  {detectedLang === 'ru' ? 'Кириллица' : 'Latin'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[#6b7280]">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-2 py-1 hover:bg-white border border-transparent hover:border-[#d1d5db] rounded transition-colors text-xs text-[#1a1a1a]"
                title="Вставить из буфера"
              >
                <ClipboardPaste className="w-3 h-3 text-[#6b7280]" />
                <span className="text-[11px]">Вставить</span>
              </button>
              {sourceText && (
                <button
                  onClick={() => onChangeSourceText('')}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-white border border-transparent hover:border-[#d1d5db] rounded transition-colors text-xs text-[#ef4444]"
                  title="Очистить поле"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="text-[11px]">Очистить</span>
                </button>
              )}
            </div>
          </div>

          {/* Source Textarea */}
          <textarea
            ref={sourceTextareaRef}
            id="source-text-input"
            value={sourceText}
            onChange={(e) => onChangeSourceText(e.target.value)}
            placeholder="Введите текст для перевода..."
            className="flex-1 w-full p-5 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] resize-none focus:outline-none font-sans leading-relaxed"
          />

          {/* Source Footer Stats & Translate CTA */}
          <div className="h-11 px-4 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#6b7280] shrink-0">
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>{sourceText.length} chars</span>
              <span>•</span>
              <span>{sourceWords} words</span>
            </div>

            <button
              id="submit-translate-btn"
              onClick={onTranslate}
              disabled={isLoading || !sourceText.trim()}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-semibold shadow-xs transition-all ${
                isLoading || !sourceText.trim()
                  ? 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                  : 'bg-[#1a1a1a] hover:bg-black text-white active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3b82f6]" />
                  <span>Обработка...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span>Перевести</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Translation Output Panel (In-place editable) */}
        <div className="bg-[#fcfcfc] rounded border border-[#d1d5db] shadow-2xs flex flex-col min-h-[380px] sm:min-h-[420px] focus-within:border-[#1a1a1a] transition-all">
          
          {/* Output Header */}
          <div className="h-10 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide">
                Результат перевода
              </span>
              {detectedDirection && (
                <span className="px-1.5 py-0.2 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] font-mono font-medium rounded text-[10px] uppercase">
                  {detectedDirection}
                </span>
              )}
            </div>

            {/* Output Tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleApplyTypography}
                disabled={!translatedText}
                className={`flex items-center gap-1 px-2 py-0.5 border border-[#d1d5db] rounded text-xs transition-colors bg-white ${
                  typographyApplied
                    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                    : 'text-[#4b5563] hover:bg-[#f9fafb]'
                }`}
                title="Применить русскую типографику"
              >
                <Type className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-[11px] font-medium hidden sm:inline">
                  {typographyApplied ? 'Типографика OK' : 'Типографика'}
                </span>
              </button>

              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className={`flex items-center gap-1 px-2.5 py-0.5 border border-[#d1d5db] rounded text-xs transition-colors bg-white ${
                  copied
                    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                    : 'text-[#1a1a1a] hover:bg-[#f9fafb]'
                }`}
                title="Скопировать перевод"
              >
                {copied ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3 text-[#6b7280]" />}
                <span className="text-[11px] font-medium">{copied ? 'Готово' : 'Копия'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!translatedText}
                className="p-1 border border-[#d1d5db] bg-white hover:bg-[#f9fafb] rounded text-[#4b5563] transition-colors"
                title="Скачать .txt"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Output Editable Textarea */}
          <div className="flex-1 flex flex-col relative bg-[#fcfcfc]">
            <textarea
              id="translated-text-output"
              value={translatedText}
              onChange={(e) => onChangeTranslatedText(e.target.value)}
              placeholder={isLoading ? "Выполняется перевод с учётом всех параметров..." : "Здесь появится перевод (поле доступно для ручной правки)..."}
              className="flex-1 w-full p-5 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] resize-none focus:outline-none font-sans leading-relaxed bg-transparent"
            />
          </div>

          {/* Output Footer Stats */}
          <div className="h-11 px-4 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#6b7280] shrink-0">
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>{translatedText.length} chars</span>
              <span>•</span>
              <span>{targetWords} words</span>
            </div>

            {processingTimeMs && processingTimeMs > 0 && (
              <span className="text-[#6b7280] font-mono text-[11px]">
                Latency: {(processingTimeMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
