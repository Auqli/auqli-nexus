// Simple language detection based on common words and characters
// In a production environment, you would use a proper language detection library

const LANGUAGE_PATTERNS = {
  en: /\b(the|and|is|in|to|of|that|for|with|you|this|have|are)\b/i,
  es: /\b(el|la|los|las|de|en|que|por|con|para|una|un|es|son)\b/i,
  fr: /\b(le|la|les|de|en|que|pour|avec|est|sont|dans|sur|un|une)\b/i,
  de: /\b(der|die|das|und|ist|in|zu|den|für|mit|dem|auf|ein|eine)\b/i,
  it: /\b(il|la|i|le|di|che|è|per|in|con|sono|un|una|su)\b/i,
  pt: /\b(o|a|os|as|de|que|é|para|em|com|um|uma|no|na)\b/i,
  nl: /\b(de|het|een|in|is|dat|op|te|en|van|voor|met|zijn)\b/i,
  ru: /[а-яА-Я]{4,}/i,
  zh: /[\u4e00-\u9fff]{2,}/,
  ja: /[\u3040-\u309f\u30a0-\u30ff]{2,}/,
  ko: /[\uac00-\ud7af]{2,}/,
  ar: /[\u0600-\u06ff]{2,}/,
}

export async function detectLanguage(text: string): Promise<string | null> {
  if (!text || text.trim().length < 10) {
    return null // Not enough text to detect
  }

  // Check each language pattern
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(text)) {
      return lang
    }
  }

  // Default to English if no match
  return "en"
}

export function getLanguageNameFromCode(code: string): string {
  const languageMap: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
  }

  return languageMap[code] || code
}
