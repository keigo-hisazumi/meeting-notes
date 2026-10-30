import { describe, expect, it } from 'vitest';
import type { Memo } from '../data/types';
import { memoLabel, nextSeq, splitRecentMemos } from './memo';

function memo(id: string, date: string, seq: number): Memo {
  return { id, date, seq, title: '', body: '', createdAt: 0, updatedAt: 0 };
}

describe('nextSeq', () => {
  it('同じ日付のメモがなければ 1 を返す', () => {
    expect(nextSeq([memo('a', '2026-10-29', 1)], '2026-10-30')).toBe(1);
  });

  it('同じ日付のメモがあれば最大の連番 + 1 を返す', () => {
    const memos = [memo('a', '2026-10-30', 1), memo('b', '2026-10-30', 3)];
    expect(nextSeq(memos, '2026-10-30')).toBe(4);
  });

  it('除外したメモは数えない', () => {
    expect(nextSeq([memo('a', '2026-10-30', 1)], '2026-10-30', 'a')).toBe(1);
  });
});

describe('splitRecentMemos', () => {
  it('日付と連番の新しい順に直近 3 件とそれ以降に分ける', () => {
    const memos = [
      memo('a', '2026-10-28', 1),
      memo('b', '2026-10-30', 1),
      memo('c', '2026-10-30', 2),
      memo('d', '2026-10-29', 1),
      memo('e', '2026-10-01', 1),
    ];
    const { recent, older } = splitRecentMemos(memos);
    expect(recent.map((m) => m.id)).toEqual(['c', 'b', 'd']);
    expect(older.map((m) => m.id)).toEqual(['a', 'e']);
  });
});

describe('memoLabel', () => {
  it('日付と連番を表示する', () => {
    expect(memoLabel({ date: '2026-10-30', seq: 2 })).toBe('2026/10/30(金) #2');
  });
});
