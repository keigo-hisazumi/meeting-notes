import { useEffect, useRef, useState } from 'react';
import type { Repository } from '../data/repository';

/** 入力が止まってから自動保存するまでの待ち時間（ミリ秒） */
const SAVE_DELAY_MS = 800;

/**
 * ダッシュボード上で直接編集できるメモ。
 * 入力が止まったとき・入力欄から離れたとき・画面を離れるときに自動で保存する。
 */
export function DashboardNote({ repo }: { repo: Repository }) {
  const [draft, setDraft] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  // 最後に保存済み（またはサーバーから受け取った）本文。未保存の変更があるかの判定に使う
  const savedRef = useRef('');
  const draftRef = useRef('');
  const timerRef = useRef<number | undefined>(undefined);

  const save = async () => {
    window.clearTimeout(timerRef.current);
    const body = draftRef.current;
    if (body === savedRef.current) return;
    setStatus('保存中…');
    setError('');
    try {
      await repo.saveDashboardNote(body);
      savedRef.current = body;
      setStatus(draftRef.current === body ? '保存しました' : '');
    } catch (e) {
      setStatus('');
      setError(`保存できませんでした（${e instanceof Error ? e.message : String(e)}）`);
    }
  };
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    const unsubscribe = repo.watchDashboardNote(
      (note) => {
        const body = note?.body ?? '';
        // 編集中（未保存の変更がある）ときは、入力中の内容を上書きしない
        if (draftRef.current === savedRef.current) {
          draftRef.current = body;
          setDraft(body);
        }
        savedRef.current = body;
        setLoaded(true);
      },
      (e) => {
        setError(`メモを読み込めませんでした（${e.message}）`);
        setLoaded(true);
      },
    );
    return () => {
      unsubscribe();
      // 画面を離れるときに未保存の変更があれば保存する
      void saveRef.current();
    };
  }, [repo]);

  const handleChange = (value: string) => {
    draftRef.current = value;
    setDraft(value);
    setStatus('');
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void saveRef.current(), SAVE_DELAY_MS);
  };

  return (
    <section className="card">
      <div className="card-heading">
        <h2>メモ</h2>
        {status && <span className="hint">{status}</span>}
      </div>
      <textarea
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => void save()}
        rows={6}
        disabled={!loaded}
        placeholder={loaded ? '自由にメモを書けます（自動で保存されます）' : '読み込み中…'}
        aria-label="ダッシュボードのメモ"
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
