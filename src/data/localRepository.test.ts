import { describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from '../test/memoryStorage';
import { LocalRepository } from './localRepository';

function createRepo(uid = 'user-1', storage = new MemoryStorage()) {
  return new LocalRepository(uid, storage, () => 1000);
}

describe('LocalRepository', () => {
  it('同じ日付のメモを作成すると連番を付ける', async () => {
    const repo = createRepo();
    const first = await repo.createMemo({ date: '2026-10-30', title: 'A', body: '' });
    const second = await repo.createMemo({ date: '2026-10-30', title: 'B', body: '' });
    const other = await repo.createMemo({ date: '2026-10-31', title: 'C', body: '' });
    expect([first.seq, second.seq, other.seq]).toEqual([1, 2, 1]);
  });

  it('日付を変更すると変更先の日付で連番を付け直す', async () => {
    const repo = createRepo();
    await repo.createMemo({ date: '2026-10-30', title: '', body: '' });
    const memo = await repo.createMemo({ date: '2026-10-31', title: '', body: '' });
    const updated = await repo.updateMemo(memo.id, { date: '2026-10-30', title: '', body: '' });
    expect(updated.seq).toBe(2);

    const unchanged = await repo.updateMemo(memo.id, { date: '2026-10-30', title: '変更', body: '' });
    expect(unchanged.seq).toBe(2);
  });

  it('メモを削除すると紐づくタスクも削除する', async () => {
    const repo = createRepo();
    const memo = await repo.createMemo({ date: '2026-10-30', title: '', body: '' });
    await repo.createTask({ title: 'メモのタスク', memoId: memo.id });
    await repo.createTask({ title: 'ダッシュボードのタスク', memoId: null });
    await repo.deleteMemo(memo.id);
    expect(await repo.listMemos()).toEqual([]);
    expect((await repo.listTasks()).map((t) => t.title)).toEqual(['ダッシュボードのタスク']);
  });

  it('タスクの完了状態を更新・削除できる', async () => {
    const repo = createRepo();
    const task = await repo.createTask({ title: 'タスク', memoId: null });
    expect(task.done).toBe(false);
    expect((await repo.updateTask(task.id, { done: true })).done).toBe(true);
    await repo.deleteTask(task.id);
    expect(await repo.listTasks()).toEqual([]);
  });

  it('ユーザーごとにデータを分ける', async () => {
    const storage = new MemoryStorage();
    await createRepo('user-1', storage).createTask({ title: 'タスク', memoId: null });
    expect(await createRepo('user-2', storage).listTasks()).toEqual([]);
  });

  it('変更時に購読者へ通知する', async () => {
    const repo = createRepo();
    const listener = vi.fn();
    const unsubscribe = repo.subscribe(listener);
    await repo.createTask({ title: 'タスク', memoId: null });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    await repo.createTask({ title: 'タスク', memoId: null });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
