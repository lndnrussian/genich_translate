export type TranslationDirection = 'auto' | 'ru-en' | 'en-ru';
export type DetectedLanguage = 'ru' | 'en' | 'unknown';

export type TranslationRegister = 
  | 'formal'          // Официально-деловой
  | 'neutral'         // Нейтральный
  | 'conversational'  // Разговорный / естественный
  | 'literary'        // Художественный
  | 'marketing'       // Маркетинговый / Копирайтинг
  | 'technical';      // Технический / Научный

export type TargetAudience = 
  | 'general'         // Общая аудитория
  | 'professional'    // Профессионалы / Эксперты
  | 'youth'           // Молодёжная / Современная речь
  | 'executive'       // Бизнес / Руководители
  | 'kids';           // Детская / Семейная

export type SpeakerGender = 'unspecified' | 'male' | 'female';
export type AddresseeGender = 'unspecified' | 'male' | 'female';
export type FormalityAddress = 'neutral' | 'formal_vy' | 'informal_ty';

export interface TypographyOptions {
  useRussianQuotes: boolean;       // «ёлочки» снаружи, „лапки“ внутри
  useEmDash: boolean;              // длинное тире « — » с неразрывным пробелом
  useNonBreakingSpaces: boolean;   // неразрывные пробелы после предлогов/союзов
  correctPunctuationOrder: boolean; // точка после кавычек в русском («текст».)
}

export interface GlossaryItem {
  id: string;
  source: string;
  target: string;
  caseSensitive?: boolean;
  comment?: string;
}

export interface TranslationSettings {
  direction: TranslationDirection;
  register: TranslationRegister;
  targetAudience: TargetAudience;
  literality: number; // 1 (дословно) to 5 (вольно / транскреация)
  speakerGender: SpeakerGender;
  addresseeGender: AddresseeGender;
  formalityAddress: FormalityAddress;
  preserveFormatting: boolean; // Markdown, HTML tags
  typography: TypographyOptions;
  explainDecisions: boolean;
  provideAlternatives: boolean;
  model: string; // e.g. 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'
}

export interface TranslationDecision {
  sourceSegment: string;
  targetSegment: string;
  category: 'idiom' | 'cultural' | 'wordplay' | 'syntax' | 'false_friend' | 'terminology' | 'tone';
  explanation: string;
}

export interface AlternativeVariant {
  originalFragment: string;
  currentChoice: string;
  variants: Array<{
    text: string;
    nuance: string;
  }>;
}

export interface TranslationResult {
  translation: string;
  detectedDirection: 'ru-en' | 'en-ru';
  decisions: TranslationDecision[];
  alternatives: AlternativeVariant[];
  generalNotes?: string;
  processingTimeMs?: number;
}

export interface ReviewIssue {
  original: string;
  draft: string;
  suggested: string;
  reason: string;
  severity: 'minor' | 'medium' | 'critical';
}

export interface ReviewResult {
  overallScore: number; // 1-10
  summary: string;
  strengths: string[];
  issues: ReviewIssue[];
  improvedTranslation: string;
  processingTimeMs?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  sourceText: string;
  translatedText: string;
  direction: TranslationDirection;
  detectedDirection: 'ru-en' | 'en-ru';
  register: TranslationRegister;
  literality: number;
  starred?: boolean;
  decisionsCount: number;
  settingsSnapshot?: Partial<TranslationSettings>;
}
