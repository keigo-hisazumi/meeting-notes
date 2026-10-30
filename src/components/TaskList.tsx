import { Link } from 'react-router-dom';
import type { Memo } from '../data/types';
import { memoLabel } from '../lib/memo';

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
  memoId: string | null;
}

interface Props {
  tasks: TaskItem[];
  onToggle(task: TaskItem): void;
  onDelete(task: TaskItem): void;
  /** 指定した場合、メモから追加したタスクに元のメモへのリンクを表示する */
  memos?: Memo[];
  emptyMessage?: string;
}

/** チェックボックスと削除ボタン付きのタスク一覧。完了したタスクには取り消し線を付ける */
export function TaskList({ tasks, onToggle, onDelete, memos, emptyMessage = 'タスクはありません' }: Props) {
  if (tasks.length === 0) return <p className="empty">{emptyMessage}</p>;

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const memo = memos && task.memoId ? memos.find((m) => m.id === task.memoId) : undefined;
        return (
          <li key={task.id} className={task.done ? 'task-item done' : 'task-item'}>
            <label className="task-label">
              <input type="checkbox" checked={task.done} onChange={() => onToggle(task)} />
              <span className="task-title">{task.title}</span>
            </label>
            {memos && (
              <span className="task-source">
                {memo ? <Link to={`/memos/${memo.id}`}>{memoLabel(memo)}</Link> : 'ダッシュボード'}
              </span>
            )}
            <button
              type="button"
              className="button button-danger button-small"
              onClick={() => onDelete(task)}
              aria-label={`「${task.title}」を削除`}
            >
              削除
            </button>
          </li>
        );
      })}
    </ul>
  );
}
