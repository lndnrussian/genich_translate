import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SettingsBar } from './components/SettingsBar';
import { TranslationWorkspace } from './components/TranslationWorkspace';
import { DecisionsAndAlternatives } from './components/DecisionsAndAlternatives';
import { ReviewWorkspace } from './components/ReviewWorkspace';
import { GlossaryModal } from './components/GlossaryModal';
import { HistoryModal } from './components/HistoryModal';
import { FutureExtensionsBanner } from './components/FutureExtensionsBanner';
import { 
  TranslationSettings, 
  GlossaryItem, 
  HistoryItem, 
  TranslationResult 
} from './types';
import { 
  getSavedSettings, 
  saveSettings, 
  DEFAULT_SETTINGS, 
  getGlossary, 
  saveGlossary, 
  getHistory, 
  saveHistoryItem, 
  deleteHistoryItem, 
  toggleStarredHistory, 
  clearHistory 
} from './utils/storage';
import { requestTranslation } from './services/api';
import { AlertCircle, RefreshCw, Zap, Info } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<TranslationSettings>(getSavedSettings);
  const [glossary, setGlossary] = useState<GlossaryItem[]>(getGlossary);
  const [history, setHistory] = useState<HistoryItem[]>(getHistory);

  const [activeMode, setActiveMode] = useState<'translate' | 'review'>('translate');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Save settings when modified
  const handleUpdateSettings = (newSettings: Partial<TranslationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  const handleSaveGlossary = (newGlossary: GlossaryItem[]) => {
    setGlossary(newGlossary);
    saveGlossary(newGlossary);
  };

  // Perform translation with optional model or settings override
  const handleTranslate = useCallback(async (overrideSettings?: Partial<TranslationSettings>) => {
    if (!sourceText.trim() || isLoading) return;

    const currentSettings = overrideSettings ? { ...settings, ...overrideSettings } : settings;
    if (overrideSettings) {
      handleUpdateSettings(overrideSettings);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestTranslation(sourceText, currentSettings, glossary);
      setTranslationResult(result);
      setTranslatedText(result.translation);

      // Save to history
      const historyItem: HistoryItem = {
        id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        sourceText,
        translatedText: result.translation,
        direction: currentSettings.direction,
        detectedDirection: result.detectedDirection,
        register: currentSettings.register,
        literality: currentSettings.literality,
        decisionsCount: result.decisions?.length || 0,
        settingsSnapshot: { ...currentSettings },
      };

      saveHistoryItem(historyItem);
      setHistory(getHistory());
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err.message || 'Ошибка соединения при выполнении перевода.');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, isLoading, settings, glossary, handleUpdateSettings]);

  // Apply alternative variant into active translated text
  const handleApplyAlternative = (originalFragment: string, replacement: string) => {
    if (!translatedText) return;
    // Replace the first or matching occurrence
    if (translatedText.includes(originalFragment)) {
      setTranslatedText(translatedText.replace(originalFragment, replacement));
    } else {
      // If direct match was not found due to manual edits, provide gentle feedback
      setTranslatedText((prev) => prev + '\n' + replacement);
    }
  };

  // Restore session from history
  const handleRestoreFromHistory = (item: HistoryItem) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    if (item.settingsSnapshot) {
      handleUpdateSettings(item.settingsSnapshot);
    }
    setActiveMode('translate');
  };

  // History controls
  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleToggleStarHistory = (id: string) => {
    const updated = toggleStarredHistory(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // Switch from review to translate with improved text
  const handleApplyImprovedReview = (improvedText: string) => {
    setTranslatedText(improvedText);
    setActiveMode('translate');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] flex flex-col font-sans antialiased">
      
      {/* Top Navigation */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        activeMode={activeMode}
        onChangeMode={setActiveMode}
        glossaryCount={glossary.length}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        detectedDir={translationResult?.detectedDirection}
      />

      {/* Settings Bar */}
      <SettingsBar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-4">
        
        {/* Error notification with action buttons */}
        {error && (
          <div className="p-3.5 bg-[#fff5f5] border border-[#fecaca] rounded text-xs text-[#b91c1c] space-y-2.5 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-[#9ca3af] hover:text-[#4b5563] text-xs font-mono shrink-0 cursor-pointer"
                title="Скрыть"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-[#fee2e2]">
              <button
                onClick={() => handleTranslate()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium rounded text-[11px] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Повторить запрос</span>
              </button>

              {settings.model !== 'gemini-3.1-flash-lite' && (
                <button
                  onClick={() => handleTranslate({ model: 'gemini-3.1-flash-lite' })}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#fef2f2] text-[#b91c1c] border border-[#fca5a5] font-medium rounded text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3 h-3 text-[#ea580c]" />
                  <span>Переключить на Gemini 3.1 Flash-Lite и повторить</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fallback notice */}
        {translationResult?.wasFallback && (
          <div className="px-3.5 py-2.5 bg-[#fefce8] border border-[#fef08a] rounded text-xs text-[#854d0e] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#eab308] shrink-0" />
              <span>
                Основная модель была временно перегружена. Перевод успешно выполнен с помощью резервной модели <strong>{translationResult.usedModel}</strong>.
              </span>
            </div>
            <button
              onClick={() => setTranslationResult(prev => prev ? { ...prev, wasFallback: false } : null)}
              className="text-[#a16207] hover:text-[#713f12] text-xs font-mono shrink-0 cursor-pointer ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* View 1: Standard Translation Mode */}
        {activeMode === 'translate' && (
          <div className="space-y-4">
            <TranslationWorkspace
              sourceText={sourceText}
              onChangeSourceText={setSourceText}
              translatedText={translatedText}
              onChangeTranslatedText={setTranslatedText}
              onTranslate={handleTranslate}
              isLoading={isLoading}
              settings={settings}
              processingTimeMs={translationResult?.processingTimeMs}
              detectedDirection={translationResult?.detectedDirection}
            />

            {/* Explanations and Alternatives */}
            {translationResult && (
              <DecisionsAndAlternatives
                decisions={translationResult.decisions || []}
                alternatives={translationResult.alternatives || []}
                generalNotes={translationResult.generalNotes}
                onApplyAlternative={handleApplyAlternative}
              />
            )}
          </div>
        )}

        {/* View 2: Review / Comparison Mode */}
        {activeMode === 'review' && (
          <ReviewWorkspace
            settings={settings}
            glossary={glossary}
            onApplyImproved={handleApplyImprovedReview}
          />
        )}

        {/* Project Architecture & Extension Roadmap */}
        <FutureExtensionsBanner />

      </main>

      {/* Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        glossary={glossary}
        onSaveGlossary={handleSaveGlossary}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreFromHistory}
        onDelete={handleDeleteHistory}
        onToggleStar={handleToggleStarHistory}
        onClearAll={handleClearAllHistory}
      />

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-white py-2.5 text-xs text-[#6b7280]">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
          <div>
            RU ↔ EN Translation Studio • Technical Data Grid Interface
          </div>
          <div className="flex items-center gap-2.5">
            <span>Model: {settings.model}</span>
            <span className="text-[#d1d5db]">•</span>
            <span>Glossary: {glossary.length}</span>
            <span className="text-[#d1d5db]">•</span>
            <span>History: {history.length}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
