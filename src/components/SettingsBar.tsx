import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Type as TypeIcon, 
  FileCode, 
  HelpCircle,
  Sparkles,
  Layers,
  RotateCcw
} from 'lucide-react';
import { 
  TranslationSettings, 
  TranslationRegister, 
  TargetAudience, 
  SpeakerGender, 
  AddresseeGender, 
  FormalityAddress 
} from '../types';

interface SettingsBarProps {
  settings: TranslationSettings;
  onUpdateSettings: (newSettings: Partial<TranslationSettings>) => void;
  onResetSettings: () => void;
}

const REGISTERS: Array<{ id: TranslationRegister; label: string; desc: string }> = [
  { id: 'neutral', label: 'Нейтральный', desc: 'Сбалансированный литературный язык' },
  { id: 'literary', label: 'Художественный', desc: 'Богатый слог, ритмика и метафоры' },
  { id: 'conversational', label: 'Разговорный', desc: 'Живая речь, современные идиомы' },
  { id: 'marketing', label: 'Маркетинг', desc: 'Убедительный, динамичный копирайтинг' },
  { id: 'formal', label: 'Официально-деловой', desc: 'Строгий юридический/корпоративный стиль' },
  { id: 'technical', label: 'Технический', desc: 'Однозначность терминов и синтаксиса' },
];

const AUDIENCES: Array<{ id: TargetAudience; label: string }> = [
  { id: 'general', label: 'Общая аудитория' },
  { id: 'professional', label: 'Специалисты / Профессионалы' },
  { id: 'youth', label: 'Молодёжная / Неформальная' },
  { id: 'executive', label: 'Топ-менеджмент / Руководство' },
  { id: 'kids', label: 'Детская / Семейная' },
];

const LITERALITY_LABELS: Record<number, { title: string; desc: string }> = {
  1: { title: '1 — Буквально', desc: 'Максимально точное следование синтаксису оригинала' },
  2: { title: '2 — Близко к тексту', desc: 'Верность тексту с аккуратной адаптацией' },
  3: { title: '3 — Сбалансированно', desc: 'Золотой стандарт: естественность без искажений' },
  4: { title: '4 — Вольно / Идиоматично', desc: 'Приоритет естественности звучания и фразеологии' },
  5: { title: '5 — Транскреация', desc: 'Передача духа и глубокая культурная адаптация' },
};

