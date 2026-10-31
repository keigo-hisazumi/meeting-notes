import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Repository } from './repository';
import type { Memo, Task } from './types';

interface DataContextValue {
  repo: Repository;
  memos: Memo[];
  tasks: Task[];
  loading: boolean;
  error: string;
}

const DataContext = createContext<DataContextValue | null>(null);

/** ログイン中のユーザーのメモとタスクを購読し、変更があれば画面に反映する */
export function DataProvider({ repo, children }: { repo: Repository; children: ReactNode }) {
  const [memos, setMemos] = useState<Memo[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleError = (e: Error) => setError(`データを読み込めませんでした（${e.message}）`);
    const unsubscribeMemos = repo.watchMemos(setMemos, handleError);
    const unsubscribeTasks = repo.watchTasks(setTasks, handleError);
    return () => {
      unsubscribeMemos();
      unsubscribeTasks();
    };
  }, [repo]);

  const value: DataContextValue = {
    repo,
    memos: memos ?? [],
    tasks: tasks ?? [],
    loading: memos === null || tasks === null,
    error,
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData は DataProvider の内側で使用してください');
  return value;
}
