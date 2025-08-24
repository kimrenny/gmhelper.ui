export type LanguageCode =
  | 'de'
  | 'en'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'ru'
  | 'ua'
  | 'zh';

export interface Language {
  code: LanguageCode;
  name: string;
}

export const languages: Language[] = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ru', name: 'Русский' },
  { code: 'ua', name: 'Українська' },
  { code: 'zh', name: '中文' },
];
