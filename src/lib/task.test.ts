import { describe, expect, it } from 'vitest';
import type { Memo, Task } from '../data/types';
import { sortTasksByDateDesc } from './task';

function memo(id: string, date: string, seq: number): Memo {
  return { id, date, seq, body: '', createdAt: 0, updatedAt: 0 };
}

function task(id: string, memoId: string | null, createdAt: number): Task {
  return { id, title: id, done: false, memoId, createdAt, updatedAt: createdAt };
}

describe('sortTasksByDateDesc', () => {
  it('メモの日付の新しい順、同じ日付なら連番の大きい順、同じメモなら追加した順に並べる', () => {
    const memos = [memo('m1', '2026-10-28', 1), memo('m2', '2026-10-30', 1), memo('m3', '2026-10-30', 2)];
    const tasks = [task('a', 'm1', 1), task('b', 'm2', 2), task('c', 'm3', 4), task('d', 'm3', 3)];
    expect(sortTasksByDateDesc(tasks, memos).map((t) => t.id)).toEqual(['d', 'c', 'b', 'a']);
  });

  it('メモに紐づかないタスクは作成日で並べる', () => {
    const memos = [memo('m1', '2026-10-28', 1), memo('m2', '2026-10-30', 1)];
    const createdOn29 = new Date(2026, 9, 29, 12).getTime();
    const tasks = [task('a', 'm1', 1), task('b', null, createdOn29), task('c', 'm2', 2)];
    expect(sortTasksByDateDesc(tasks, memos).map((t) => t.id)).toEqual(['c', 'b', 'a']);
  });
});
