import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { LocalRepository } from './localRepository';
import type { Repository } from './repository';
import type { Memo, Task } from './types';

interface DataContextValue {
  repo: Repository;
  memos: Memo[];
  tasks: Task[];
  loading: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

/** ログイン中のユーザーのメモとタスクを読み込み、変更があれば再読み込みする */
export function DataProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [repo] = useState<Repository>(() => new LocalRepository(uid));
  const [memos, setMemos] = useState<Memo[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [nextMemos, nextTasks] = await Promise.all([repo.listMemos(), repo.listTasks()]);
    setMemos(nextMemos);
    setTasks(nextTasks);
    setLoading(false);
  }, [repo]);

  useEffect(() => {
    void reload();
    return repo.subscribe(() => void reload());
  }, [repo, reload]);

  return <DataContext.Provider value={{ repo, memos, tasks, loading }}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData は DataProvider の内側で使用してください');
  return value;
}
