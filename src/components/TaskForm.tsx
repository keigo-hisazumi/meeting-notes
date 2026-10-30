import { useState, type FormEvent } from 'react';

interface Props {
  onAdd(title: string): void | Promise<void>;
  placeholder?: string;
}

/** タスクのタイトルを入力して追加するフォーム */
export function TaskForm({ onAdd, placeholder = '新しいタスクを入力' }: Props) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await onAdd(trimmed);
    setTitle('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        aria-label="タスク名"
      />
      <button type="submit" className="button button-primary" disabled={!title.trim()}>
        追加
      </button>
    </form>
  );
}