export const SettingsBar: React.FC<SettingsBarProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="bg-white border-b border-[#d1d5db] py-2 px-4 sm:px-6 shrink-0">
      <div className="max-w-7xl mx-auto space-y-2">
        
        {/* Main Row: Register, Audience, Literality Slider, Advanced Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Register Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
              Регистр:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {REGISTERS.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => onUpdateSettings({ register: reg.id })}
                  title={reg.desc}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap border ${
                    settings.register === reg.id
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-xs'
                      : 'bg-white text-[#4b5563] border-[#d1d5db] hover:bg-[#f9fafb]'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
              Аудитория:
            </span>
            <select
              value={settings.targetAudience}
              onChange={(e) => onUpdateSettings({ targetAudience: e.target.value as TargetAudience })}
              className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-xs rounded px-2.5 py-1 focus:ring-1 focus:ring-[#3b82f6] focus:outline-none cursor-pointer"
            >
              {AUDIENCES.map((aud) => (
                <option key={aud.id} value={aud.id}>
                  {aud.label}
                </option>
              ))}
            </select>
          </div>

          {/* Literality Slider */}
          <div className="flex items-center gap-2.5 bg-[#f9fafb] px-3 py-1 rounded border border-[#d1d5db]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                Буквальность:
              </span>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={settings.literality}
                onChange={(e) => onUpdateSettings({ literality: parseInt(e.target.value, 10) })}
                className="w-24 sm:w-32 h-1 bg-[#d1d5db] rounded appearance-none cursor-pointer accent-[#3b82f6]"
                title={LITERALITY_LABELS[settings.literality].desc}
              />
              <span className="text-xs font-mono font-bold text-[#3b82f6] min-w-[20px]">
                {settings.literality}.0
              </span>
              <span className="text-[11px] text-[#4b5563] hidden md:inline">
                ({LITERALITY_LABELS[settings.literality].title.split('— ')[1]})
              </span>
            </div>
          </div>

          {/* Advanced toggle & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                isAdvancedOpen
                  ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                  : 'bg-white text-[#4b5563] border-[#d1d5db] hover:bg-[#f9fafb]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Параметры</span>
              {isAdvancedOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={onResetSettings}
              className="p-1 text-[#9ca3af] hover:text-[#1a1a1a] border border-transparent hover:border-[#d1d5db] rounded transition-colors"
              title="Сбросить настройки к стандартным"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Expandable Advanced Options Grid */}
        {isAdvancedOpen && (
          <div className="pt-2 pb-1 border-t border-[#e5e7eb] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            
            {/* Column 1: Gender & Address */}
            <div className="bg-[#f9fafb] rounded border border-[#d1d5db] overflow-hidden">
              <div className="px-3 py-1.5 bg-white border-b border-[#e5e7eb] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#3b82f6]" />
                  Гендер и обращение (RU)
                </span>
              </div>
              
              <div className="p-2.5 space-y-2 bg-[#f9fafb]">
                <div>
                  <label className="text-[10px] text-[#6b7280] uppercase font-medium block mb-0.5">Говорящий (1-е лицо):</label>
                  <select
                    value={settings.speakerGender}
                    onChange={(e) => onUpdateSettings({ speakerGender: e.target.value as SpeakerGender })}
                    className="w-full bg-white border border-[#d1d5db] text-[#1a1a1a] text-xs rounded px-2 py-1"
                  >
                    <option value="unspecified">По контексту</option>
                    <option value="male">Мужской («я сказал»)</option>
                    <option value="female">Женский («я сказала»)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#6b7280] uppercase font-medium block mb-0.5">Адресат (2-е лицо):</label>
                  <select
                    value={settings.addresseeGender}
                    onChange={(e) => onUpdateSettings({ addresseeGender: e.target.value as AddresseeGender })}
                    className="w-full bg-white border border-[#d1d5db] text-[#1a1a1a] text-xs rounded px-2 py-1"
                  >
                    <option value="unspecified">По контексту</option>
                    <option value="male">Мужской («ты готов»)</option>
                    <option value="female">Женский («ты готова»)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#6b7280] uppercase font-medium block mb-0.5">Форма обращения:</label>
                  <select
                    value={settings.formalityAddress}
                    onChange={(e) => onUpdateSettings({ formalityAddress: e.target.value as FormalityAddress })}
                    className="w-full bg-white border border-[#d1d5db] text-[#1a1a1a] text-xs rounded px-2 py-1"
                  >
                    <option value="neutral">Нейтрально</option>
                    <option value="formal_vy">На «Вы» (деловое)</option>
                    <option value="informal_ty">На «ты» (неформальное)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Column 2: Typography Localization */}
            <div className="bg-[#f9fafb] rounded border border-[#d1d5db] overflow-hidden">
              <div className="px-3 py-1.5 bg-white border-b border-[#e5e7eb] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
                  <TypeIcon className="w-3 h-3 text-[#3b82f6]" />
                  Типографика и нормы
                </span>
              </div>

              <div className="p-2.5 space-y-1.5 bg-[#f9fafb]">
                <label className="flex items-center justify-between cursor-pointer py-0.5">
                  <span className="text-xs text-[#1a1a1a]">Кавычки «ёлочки» / „лапки“</span>
                  <input
                    type="checkbox"
                    checked={settings.typography.useRussianQuotes}
                    onChange={(e) =>
                      onUpdateSettings({
                        typography: { ...settings.typography, useRussianQuotes: e.target.checked },
                      })
                    }
                    className="accent-[#1a1a1a] h-3.5 w-3.5 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-0.5">
                  <span className="text-xs text-[#1a1a1a]">Длинное тире (« — »)</span>
                  <input
                    type="checkbox"
                    checked={settings.typography.useEmDash}
                    onChange={(e) =>
                      onUpdateSettings({
                        typography: { ...settings.typography, useEmDash: e.target.checked },
                      })
                    }
                    className="accent-[#1a1a1a] h-3.5 w-3.5 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-0.5">
                  <span className="text-xs text-[#1a1a1a]">Неразрывные пробелы (nbsp)</span>
                  <input
                    type="checkbox"
                    checked={settings.typography.useNonBreakingSpaces}
                    onChange={(e) =>
                      onUpdateSettings({
                        typography: { ...settings.typography, useNonBreakingSpaces: e.target.checked },
                      })
                    }
                    className="accent-[#1a1a1a] h-3.5 w-3.5 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-0.5">
                  <span className="text-xs text-[#1a1a1a]">Точка после кавычки («слово».)</span>
                  <input
                    type="checkbox"
                    checked={settings.typography.correctPunctuationOrder}
                    onChange={(e) =>
                      onUpdateSettings({
                        typography: { ...settings.typography, correctPunctuationOrder: e.target.checked },
                      })
                    }
                    className="accent-[#1a1a1a] h-3.5 w-3.5 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Column 3: Formatting & Markup */}
            <div className="bg-[#f9fafb] rounded border border-[#d1d5db] overflow-hidden">
              <div className="px-3 py-1.5 bg-white border-b border-[#e5e7eb] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
                  <FileCode className="w-3 h-3 text-[#3b82f6]" />
                  Разметка и код
                </span>
              </div>

              <div className="p-2.5 space-y-2 bg-[#f9fafb]">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preserveFormatting}
                    onChange={(e) => onUpdateSettings({ preserveFormatting: e.target.checked })}
                    className="accent-[#1a1a1a] h-3.5 w-3.5 rounded mt-0.5"
                  />
                  <div className="text-[#1a1a1a]">
                    <span className="font-semibold block text-xs">Сохранять разметку</span>
                    <span className="text-[#6b7280] text-[10px] leading-tight block mt-0.5">
                      Markdown, ссылки и HTML-теги остаются нетронутыми
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Column 4: Decisions & Alternatives */}
            <div className="bg-[#f9fafb] rounded border border-[#d1d5db] overflow-hidden">
              <div className="px-3 py-1.5 bg-white border-b border-[#e5e7eb] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#3b82f6]" />
                  Анализ и вариативность
                </span>
              </div>

              <div className="p-2.5 space-y-2 bg-[#f9fafb]">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.explainDecisions}
                    onChange={(e) => onUpdateSettings({ explainDecisions: e.target.checked })}
                    className="accent-[#1a1a1a] h-3.5 w-3.5 rounded mt-0.5"
                  />
                  <div className="text-[#1a1a1a]">
                    <span className="font-semibold block text-xs">Объяснение решений</span>
                    <span className="text-[#6b7280] text-[10px] leading-tight block mt-0.5">
                      Обоснование идиом и культурных адаптаций
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.provideAlternatives}
                    onChange={(e) => onUpdateSettings({ provideAlternatives: e.target.checked })}
                    className="accent-[#1a1a1a] h-3.5 w-3.5 rounded mt-0.5"
                  />
                  <div className="text-[#1a1a1a]">
                    <span className="font-semibold block text-xs">Альтернативные варианты</span>
                    <span className="text-[#6b7280] text-[10px] leading-tight block mt-0.5">
                      2–3 оттенка для сложных фраз
                    </span>
                  </div>
                </label>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
