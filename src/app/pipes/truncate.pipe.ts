import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 5): string {
    if (!value) return '';

    let count = 0;
    let result = '';

    for (const char of value) {
      // CJK Unified Ideographs, Hangul Syllables, Hiragana, Katakana
      const isWide =
        /[\u1100-\u11FF\u2E80-\uA4CF\uAC00-\uD7AF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF]/.test(
          char
        );
      count += isWide ? 2 : 1;

      if (count > limit) break;
      result += char;
    }

    return count > limit ? result + '...' : result;
  }
}
