import type { Memo, MemoInput, Task, TaskInput, TaskPatch } from './types';

/**
 * メモとタスクの保存先を抽象化したインターフェース。
 * 現在は localStorage 実装（LocalRepository）を使い、Firebase の準備ができたら
 * Firestore 実装に差し替える想定のため、すべて非同期 API にしている。
 */
export interface Repository {
  listMemos(): Promise<Memo[]>;
  getMemo(id: string): Promise<Memo | null>;
  /** 同じ日付のメモがある場合は連番を付けて作成する */
  createMemo(input: MemoInput): Promise<Memo>;
  /** 日付を変更した場合は変更先の日付で連番を付け直す */
  updateMemo(id: string, input: MemoInput): Promise<Memo>;
  /** メモに紐づくタスクも合わせて削除する */
  deleteMemo(id: string): Promise<void>;

  listTasks(): Promise<Task[]>;
  createTask(input: TaskInput): Promise<Task>;
  updateTask(id: string, patch: TaskPatch): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  /** データが変更されたときに呼ばれるリスナーを登録し、解除関数を返す */
  subscribe(listener: () => void): () => void;
}
