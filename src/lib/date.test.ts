import { describe, expect, it } from 'vitest';
import { formatDate, isValidDateString, todayString } from './date';

describe('todayString', () => {
  it('ローカル日付を YYYY-MM-DD で返す', () => {
    expect(todayString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('formatDate', () => {
  it('曜日付きの表示用文字列に変換する', () => {
    expect(formatDate('2026-10-30')).toBe('2026/10/30(金)');
  });
});

describe('isValidDateString', () => {
  it('存在する日付だけを妥当とする', () => {
    expect(isValidDateString('2026-02-28')).toBe(true);
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });
});
