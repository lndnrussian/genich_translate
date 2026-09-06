import { TranslationSettings, GlossaryItem, TranslationResult, ReviewResult } from '../types';

export interface TranslateApiPayload {
  text: string;
  direction: string;
  register: string;
  targetAudience: string;
  literality: number;
  speakerGender: string;
  addresseeGender: string;
  formalityAddress: string;
  preserveFormatting: boolean;
  typography: any;
  glossary: GlossaryItem[];
  explainDecisions: boolean;
  provideAlternatives: boolean;
  model: string;
}

export interface ReviewApiPayload {
  sourceText: string;
  draftText: string;
  direction: string;
  register: string;
  targetAudience: string;
  glossary: GlossaryItem[];
  model: string;
}

export async function requestTranslation(
  text: string,
  settings: TranslationSettings,
  glossary: GlossaryItem[]
): Promise<TranslationResult> {
  const payload: TranslateApiPayload = {
    text,
    direction: settings.direction,
    register: settings.register,
    targetAudience: settings.targetAudience,
    literality: settings.literality,
    speakerGender: settings.speakerGender,
    addresseeGender: settings.addresseeGender,
    formalityAddress: settings.formalityAddress,
    preserveFormatting: settings.preserveFormatting,
    typography: settings.typography,
    glossary,
    explainDecisions: settings.explainDecisions,
    provideAlternatives: settings.provideAlternatives,
    model: settings.model,
  };

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Ошибка сервера: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function requestReview(
  sourceText: string,
  draftText: string,
  settings: TranslationSettings,
  glossary: GlossaryItem[]
): Promise<ReviewResult> {
  const payload: ReviewApiPayload = {
    sourceText,
    draftText,
    direction: settings.direction === 'auto' ? 'ru-en' : settings.direction,
    register: settings.register,
    targetAudience: settings.targetAudience,
    glossary,
    model: settings.model,
  };

  const response = await fetch('/api/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Ошибка сервера: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
