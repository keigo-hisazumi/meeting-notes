import type { Memo, Task } from '../data/types';
import { todayString } from './date';

/**
 * ダッシュボードに表示するタスクを、日付の新しい順に並べる。
 * 日付はタスクが紐づくメモの日付を使い、メモに紐づかないタスクは作成日を使う。
 * 同じ日付なら連番の大きいメモを先にし、同じメモの中では追加した順に並べる。
 */
export function sortTasksByDateDesc(tasks: Task[], memos: Memo[]): Task[] {
  const memoById = new Map(memos.map((m) => [m.id, m]));
  const keyOf = (task: Task) => {
    const memo = task.memoId ? memoById.get(task.memoId) : undefined;
    return memo
      ? { date: memo.date, seq: memo.seq }
      : { date: todayString(new Date(task.createdAt)), seq: 0 };
  };
  return [...tasks].sort((a, b) => {
    const ka = keyOf(a);
    const kb = keyOf(b);
    if (ka.date !== kb.date) return ka.date < kb.date ? 1 : -1;
    if (ka.seq !== kb.seq) return kb.seq - ka.seq;
    return a.createdAt - b.createdAt;
  });
}
