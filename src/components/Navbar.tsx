import React from 'react';
import { 
  Languages, 
  ArrowLeftRight, 
  BookOpen, 
  History, 
  CheckSquare, 
  Sparkles,
  Cpu
} from 'lucide-react';
import { TranslationDirection, TranslationSettings } from '../types';

interface NavbarProps {
  settings: TranslationSettings;
  onUpdateSettings: (newSettings: Partial<TranslationSettings>) => void;
  activeMode: 'translate' | 'review';
  onChangeMode: (mode: 'translate' | 'review') => void;
  glossaryCount: number;
  onOpenGlossary: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  detectedDir?: 'ru-en' | 'en-ru';
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  activeMode,
  onChangeMode,
  glossaryCount,
  onOpenGlossary,
  historyCount,
  onOpenHistory,
  detectedDir,
}) => {
  const toggleDirection = () => {
    if (settings.direction === 'ru-en') {
      onUpdateSettings({ direction: 'en-ru' });
    } else if (settings.direction === 'en-ru') {
      onUpdateSettings({ direction: 'ru-en' });
    } else {
      // If was auto, swap based on detected or default to en-ru
      onUpdateSettings({ direction: detectedDir === 'ru-en' ? 'en-ru' : 'ru-en' });
    }
  };

  return (
    <header className="h-14 border-b border-[#d1d5db] bg-white sticky top-0 z-30 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Left: Brand / System info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs tracking-wider">LT</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-base sm:text-lg tracking-tight text-[#1a1a1a]">
              Linguist<span className="text-[#3b82f6]">Pro</span>
            </span>
            <span className="text-xs font-mono text-[#6b7280] ml-2 hidden sm:inline">
              RU ↔ EN Studio
            </span>
          </div>

          <div className="h-5 w-px bg-[#d1d5db] mx-1 hidden md:block"></div>

          <div className="hidden md:flex items-center gap-2 text-xs text-[#4b5563]">
            <span className="bg-[#eff6ff] text-[#1d4ed8] px-2 py-0.5 rounded text-[11px] font-medium border border-[#bfdbfe]">
              v2.4.1
            </span>
            <span className="text-[11px] text-[#6b7280] font-mono">
              {settings.model.replace('gemini-', 'Gemini-')}
            </span>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center bg-[#f3f4f6] p-0.5 rounded border border-[#d1d5db] text-xs">
          <button
            id="mode-translate-btn"
            onClick={() => onChangeMode('translate')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeMode === 'translate'
                ? 'bg-[#1a1a1a] text-white shadow-xs'
                : 'text-[#4b5563] hover:text-[#1a1a1a]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Переводчик</span>
          </button>
          <button
            id="mode-review-btn"
            onClick={() => onChangeMode('review')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeMode === 'review'
                ? 'bg-[#1a1a1a] text-white shadow-xs'
                : 'text-[#4b5563] hover:text-[#1a1a1a]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Рецензия</span>
          </button>
        </div>

        {/* Right: Technical Controls & Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Direction Segmented Control */}
          <div className="hidden lg:flex items-center bg-[#f9fafb] rounded border border-[#d1d5db] text-xs font-mono p-0.5">
            <button
              onClick={() => onUpdateSettings({ direction: 'auto' })}
              className={`px-2 py-0.5 rounded transition-colors ${
                settings.direction === 'auto'
                  ? 'bg-[#1a1a1a] text-white font-medium'
                  : 'text-[#4b5563] hover:text-[#1a1a1a]'
              }`}
              title="Автоопределение языка"
            >
              AUTO
            </button>
            <button
              onClick={() => onUpdateSettings({ direction: 'ru-en' })}
              className={`px-2 py-0.5 rounded transition-colors ${
                settings.direction === 'ru-en'
                  ? 'bg-[#1a1a1a] text-white font-medium'
                  : 'text-[#4b5563] hover:text-[#1a1a1a]'
              }`}
            >
              RU → EN
            </button>
            <button
              onClick={toggleDirection}
              className="p-1 text-[#6b7280] hover:text-[#1a1a1a] rounded transition-colors"
              title="Поменять направление"
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onUpdateSettings({ direction: 'en-ru' })}
              className={`px-2 py-0.5 rounded transition-colors ${
                settings.direction === 'en-ru'
                  ? 'bg-[#1a1a1a] text-white font-medium'
                  : 'text-[#4b5563] hover:text-[#1a1a1a]'
              }`}
            >
              EN → RU
            </button>
          </div>

          {/* Glossary Button */}
          <button
            id="open-glossary-btn"
            onClick={onOpenGlossary}
            className="px-3 py-1.5 text-xs font-medium border border-[#d1d5db] rounded hover:bg-gray-50 bg-white text-[#1a1a1a] flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Глоссарий</span>
            <span className="font-mono text-[#6b7280]">({glossaryCount})</span>
          </button>

          {/* History Button */}
          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="px-3 py-1.5 text-xs font-medium border border-[#d1d5db] rounded hover:bg-gray-50 bg-white text-[#1a1a1a] flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#6b7280]" />
            <span className="hidden sm:inline">История</span>
            {historyCount > 0 && (
              <span className="font-mono text-[#6b7280]">({historyCount})</span>
            )}
          </button>

          {/* Model Switcher */}
          <div className="hidden xl:flex items-center gap-1.5 border border-[#d1d5db] rounded px-2 py-1 bg-white text-xs">
            <Cpu className="w-3.5 h-3.5 text-[#3b82f6]" />
            <select
              value={settings.model}
              onChange={(e) => onUpdateSettings({ model: e.target.value })}
              className="bg-transparent text-[#1a1a1a] font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
            </select>
          </div>

        </div>

      </div>
    </header>
  );
};
