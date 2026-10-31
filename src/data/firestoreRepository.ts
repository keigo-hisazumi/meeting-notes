import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type CollectionReference,
  type Firestore,
} from 'firebase/firestore';
import type { Repository, Unsubscribe } from './repository';
import type { Memo, MemoInput, Task, TaskInput, TaskPatch } from './types';

/** 日付ごとに最後に使った連番を保持するドキュメント（users/{uid}/memoCounters/{date}） */
interface MemoCounter {
  last: number;
}

type MemoData = Omit<Memo, 'id'>;
type TaskData = Omit<Task, 'id'>;

/**
 * Firestore にデータを保存する Repository 実装。
 * データはすべて users/{uid} 配下に置き、firestore.rules で本人だけが読み書きできるようにしている。
 */
export class FirestoreRepository implements Repository {
  private readonly memos: CollectionReference;
  private readonly tasks: CollectionReference;
  private readonly counters: CollectionReference;

  constructor(
    private readonly db: Firestore,
    uid: string,
    private readonly now: () => number = Date.now,
  ) {
    this.memos = collection(db, 'users', uid, 'memos');
    this.tasks = collection(db, 'users', uid, 'tasks');
    this.counters = collection(db, 'users', uid, 'memoCounters');
  }

  watchMemos(onChange: (memos: Memo[]) => void, onError: (error: Error) => void): Unsubscribe {
    return onSnapshot(
      this.memos,
      (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as MemoData) }))),
      onError,
    );
  }

  watchTasks(onChange: (tasks: Task[]) => void, onError: (error: Error) => void): Unsubscribe {
    return onSnapshot(
      this.tasks,
      (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as TaskData) }))),
      onError,
    );
  }

  async createMemo(input: MemoInput): Promise<string> {
    const memoRef = doc(this.memos);
    const counterRef = doc(this.counters, input.date);
    // 連番の採番とメモの作成を 1 つのトランザクションで行い、別端末からの同時作成でも重複させない
    await runTransaction(this.db, async (tx) => {
      const counter = await tx.get(counterRef);
      const seq = ((counter.data() as MemoCounter | undefined)?.last ?? 0) + 1;
      const timestamp = this.now();
      tx.set(counterRef, { last: seq } satisfies MemoCounter);
      tx.set(memoRef, {
        date: input.date,
        seq,
        body: input.body,
        createdAt: timestamp,
        updatedAt: timestamp,
      } satisfies MemoData);
    });
    return memoRef.id;
  }

  async updateMemo(id: string, input: MemoInput): Promise<void> {
    const memoRef = doc(this.memos, id);
    const oldDate = await runTransaction(this.db, async (tx) => {
      const snapshot = await tx.get(memoRef);
      if (!snapshot.exists()) throw new Error('メモが見つかりません');
      const current = snapshot.data() as MemoData;
      if (current.date === input.date) {
        tx.update(memoRef, { body: input.body, updatedAt: this.now() });
        return null;
      }
      const counterRef = doc(this.counters, input.date);
      const counter = await tx.get(counterRef);
      const seq = ((counter.data() as MemoCounter | undefined)?.last ?? 0) + 1;
      tx.set(counterRef, { last: seq } satisfies MemoCounter);
      tx.update(memoRef, { date: input.date, seq, body: input.body, updatedAt: this.now() });
      return current.date;
    });
    if (oldDate) await this.resetCounter(oldDate);
  }

  async deleteMemo(id: string): Promise<void> {
    const memoRef = doc(this.memos, id);
    const [memoSnapshot, relatedTasks] = await Promise.all([
      getDoc(memoRef),
      getDocs(query(this.tasks, where('memoId', '==', id))),
    ]);
    const date = (memoSnapshot.data() as MemoData | undefined)?.date;

    const batch = writeBatch(this.db);
    batch.delete(memoRef);
    relatedTasks.forEach((task) => batch.delete(task.ref));
    await batch.commit();
    if (date) await this.resetCounter(date);
  }

  async createTask(input: TaskInput): Promise<void> {
    const timestamp = this.now();
    await addDoc(this.tasks, {
      title: input.title,
      done: input.done ?? false,
      memoId: input.memoId,
      createdAt: timestamp,
      updatedAt: timestamp,
    } satisfies TaskData);
  }

  async updateTask(id: string, patch: TaskPatch): Promise<void> {
    await updateDoc(doc(this.tasks, id), { ...patch, updatedAt: this.now() });
  }

  async deleteTask(id: string): Promise<void> {
    await deleteDoc(doc(this.tasks, id));
  }

  /**
   * メモの削除や日付変更のあと、その日付の連番カウンターを残っているメモの最大値に戻す。
   * 画面で表示する「次の連番」（既存メモの最大値 + 1）と実際の採番を一致させるため。
   */
  private async resetCounter(date: string): Promise<void> {
    const remaining = await getDocs(query(this.memos, where('date', '==', date)));
    const last = Math.max(0, ...remaining.docs.map((d) => (d.data() as MemoData).seq));
    await setDoc(doc(this.counters, date), { last } satisfies MemoCounter);
  }
}
