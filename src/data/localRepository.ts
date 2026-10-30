import { generateId } from '../lib/id';
import { nextSeq } from '../lib/memo';
import type { Repository } from './repository';
import type { Memo, MemoInput, Task, TaskInput, TaskPatch } from './types';

/** localStorage のキーの接頭辞。同じオリジンの他アプリと衝突しないようにする */
export const STORAGE_PREFIX = 'meeting-notes:';

/**
 * localStorage にデータを保存する Repository 実装。
 * Firestore の `users/{uid}/memos` / `users/{uid}/tasks` と同じ構造のキーで保存する。
 */
export class LocalRepository implements Repository {
  private readonly listeners = new Set<() => void>();
  private readonly memosKey: string;
  private readonly tasksKey: string;

  constructor(
    uid: string,
    private readonly storage: Storage = window.localStorage,
    private readonly now: () => number = Date.now,
  ) {
    this.memosKey = `${STORAGE_PREFIX}users/${uid}/memos`;
    this.tasksKey = `${STORAGE_PREFIX}users/${uid}/tasks`;
  }

  async listMemos(): Promise<Memo[]> {
    return this.read<Memo>(this.memosKey);
  }

  async getMemo(id: string): Promise<Memo | null> {
    return this.read<Memo>(this.memosKey).find((m) => m.id === id) ?? null;
  }

  async createMemo(input: MemoInput): Promise<Memo> {
    const memos = this.read<Memo>(this.memosKey);
    const timestamp = this.now();
    const memo: Memo = {
      id: generateId(),
      date: input.date,
      seq: nextSeq(memos, input.date),
      title: input.title,
      body: input.body,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.write(this.memosKey, [...memos, memo]);
    return memo;
  }

  async updateMemo(id: string, input: MemoInput): Promise<Memo> {
    const memos = this.read<Memo>(this.memosKey);
    const current = memos.find((m) => m.id === id);
    if (!current) throw new Error('メモが見つかりません');
    const updated: Memo = {
      ...current,
      ...input,
      seq: current.date === input.date ? current.seq : nextSeq(memos, input.date, id),
      updatedAt: this.now(),
    };
    this.write(
      this.memosKey,
      memos.map((m) => (m.id === id ? updated : m)),
    );
    return updated;
  }

  async deleteMemo(id: string): Promise<void> {
    this.write(
      this.memosKey,
      this.read<Memo>(this.memosKey).filter((m) => m.id !== id),
      false,
    );
    this.write(
      this.tasksKey,
      this.read<Task>(this.tasksKey).filter((t) => t.memoId !== id),
    );
  }

  async listTasks(): Promise<Task[]> {
    return this.read<Task>(this.tasksKey);
  }

  async createTask(input: TaskInput): Promise<Task> {
    const timestamp = this.now();
    const task: Task = {
      id: generateId(),
      title: input.title,
      done: input.done ?? false,
      memoId: input.memoId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.write(this.tasksKey, [...this.read<Task>(this.tasksKey), task]);
    return task;
  }

  async updateTask(id: string, patch: TaskPatch): Promise<Task> {
    const tasks = this.read<Task>(this.tasksKey);
    const current = tasks.find((t) => t.id === id);
    if (!current) throw new Error('タスクが見つかりません');
    const updated: Task = { ...current, ...patch, updatedAt: this.now() };
    this.write(
      this.tasksKey,
      tasks.map((t) => (t.id === id ? updated : t)),
    );
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    this.write(
      this.tasksKey,
      this.read<Task>(this.tasksKey).filter((t) => t.id !== id),
    );
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private read<T>(key: string): T[] {
    const raw = this.storage.getItem(key);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  private write<T>(key: string, items: T[], notify = true): void {
    this.storage.setItem(key, JSON.stringify(items));
    if (notify) this.listeners.forEach((listener) => listener());
  }
}
