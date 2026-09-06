import { TypographyOptions } from '../types';

/**
 * Professional typographic post-processor for Russian and English texts.
 */

// Russian short prepositions and particles that require a non-breaking space after them
const RU_PREPOSITIONS_AND_PARTICLES = [
  'в', 'во', 'на', 'с', 'со', 'к', 'ко', 'у', 'о', 'об', 'обо', 'от', 'ото',
  'до', 'из', 'изо', 'за', 'по', 'под', 'подо', 'над', 'надо', 'пред', 'предо',
  'без', 'безо', 'для', 'не', 'ни', 'же', 'ж', 'ли', 'ль', 'бы', 'б', 'а', 'и', 'но', 'да'
];

/**
 * Applies Russian typographic rules:
 * - «ёлочки» for outer quotes, „лапки“ for inner quotes
 * - Em-dash (—) with non-breaking space before: \u00A0— 
 * - Non-breaking space after short prepositions and conjunctions
 * - Periods/commas outside quotes («слово»., «слово»,)
 */
export function formatRussianTypography(
  text: string,
  options: TypographyOptions = {
    useRussianQuotes: true,
    useEmDash: true,
    useNonBreakingSpaces: true,
    correctPunctuationOrder: true,
  }
): string {
  if (!text) return '';
  let res = text;

  // 1. Em-dash normalization
  if (options.useEmDash) {
    // Replace isolated hyphens or double hyphens surrounded by spaces with em-dash
    // e.g. "слово - слово" or "слово -- слово" -> "слово\u00A0— слово"
    res = res.replace(/(\S)[ \t]+(?:--|—|–|-)[ \t]+(\S)/g, '$1\u00A0— $2');
    // Direct speech at line start: "- Привет" -> "— Привет"
    res = res.replace(/(^|\n)[ \t]*(?:--|—|–|-)[ \t]+/g, '$1— ');
  }

  // 2. Russian quotes («ёлочки» and nested „лапки“)
  if (options.useRussianQuotes) {
    // Replace straight double quotes with « and »
    // Account for nested quotes
    let quoteDepth = 0;
    const chars = res.split('');
    const out: string[] = [];

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === '"') {
        const prev = i > 0 ? chars[i - 1] : ' ';
        const next = i < chars.length - 1 ? chars[i + 1] : ' ';
        const isOpening = /[\s(\[{\-—„«]/.test(prev) && !/[\s)\]}\-—»]/.test(next);
        const isClosing = !/[\s(\[{\-—„«]/.test(prev) && /[\s)\]}.,;:!?\-—»\n]/.test(next);

        if (isOpening) {
          if (quoteDepth === 0) {
            out.push('«');
            quoteDepth++;
          } else {
            out.push('„');
            quoteDepth++;
          }
        } else if (isClosing) {
          if (quoteDepth > 1) {
            out.push('“');
            quoteDepth--;
          } else {
            out.push('»');
            quoteDepth = Math.max(0, quoteDepth - 1);
          }
        } else {
          // Fallback based on depth
          if (quoteDepth === 0) {
            out.push('«');
            quoteDepth++;
          } else {
            out.push('»');
            quoteDepth = Math.max(0, quoteDepth - 1);
          }
        }
      } else {
        out.push(c);
      }
    }
    res = out.join('');

    // Fix double-closing quotes like «...»» -> «...„...“»
    res = res.replace(/«([^»«]*?)«([^»«]*?)»([^»«]*?)»/g, '«$1„$2“$3»');
  }

  // 3. Punctuation order relative to quotes (Russian norm: period/comma is AFTER quote)
  if (options.correctPunctuationOrder) {
    // English style inside quotes: "word." -> «слово».
    res = res.replace(/([.,])»/g, '»$1');
  }

  // 4. Non-breaking spaces after short prepositions and particles
  if (options.useNonBreakingSpaces) {
    const prepPattern = RU_PREPOSITIONS_AND_PARTICLES.join('|');
    // Match word boundary, preposition, one or more regular spaces
    const regex = new RegExp(`(^|[\\s(\\[«„])(${prepPattern}) +(?=[a-zA-Zа-яА-Я0-9«„])`, 'gi');
    res = res.replace(regex, '$1$2\u00A0');

    // Also nbsp between number and unit/measure, e.g. "10 км", "2026 г."
    res = res.replace(/(\d+)[ \t]+([а-яА-Яa-zA-Z%$€₽]{1,4}\.?)(?=[\s.,;:!?]|$)/g, '$1\u00A0$2');
  }

  return res;
}

/**
 * Applies English typographic rules:
 * - Curly quotes “ ” and curly apostrophes ’
 * - Em-dash (—) without spaces or with thin spaces
 * - Proper punctuation placement (period inside quotation marks for US, or outside for UK)
 */
export function formatEnglishTypography(text: string): string {
  if (!text) return '';
  let res = text;

  // Em-dash: " -- " or " - " to " — "
  res = res.replace(/(\S)[ \t]+(?:--|—|–|-)[ \t]+(\S)/g, '$1 — $2');

  // Apostrophes
  res = res.replace(/(\w)'(\w)/g, '$1’$2');
  res = res.replace(/(\w)'(\s|$)/g, '$1’$2');

  // Curly double quotes
  res = res.replace(/(^|[\s(\[{])"([^\s])/g, '$1“$2');
  res = res.replace(/([^\s])"([\s.,;:!?)]|$)/g, '$1”$2');

  // Single quotes
  res = res.replace(/(^|[\s(\[{])'([^\s])/g, '$1‘$2');
  res = res.replace(/([^\s])'([\s.,;:!?)]|$)/g, '$1’$2');

  return res;
}

/**
 * Detects whether the given text is primarily Russian (Cyrillic) or English (Latin).
 */
export function detectLanguage(text: string): 'ru' | 'en' | 'unknown' {
  if (!text || text.trim().length === 0) return 'unknown';

  let cyrillicCount = 0;
  let latinCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Cyrillic unicode block: 0x0400 - 0x04FF
    if (code >= 0x0400 && code <= 0x04ff) {
      cyrillicCount++;
    } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latinCount++;
    }
  }

  if (cyrillicCount > latinCount) return 'ru';
  if (latinCount > cyrillicCount) return 'en';
  return 'unknown';
}
