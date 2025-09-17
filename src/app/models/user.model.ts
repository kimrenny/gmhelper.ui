import { LanguageCode } from './languages.model';

export interface UserDetails {
  avatar: string | null;
  nickname: string;
  language: LanguageCode;
  twoFactor: boolean;
  alwaysAsk: boolean;
}
