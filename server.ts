import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy/safe initialization of GoogleGenAI
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Translation Endpoint
app.post("/api/translate", async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      text,
      direction = "auto",
      register = "neutral",
      targetAudience = "general",
      literality = 3,
      speakerGender = "unspecified",
      addresseeGender = "unspecified",
      formalityAddress = "neutral",
      preserveFormatting = true,
      typography = {
        useRussianQuotes: true,
        useEmDash: true,
        useNonBreakingSpaces: true,
        correctPunctuationOrder: true,
      },
      glossary = [],
      explainDecisions = true,
      provideAlternatives = true,
      model = "gemini-3.8-flash",
    } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Input text is required." });
    }

    const ai = getGeminiClient();

    // Model selection validation
    const allowedModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
    const chosenModel = allowedModels.includes(model) ? model : "gemini-3.8-flash";

    // Build system instructions for professional translator
    const systemInstruction = `You are a World-Class Master Senior Translator, Literary Editor, and Localizer specializing exclusively in Russian and English translations (in both directions).
Your task is to produce a high-caliber professional translation that meets rigorous publishing, localization, and copywriting standards.

TRANSLATION DIRECTIVES & CONSTRAINTS:

1. DIRECTION:
- User selected direction: "${direction}". If "auto", inspect the text: if predominantly Russian Cyrillic, translate to English (ru-en); if predominantly English Latin, translate to Russian (en-ru).

2. REGISTER & TONE:
- Current Register: "${register}".
  * formal: Официально-деловой, строгий протокол, юридическая и дипломатическая выверенность, отсутствие разговорных элементов.
  * neutral: Нейтрально-литературный, взвешенный, ясный, чистый современный литературный язык.
  * conversational: Живая естественная речь носителя языка, естественные коллокации и фразеологизмы, отсутствие механического калькирования.
  * literary: Художественный стиль: внимание к ритмике фразы, полифонии, образности, метафорам и аллюзиям.
  * marketing: Убедительный копирайтинг: броскость, вовлечение, динамичность, адаптация культурных триггеров (транскреация).
  * technical: Предельная точность терминов, однозначность синтаксиса, стандартная отраслевая номенклатура.

3. TARGET AUDIENCE:
- Target Audience: "${targetAudience}".
  * general: Понятный широкому кругу читателей без узкого жаргона.
  * professional: Экспертный уровень владения профессиональной лексикой.
  * youth: Молодежная аудитория, живой современный сленг/интернет-лексикон при уместности.
  * executive: Управленческий уровень, фокус на ценность, стратегичность и лаконичность.
  * kids: Простые, добрые, образные конструкции, доступные детям.

4. LITERALITY LEVEL (1 to 5):
- Level: ${literality} / 5.
  * 1 (Verbatim/Literal): Максимально точное следование синтаксису и порядку слов оригинала, насколько допускают правила целевого языка.
  * 2 (Close/Faithful): Близко к тексту с минимальной перестройкой структуры.
  * 3 (Balanced/Professional): Золотой стандарт качественного перевода — передача точного смысла естественными средствами языка перевода.
  * 4 (Idiomatic/Free): Свободное идиоматическое изложение, приоритет благозвучия и естественности на целевом языке.
  * 5 (Transcreation): Творческая адаптация духа, настроения и коммуникативного эффекта; свободная переработка формулировок под культурный контекст.

5. GENDER & FORMALITY SPECIFICATIONS (Crucial when translating into Russian):
- Speaker Gender: "${speakerGender}".
  * If "male": use masculine past tense and adjectives for first-person (e.g., «я сказал», «я сделал», «я был уверен»).
  * If "female": use feminine past tense and adjectives for first-person (e.g., «я сказала», «я сделала», «я была уверена»).
- Addressee Gender: "${addresseeGender}".
  * If "male": use masculine forms for second-person (e.g., «ты сказал», «ты готов»).
  * If "female": use feminine forms for second-person (e.g., «ты сказала», «ты готова»).
- Formality / Address: "${formalityAddress}".
  * If "formal_vy": use respectful «Вы / Вам / Ваш».
  * If "informal_ty": use informal «ты / тебе / твой».

6. MANDATORY GLOSSARY:
${
  glossary.length > 0
    ? `The following term correspondences MUST be strictly adhered to:\n` +
      glossary
        .map((g: any) => `- "${g.source}" => "${g.target}"${g.comment ? ` (Note: ${g.comment})` : ""}`)
        .join("\n")
    : "No custom glossary provided. Use standard industry terms."
}

7. FORMATTING:
- Preserve formatting: ${preserveFormatting ? "YES" : "NO"}.
${preserveFormatting ? "Strictly preserve all Markdown markup (headers, bold/italics, bullet points, links, code blocks) and HTML tags intact without altering tags." : "Output plain text."}

8. TYPOGRAPHIC CONVENTIONS (Russian Localization):
- Russian quotes: Use «ёлочки» for outer quotes and „лапки“ for nested quotes (never plain straight ASCII quotes in Russian).
- Dash: Use em-dash (—) with a preceding non-breaking space for Russian clauses, dialogues, and definitions.
- Punctuation order: in Russian, period and comma are placed AFTER the closing quote («пример»., «пример»,), unlike American English ("example.").

9. EXPLANATIONS & ALTERNATIVES:
${explainDecisions ? "- In the decisions field, briefly explain the most interesting or difficult translation choices (idioms, cultural adaptations, wordplay, false friends, syntax shifts)." : "- You may keep decisions minimal."}
${provideAlternatives ? "- In the alternatives field, provide 2 to 3 alternative translations for 1 to 3 nuanced phrases in the text, highlighting what tone or nuance each variant carries." : "- Keep alternatives empty if not requested."}

Return the response strictly conforming to the JSON schema.`;

    const prompt = `Translate the following source text:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: literality >= 4 ? 0.6 : 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedDirection: {
              type: Type.STRING,
              description: "The detected translation direction: either 'ru-en' or 'en-ru'",
            },
            translation: {
              type: Type.STRING,
              description: "The finalized high-quality translation.",
            },
            decisions: {
              type: Type.ARRAY,
              description: "Explanations of key translation decisions, idioms, or cultural adaptations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceSegment: { type: Type.STRING },
                  targetSegment: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: "One of: idiom, cultural, wordplay, syntax, false_friend, terminology, tone",
                  },
                  explanation: { type: Type.STRING, description: "Clear explanation in Russian for the translator" },
                },
                required: ["sourceSegment", "targetSegment", "category", "explanation"],
              },
            },
            alternatives: {
              type: Type.ARRAY,
              description: "Alternative renderings for specific phrases with nuance explanations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  originalFragment: { type: Type.STRING },
                  currentChoice: { type: Type.STRING },
                  variants: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        nuance: { type: Type.STRING, description: "Brief description of the nuance/style" },
                      },
                      required: ["text", "nuance"],
                    },
                  },
                },
                required: ["originalFragment", "currentChoice", "variants"],
              },
            },
            generalNotes: {
              type: Type.STRING,
              description: "Optional overarching translator commentary or cultural notes.",
            },
          },
          required: ["detectedDirection", "translation", "decisions", "alternatives"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const processingTimeMs = Date.now() - startTime;

    res.json({
      ...parsed,
      processingTimeMs,
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({
      error: error.message || "Failed to process translation request.",
    });
  }
});

// Translation Review / Comparison Endpoint
app.post("/api/review", async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      sourceText,
      draftText,
      direction = "ru-en",
      register = "neutral",
      targetAudience = "general",
      glossary = [],
      model = "gemini-3.8-flash",
    } = req.body;

    if (!sourceText || !draftText) {
      return res.status(400).json({ error: "Both source text and draft translation are required for comparison." });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are a Senior Translation Lead and Chief Quality Editor for RU ↔ EN translations.
Analyze the provided draft translation against the original source text.

Evaluation criteria:
1. Accuracy & completeness: any omissions, additions, or distortions of meaning.
2. Register & Style: how well it adheres to register "${register}" and audience "${targetAudience}".
3. Idiomaticity & Fluency: natural collocations, avoidance of calques/mechanical translation.
4. Typography & Punctuation: Russian quotes (« »), em-dash (—), punctuation placement.
5. Glossary: Check if any of the following terms were violated:
${glossary.map((g: any) => `- "${g.source}" => "${g.target}"`).join("\n") || "None"}

Provide an overall rating out of 10, list key strengths, identify specific issues with actionable suggestions, and provide an improved professional revision.
All reasons and summaries should be written in Russian.`;

    const prompt = `SOURCE TEXT:\n${sourceText}\n\nDRAFT TRANSLATION TO REVIEW:\n${draftText}`;

    const response = await ai.models.generateContent({
      model: model || "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.NUMBER,
              description: "Quality score from 1 to 10",
            },
            summary: {
              type: Type.STRING,
              description: "Overall editorial assessment in Russian",
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Notable strengths of the draft",
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  draft: { type: Type.STRING },
                  suggested: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  severity: {
                    type: Type.STRING,
                    description: "'minor', 'medium', or 'critical'",
                  },
                },
                required: ["original", "draft", "suggested", "reason", "severity"],
              },
            },
            improvedTranslation: {
              type: Type.STRING,
              description: "Refined, polished version of the translation",
            },
          },
          required: ["overallScore", "summary", "strengths", "issues", "improvedTranslation"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const processingTimeMs = Date.now() - startTime;

    res.json({
      ...parsed,
      processingTimeMs,
    });
  } catch (error: any) {
    console.error("Review error:", error);
    res.status(500).json({
      error: error.message || "Failed to process translation review.",
    });
  }
});

// Vite middleware / static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
