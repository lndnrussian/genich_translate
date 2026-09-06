import React, { useState } from 'react';
import { 
  FolderTree, 
  FileText, 
  FileCode, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Cpu,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const FutureExtensionsBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-[#d1d5db] rounded overflow-hidden shadow-2xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors border-b border-transparent"
      >
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#1a1a1a]">
            Архитектура системы и точки расширения (.docx, .srt, chunking, TMX)
          </span>
          <span className="px-2 py-0.5 bg-[#eff6ff] text-[#1d4ed8] text-[10px] font-mono font-semibold rounded border border-[#bfdbfe]">
            ROADMAP & ARCH
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#6b7280] font-mono">
          <span>{isOpen ? 'COLLAPSE' : 'EXPAND'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-[#e5e7eb] bg-white space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Realized in MVP */}
            <div className="bg-[#f0fdf4] p-3.5 rounded border border-[#bbf7d0] space-y-2">
              <div className="flex items-center gap-1.5 text-[#166534] font-semibold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>Реализовано в текущей системе:</span>
              </div>
              <ul className="space-y-1 text-xs text-[#14532d]">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Двунаправленный перевод RU ↔ EN с автоопределением направления</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Выбор из 6 регистров/стилей и 5 типов целевой аудитории</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Шкала буквальности (1–5) от подстрочника до глубокой адаптации</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Учёт гендера говорящего/адресата и формы вежливости («Вы» vs «ты»)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Глоссарий терминов со строгим инъецированием в промпт модели</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Экспликация решений (идиомы, реалии) и интерактивные альтернативы</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Режим рецензирования и экспертной оценки стороннего перевода</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#16a34a] font-bold">•</span>
                  <span>Нормализация русской типографики («ёлочки», длинное тире, неразрывные пробелы)</span>
                </li>
              </ul>
            </div>

            {/* Next Steps / Architectural extensions */}
            <div className="bg-[#eff6ff] p-3.5 rounded border border-[#bfdbfe] space-y-2">
              <div className="flex items-center gap-1.5 text-[#1e40af] font-semibold text-xs uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Точки расширения для следующего этапа:</span>
              </div>
              <ul className="space-y-2 text-xs text-[#1e3a8a]">
                <li className="space-y-0.5">
                  <span className="font-semibold block text-[#1e40af]">1. Парсер документов (.docx, .srt, .txt)</span>
                  <p className="text-[#4b5563] text-[11px] leading-relaxed">
                    Модуль <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#bfdbfe] text-[#1d4ed8]">src/utils/documentParser.ts</code> (библиотека mammoth для docx и парсер srt субтитров с таймкодами) для извлечения сегментов без потери метаданных.
                  </p>
                </li>
                <li className="space-y-0.5">
                  <span className="font-semibold block text-[#1e40af]">2. Чанкер с контекстным буфером (Sliding Context Window)</span>
                  <p className="text-[#4b5563] text-[11px] leading-relaxed">
                    Разбиение больших массивов текста на сегменты по 800–1200 слов с передачей в модель краткого содержания предшествующего сегмента (summary) и реестра сущностей.
                  </p>
                </li>
                <li className="space-y-0.5">
                  <span className="font-semibold block text-[#1e40af]">3. Экспорт TMX / XLIFF для CAT-инструментов</span>
                  <p className="text-[#4b5563] text-[11px] leading-relaxed">
                    Экспорт двуязычных сегментов в отраслевой формат TMX для импорта в Smartcat, Trados или memoQ.
                  </p>
                </li>
              </ul>
            </div>

          </div>

          {/* Code Structure Outline */}
          <div className="bg-[#f9fafb] p-3 rounded border border-[#d1d5db] text-xs font-mono text-[#374151]">
            <div className="text-[#6b7280] font-sans font-semibold mb-1 text-[11px] uppercase tracking-wider">
              Структура компонентов проекта:
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-[#1a1a1a]">
{`/server.ts                         // Express backend: /api/translate, /api/review (Gemini GenAI SDK)
/src/
  ├── types.ts                     // Интерфейсы: TranslationSettings, Glossary, Decisions, Review
  ├── utils/
  │    ├── typography.ts           // Русская типографика (кавычки «ёлочки», тире —, nbsp)
  │    └── storage.ts              // Хранилище localStorage (сессии, терминологическая база)
  ├── services/
  │    └── api.ts                  // HTTP-клиент API перевода и рецензирования
  ├── components/
  │    ├── Navbar.tsx              // Верхняя панель: выбор языков, режимы, кнопки
  │    ├── SettingsBar.tsx         // Регистр, аудитория, буквальность (1-5), гендер
  │    ├── TranslationWorkspace.tsx// Двухоконный редактор оригинала и редактируемого перевода
  │    ├── DecisionsAndAlternatives.tsx // Лингвистические комментарии и подстановка вариантов
  │    ├── ReviewWorkspace.tsx     // Режим сверки и рецензирования чужого черновика
  │    ├── GlossaryModal.tsx       // Управление терминологической базой
  │    ├── HistoryModal.tsx        // История сессий и избранное
  │    └── FutureExtensionsBanner.tsx // Архитектурная карта
  └── App.tsx                      // Главный контроллер состояния`}
            </pre>
          </div>

        </div>
      )}
    </div>
  );
};
