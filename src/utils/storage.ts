import { HistoryItem, GlossaryItem, TranslationSettings } from '../types';

const HISTORY_KEY = 'pro_trans_history_v1';
const GLOSSARY_KEY = 'pro_trans_glossary_v1';
const SETTINGS_KEY = 'pro_trans_settings_v1';

export const DEFAULT_SETTINGS: TranslationSettings = {
  direction: 'auto',
  register: 'neutral',
  targetAudience: 'general',
  literality: 3,
  speakerGender: 'unspecified',
  addresseeGender: 'unspecified',
  formalityAddress: 'neutral',
  preserveFormatting: true,
  typography: {
    useRussianQuotes: true,
    useEmDash: true,
    useNonBreakingSpaces: true,
    correctPunctuationOrder: true,
  },
  explainDecisions: true,
  provideAlternatives: true,
  model: 'gemini-3.8-flash',
};

export const PRESET_GLOSSARIES: Record<string, { name: string; items: Omit<GlossaryItem, 'id'>[] }> = {
  tech: {
    name: 'IT & Software Development',
    items: [
      { source: 'deployment', target: 'развёртывание', comment: 'Не "деплоймент"' },
      { source: 'pipeline', target: 'конвейер / пайплайн', comment: 'В зависимости от стиля' },
      { source: 'rate limit', target: 'лимит частоты запросов', comment: 'API термин' },
      { source: 'endpoint', target: 'конечная точка API', comment: 'Техническая документация' },
      { source: 'legacy code', target: 'унаследованный код', comment: 'Не "легаси"' },
      { source: 'pull request', target: 'запрос на слияние', comment: 'GitHub / GitLab' },
    ],
  },
  business: {
    name: 'Бизнес и Юриспруденция',
    items: [
      { source: 'indemnification', target: 'возмещение убытков', comment: 'Юридический термин' },
      { source: 'due diligence', target: 'комплексная юридическая проверка', comment: 'Финансы' },
      { source: 'non-disclosure agreement', target: 'соглашение о неразглашении конфиденциальной информации', comment: 'NDA' },
      { source: 'force majeure', target: 'обстоятельства непреодолимой силы', comment: 'Договоры' },
      { source: 'stakeholder', target: 'заинтересованная сторона', comment: 'Менеджмент' },
    ],
  },
  marketing: {
    name: 'Маркетинг и Копирайтинг',
    items: [
      { source: 'value proposition', target: 'ценностное предложение', comment: 'Маркетинг' },
      { source: 'call to action', target: 'призыв к действию', comment: 'CTA' },
      { source: 'brand awareness', target: 'узнаваемость бренда', comment: 'Брендинг' },
      { source: 'lead magnet', target: 'лид-магнит', comment: 'Воронка' },
      { source: 'retention rate', target: 'коэффициент удержания', comment: 'Метрики' },
    ],
  },
};

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export function saveHistoryItem(item: HistoryItem): void {
  try {
    const history = getHistory();
    // Prepend, cap at 60 items
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 60);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history item', e);
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const history = getHistory().filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.error('Failed to delete history item', e);
    return [];
  }
}

export function toggleStarredHistory(id: string): HistoryItem[] {
  try {
    const history = getHistory().map(h => (h.id === id ? { ...h, starred: !h.starred } : h));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.error('Failed to toggle star', e);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function getGlossary(): GlossaryItem[] {
  try {
    const raw = localStorage.getItem(GLOSSARY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load glossary', e);
    return [];
  }
}

export function saveGlossary(items: GlossaryItem[]): void {
  try {
    localStorage.setItem(GLOSSARY_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save glossary', e);
  }
}

export function getSavedSettings(): TranslationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: TranslationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
