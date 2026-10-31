import type { Memo, MemoInput, Task, TaskInput, TaskPatch } from './types';

export type Unsubscribe = () => void;

/** メモとタスクの保存先を抽象化したインターフェース（実装は FirestoreRepository） */
export interface Repository {
  /** メモの一覧を購読し、変更のたびに onChange を呼ぶ */
  watchMemos(onChange: (memos: Memo[]) => void, onError: (error: Error) => void): Unsubscribe;
  /** タスクの一覧を購読し、変更のたびに onChange を呼ぶ */
  watchTasks(onChange: (tasks: Task[]) => void, onError: (error: Error) => void): Unsubscribe;

  /** 同じ日付のメモがある場合は連番を付けて作成し、作成したメモの ID を返す */
  createMemo(input: MemoInput): Promise<string>;
  /** 日付を変更した場合は変更先の日付で連番を付け直す */
  updateMemo(id: string, input: MemoInput): Promise<void>;
  /** メモに紐づくタスクも合わせて削除する */
  deleteMemo(id: string): Promise<void>;

  createTask(input: TaskInput): Promise<void>;
  updateTask(id: string, patch: TaskPatch): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
