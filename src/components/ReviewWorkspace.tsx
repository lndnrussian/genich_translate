import React, { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  Check, 
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';
import { ReviewResult, TranslationSettings, GlossaryItem } from '../types';
import { requestReview } from '../services/api';

interface ReviewWorkspaceProps {
  settings: TranslationSettings;
  glossary: GlossaryItem[];
  onApplyImproved: (text: string) => void;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  settings,
  glossary,
  onApplyImproved,
}) => {
  const [sourceText, setSourceText] = useState('');
  const [draftText, setDraftText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [copiedImproved, setCopiedImproved] = useState(false);

  const handleRunReview = async () => {
    if (!sourceText.trim() || !draftText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestReview(sourceText, draftText, settings, glossary);
      setReviewResult(res);
    } catch (err: any) {
      setError(err.message || 'Ошибка при проведении рецензии.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyImproved = () => {
    if (!reviewResult?.improvedTranslation) return;
    navigator.clipboard.writeText(reviewResult.improvedTranslation);
    setCopiedImproved(true);
    setTimeout(() => setCopiedImproved(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3] font-mono font-semibold rounded text-[10px] uppercase">Критично</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-[#fffbeb] text-[#d97706] border border-[#fde68a] font-mono font-semibold rounded text-[10px] uppercase">Стилистика</span>;
      default:
        return <span className="px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] font-mono font-semibold rounded text-[10px] uppercase">Нюанс</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Intro info box */}
      <div className="bg-[#f9fafb] border border-[#d1d5db] rounded p-3 text-xs text-[#4b5563] flex items-start gap-2.5">
        <CheckSquare className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-[#1a1a1a]">
            Режим экспертной оценки и рецензирования существующего перевода
          </span>
          <p className="text-[#6b7280] text-xs mt-0.5 leading-relaxed">
            Вставьте оригинальный текст и черновой перевод. Модель проанализирует соответствие регистру «{settings.register}», терминологию глоссария и предложит выверенную редакцию.
          </p>
        </div>
      </div>

      {/* Input Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Source Box */}
        <div className="bg-white rounded border border-[#d1d5db] shadow-2xs flex flex-col min-h-[280px]">
          <div className="h-9 px-4 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center text-[10px] font-bold text-[#6b7280] uppercase tracking-wide">
            1. Оригинальный текст (Source)
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Вставьте исходный текст для сверки..."
            className="flex-1 p-4 text-sm text-[#1a1a1a] resize-none focus:outline-none leading-relaxed placeholder:text-[#9ca3af]"
          />
          <div className="h-8 px-4 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center text-[11px] font-mono text-[#6b7280]">
            {sourceText.length} chars
          </div>
        </div>

        {/* Draft Box */}
        <div className="bg-white rounded border border-[#d1d5db] shadow-2xs flex flex-col min-h-[280px]">
          <div className="h-9 px-4 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center text-[10px] font-bold text-[#6b7280] uppercase tracking-wide">
            2. Черновой перевод на рецензию (Draft)
          </div>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Вставьте существующий черновик перевода для детальной оценки..."
            className="flex-1 p-4 text-sm text-[#1a1a1a] resize-none focus:outline-none leading-relaxed placeholder:text-[#9ca3af]"
          />
          <div className="h-8 px-4 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center text-[11px] font-mono text-[#6b7280]">
            {draftText.length} chars
          </div>
        </div>

      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunReview}
          disabled={isLoading || !sourceText.trim() || !draftText.trim()}
          className={`flex items-center gap-2 px-5 py-2 rounded text-xs font-semibold shadow-xs transition-all ${
            isLoading || !sourceText.trim() || !draftText.trim()
              ? 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
              : 'bg-[#1a1a1a] hover:bg-black text-white active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3b82f6]" />
              <span>Рецензирование и лингвистический анализ...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Оценить и предложить правки</span>
            </>
          )}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-[#fff5f5] border border-[#fecaca] rounded text-xs text-[#b91c1c] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444]" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Report */}
      {reviewResult && (
        <div className="bg-white rounded border border-[#d1d5db] shadow-2xs p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          
          {/* Header & Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e7eb]">
            <div>
              <h3 className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#3b82f6]" />
                <span>Экспертное заключение редактора</span>
              </h3>
              <p className="text-[11px] text-[#6b7280] mt-0.5">
                Оценка качества, стилистических соответствий и идиоматичности
              </p>
            </div>

            <div className="flex items-center gap-2.5 bg-[#f9fafb] px-3 py-1.5 rounded border border-[#d1d5db]">
              <span className="text-[11px] text-[#6b7280] font-mono">Score:</span>
              <span className={`text-lg font-mono font-bold ${
                reviewResult.overallScore >= 8 ? 'text-[#10b981]' :
                reviewResult.overallScore >= 6 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
              }`}>
                {reviewResult.overallScore} / 10
              </span>
            </div>
          </div>

          {/* Editorial Summary */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block">
              Общая характеристика:
            </span>
            <p className="text-xs text-[#1a1a1a] leading-relaxed bg-[#f9fafb] p-3 rounded border border-[#e5e7eb]">
              {reviewResult.summary}
            </p>
          </div>

          {/* Strengths */}
          {reviewResult.strengths && reviewResult.strengths.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Сильные стороны перевода:</span>
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {reviewResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#ecfdf5] p-2 rounded border border-[#a7f3d0] text-[#065f46]">
                    <span className="text-[#10b981] font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Identified Issues Table */}
          {reviewResult.issues && reviewResult.issues.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block">
                Замечания и рекомендуемые правки ({reviewResult.issues.length}):
              </span>
              <div className="divide-y divide-[#e5e7eb] border border-[#d1d5db] rounded overflow-hidden">
                {reviewResult.issues.map((issue, idx) => (
                  <div key={idx} className="p-3 hover:bg-[#f9fafb] transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(issue.severity)}
                        <span className="text-[11px] font-mono text-[#6b7280]">Issue #{idx + 1}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-[#f9fafb] p-2 rounded border border-[#e5e7eb]">
                        <span className="text-[10px] text-[#6b7280] block font-mono uppercase">Оригинал:</span>
                        <span className="font-mono text-[#1a1a1a]">«{issue.original}»</span>
                      </div>
                      <div className="bg-[#fff1f2] p-2 rounded border border-[#fecdd3]">
                        <span className="text-[10px] text-[#e11d48] block font-mono uppercase">В черновике:</span>
                        <span className="text-[#9f1239] line-through">«{issue.draft}»</span>
                      </div>
                      <div className="bg-[#ecfdf5] p-2 rounded border border-[#a7f3d0]">
                        <span className="text-[10px] text-[#059669] block font-mono uppercase">Рекомендуется:</span>
                        <span className="font-semibold text-[#065f46]">«{issue.suggested}»</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#4b5563] pl-1">
                      {issue.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improved Translation Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Итоговая улучшенная редакция:</span>
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleCopyImproved}
                  className="flex items-center gap-1 px-2.5 py-1 border border-[#d1d5db] bg-white hover:bg-[#f9fafb] text-[#1a1a1a] rounded text-xs font-medium transition-colors"
                >
                  {copiedImproved ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5 text-[#6b7280]" />}
                  <span>{copiedImproved ? 'Скопировано' : 'Копировать'}</span>
                </button>
                <button
                  onClick={() => onApplyImproved(reviewResult.improvedTranslation)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#1a1a1a] hover:bg-black text-white rounded text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>В редактор</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-[#f9fafb] p-4 rounded border border-[#d1d5db] text-[#1a1a1a] text-sm leading-relaxed font-sans whitespace-pre-wrap">
              {reviewResult.improvedTranslation}
            </div>
          </div>

          {/* Footer Stats / Model Badge */}
          <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#6b7280]">
            <div className="flex items-center gap-2.5">
              {reviewResult.usedModel && (
                reviewResult.wasFallback ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[10px] font-mono font-medium shadow-2xs" title="Основная модель была временно перегружена, использована резервная модель">
                    ⚠ Резервная модель: {reviewResult.usedModel}
                  </span>
                ) : (
                  <span className="text-[#6b7280] font-mono text-[11px]">
                    Модель: {reviewResult.usedModel}
                  </span>
                )
              )}
            </div>

            {reviewResult.processingTimeMs && reviewResult.processingTimeMs > 0 && (
              <span className="text-[#6b7280] font-mono text-[11px]">
                Latency: {(reviewResult.processingTimeMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
