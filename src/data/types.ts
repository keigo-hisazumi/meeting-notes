/** 打ち合わせメモ */
export interface Memo {
  id: string;
  /** メモの日付（YYYY-MM-DD） */
  date: string;
  /** 同じ日付内での連番（1 始まり） */
  seq: number;
  /** 打ち合わせ名などの任意のタイトル */
  title: string;
  /** メモ本文（プレーンテキスト） */
  body: string;
  createdAt: number;
  updatedAt: number;
}

/** タスク。memoId が null のものはダッシュボードから追加したタスク */
export interface Task {
  id: string;
  title: string;
  done: boolean;
  memoId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface MemoInput {
  date: string;
  title: string;
  body: string;
}

export interface TaskInput {
  title: string;
  memoId: string | null;
  done?: boolean;
}

export type TaskPatch = Partial<Pick<Task, 'title' | 'done'>>;
