import type { Memo } from '../data/types';
import { formatDate } from './date';

/** 指定した日付で次に使う連番を返す（excludeId のメモは対象外） */
export function nextSeq(memos: Memo[], date: string, excludeId?: string): number {
  const seqs = memos.filter((m) => m.date === date && m.id !== excludeId).map((m) => m.seq);
  return seqs.length === 0 ? 1 : Math.max(...seqs) + 1;
}

/** 日付の新しい順、同じ日付なら連番の大きい順に並べる */
export function sortMemosByDateDesc(memos: Memo[]): Memo[] {
  return [...memos].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.seq - a.seq;
  });
}

/** 直近 count 件とそれ以降のメモに分ける */
export function splitRecentMemos(memos: Memo[], count = 3): { recent: Memo[]; older: Memo[] } {
  const sorted = sortMemosByDateDesc(memos);
  return { recent: sorted.slice(0, count), older: sorted.slice(count) };
}

/** リンク一覧に表示する本文の 1 行目（空行は飛ばす） */
export function memoPreview(body: string): string {
  return body.split('\n').find((line) => line.trim() !== '')?.trim() ?? '';
}

/** 一覧などで表示するメモの見出し（例: 2026/10/30(金) #2） */
export function memoLabel(memo: Pick<Memo, 'date' | 'seq'>): string {
  return `${formatDate(memo.date)} #${memo.seq}`;
}
