import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { TaskForm } from '../components/TaskForm';
import { TaskList, type TaskItem } from '../components/TaskList';
import { useData } from '../data/DataContext';
import type { Memo } from '../data/types';
import { isValidDateString, todayString } from '../lib/date';
import { generateId } from '../lib/id';
import { nextSeq } from '../lib/memo';

/** メモ作成・編集画面。/memos/new は新規作成、/memos/:id は既存メモの編集 */
export function MemoEditPage() {
  const { id } = useParams();
  const { memos, loading } = useData();

  if (!id) return <MemoEditor key="new" memo={null} />;
  if (loading) return <p className="empty">読み込み中…</p>;

  const memo = memos.find((m) => m.id === id);
  if (!memo) {
    return (
      <main className="page">
        <p className="empty">メモが見つかりません。</p>
        <Link to="/">ダッシュボードへ戻る</Link>
      </main>
    );
  }
  return <MemoEditor key={memo.id} memo={memo} />;
}

function MemoEditor({ memo }: { memo: Memo | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { repo, memos, tasks } = useData();
  const [date, setDate] = useState(memo?.date ?? todayString());
  const [body, setBody] = useState(memo?.body ?? '');
  const [draftTasks, setDraftTasks] = useState<TaskItem[]>([]);
  // 新規作成から保存して遷移してきた場合は保存済みの表示にする
  const [status, setStatus] = useState((location.state as { saved?: boolean } | null)?.saved ? '保存しました' : '');
  const [error, setError] = useState('');

  const isNew = memo === null;
  const dateChanged = memo !== null && memo.date !== date;
  const dirty = isNew || dateChanged || memo.body !== body;
  const seq = !isNew && !dateChanged ? memo.seq : nextSeq(memos, date, memo?.id);
  const sameDateCount = memos.filter((m) => m.date === date && m.id !== memo?.id).length;

  // 新規作成中のタスクは保存時にまとめて登録し、既存メモのタスクはその場で保存する
  const memoTasks: TaskItem[] = isNew
    ? draftTasks
    : tasks.filter((t) => t.memoId === memo.id).sort((a, b) => a.createdAt - b.createdAt);

  const addTask = async (taskTitle: string) => {
    if (isNew) setDraftTasks((prev) => [...prev, { id: generateId(), title: taskTitle, done: false, memoId: null }]);
    else await repo.createTask({ title: taskTitle, memoId: memo.id });
  };
  const toggleTask = (task: TaskItem) => {
    if (isNew) setDraftTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    else void repo.updateTask(task.id, { done: !task.done });
  };
  const deleteTask = (task: TaskItem) => {
    if (isNew) setDraftTasks((prev) => prev.filter((t) => t.id !== task.id));
    else void repo.deleteTask(task.id);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!isValidDateString(date)) {
      setError('日付を正しく入力してください');
      return;
    }
    const input = { date, body };
    if (isNew) {
      const created = await repo.createMemo(input);
      for (const task of draftTasks) {
        await repo.createTask({ title: task.title, memoId: created.id, done: task.done });
      }
      navigate(`/memos/${created.id}`, { replace: true, state: { saved: true } });
    } else {
      await repo.updateMemo(memo.id, input);
      setStatus('保存しました');
    }
  };

  const handleDelete = async () => {
    if (!memo) return;
    if (!window.confirm('このメモと、メモに紐づくタスクを削除します。よろしいですか？')) return;
    await repo.deleteMemo(memo.id);
    navigate('/', { replace: true });
  };

  return (
    <main className="page memo-edit">
      <div className="page-actions">
        <Link to="/">← ダッシュボード</Link>
      </div>

      <form className="card" onSubmit={handleSave}>
        <div className="form-header">
          <h2>{isNew ? 'メモを作成' : 'メモを編集'}</h2>
          <span className="save-status" aria-live="polite">
            {dirty ? (isNew ? '' : '未保存の変更があります') : status}
          </span>
          <button type="submit" className="button button-primary" disabled={!dirty}>
            保存
          </button>
        </div>
        <div className="memo-meta">
          <label className="field">
            <span>日付</span>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setStatus('');
              }}
              required
            />
          </label>
          <div className="memo-seq" aria-live="polite">
            <span className="memo-seq-number">#{seq}</span>
            {sameDateCount > 0 && (isNew || dateChanged) && (
              <span className="hint">この日付のメモが {sameDateCount} 件あるため #{seq} として保存します</span>
            )}
          </div>
        </div>
        <label className="field">
          <span>メモ</span>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setStatus('');
            }}
            rows={14}
            placeholder="打ち合わせの内容を記録"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {!isNew && (
          <div className="form-actions">
            <button type="button" className="button button-danger" onClick={() => void handleDelete()}>
              メモを削除
            </button>
          </div>
        )}
      </form>

      <section className="card">
        <h2>このメモのタスク</h2>
        {isNew && <p className="hint">タスクはメモの保存時に登録されます。</p>}
        <TaskForm onAdd={addTask} />
        <TaskList
          tasks={memoTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          emptyMessage="このメモのタスクはありません"
        />
      </section>
    </main>
  );
}
