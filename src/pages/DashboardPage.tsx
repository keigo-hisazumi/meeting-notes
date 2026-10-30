import { Link } from 'react-router-dom';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { useData } from '../data/DataContext';
import { memoLabel, memoPreview, splitRecentMemos } from '../lib/memo';

export function DashboardPage() {
  const { repo, memos, tasks, loading } = useData();
  const { recent, older } = splitRecentMemos(memos);
  const sortedTasks = [...tasks].sort((a, b) => a.createdAt - b.createdAt);

  if (loading) return <p className="empty">読み込み中…</p>;

  return (
    <main className="page dashboard">
      <div className="page-actions">
        <Link to="/memos/new" className="button button-primary">
          ＋ メモを新規作成
        </Link>
      </div>

      <section className="card">
        <h2>タスク</h2>
        <TaskForm onAdd={(title) => repo.createTask({ title, memoId: null }).then(() => undefined)} />
        <TaskList
          tasks={sortedTasks}
          memos={memos}
          onToggle={(task) => void repo.updateTask(task.id, { done: !task.done })}
          onDelete={(task) => void repo.deleteTask(task.id)}
          emptyMessage="残っているタスクはありません"
        />
      </section>

      <section>
        <h2>直近のメモ</h2>
        {recent.length === 0 ? (
          <p className="empty">メモはまだありません</p>
        ) : (
          <div className="memo-cards">
            {recent.map((memo) => {
              const memoTasks = tasks.filter((t) => t.memoId === memo.id);
              const remaining = memoTasks.filter((t) => !t.done).length;
              return (
                <Link key={memo.id} to={`/memos/${memo.id}`} className="card memo-card">
                  <div className="memo-card-date">{memoLabel(memo)}</div>
                  <p className="memo-card-body">{memo.body || '（本文なし）'}</p>
                  {memoTasks.length > 0 && (
                    <div className="memo-card-tasks">
                      タスク 残り {remaining} / {memoTasks.length}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {older.length > 0 && (
        <section className="card">
          <h2>過去のメモ</h2>
          <ul className="memo-links">
            {older.map((memo) => (
              <li key={memo.id}>
                <Link to={`/memos/${memo.id}`}>
                  <span className="memo-link-date">{memoLabel(memo)}</span>
                  <span className="memo-link-preview">{memoPreview(memo.body) || '（本文なし）'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
