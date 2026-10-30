import { STORAGE_PREFIX } from '../data/localRepository';
import { generateId } from '../lib/id';

export interface AuthUser {
  uid: string;
  name: string;
}

/**
 * 認証処理を抽象化したインターフェース。
 * 現在はブラウザ内で完結する LocalAuthService を使い、
 * Firebase の準備ができたら Firebase Authentication の実装に差し替える。
 */
export interface AuthService {
  currentUser(): AuthUser | null;
  /** アカウントが登録済みかどうか（未登録なら初回登録画面を表示する） */
  hasAccount(): boolean;
  register(name: string, password: string): Promise<AuthUser>;
  login(name: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
}

interface StoredAccount {
  uid: string;
  name: string;
  salt: string;
  hash: string;
  iterations: number;
}

const ACCOUNT_KEY = `${STORAGE_PREFIX}auth/account`;
const SESSION_KEY = `${STORAGE_PREFIX}auth/session`;
const PBKDF2_ITERATIONS = 210_000;
export const MIN_PASSWORD_LENGTH = 8;

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function hashPassword(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return toBase64(new Uint8Array(bits));
}

/**
 * ブラウザ内で完結する簡易ログイン。
 * パスワードは PBKDF2 でハッシュ化して localStorage に保存し、ログイン状態は sessionStorage に保持する
 * （タブを閉じるとログアウトされる）。
 * 端末を触れる他人の閲覧を防ぐための仕組みであり、サーバー側での保護ではない点に注意。
 */
export class LocalAuthService implements AuthService {
  constructor(
    private readonly storage: Storage = window.localStorage,
    private readonly session: Storage = window.sessionStorage,
    private readonly iterations: number = PBKDF2_ITERATIONS,
  ) {}

  currentUser(): AuthUser | null {
    const account = this.readAccount();
    if (!account || this.session.getItem(SESSION_KEY) !== account.uid) return null;
    return { uid: account.uid, name: account.name };
  }

  hasAccount(): boolean {
    return this.readAccount() !== null;
  }

  async register(name: string, password: string): Promise<AuthUser> {
    if (this.hasAccount()) throw new Error('アカウントは既に登録されています');
    const trimmed = name.trim();
    if (!trimmed) throw new Error('ユーザー名を入力してください');
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`パスワードは ${MIN_PASSWORD_LENGTH} 文字以上にしてください`);
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const account: StoredAccount = {
      uid: generateId(),
      name: trimmed,
      salt: toBase64(salt),
      hash: await hashPassword(password, salt, this.iterations),
      iterations: this.iterations,
    };
    this.storage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    this.session.setItem(SESSION_KEY, account.uid);
    return { uid: account.uid, name: account.name };
  }

  async login(name: string, password: string): Promise<AuthUser> {
    const account = this.readAccount();
    if (!account) throw new Error('アカウントが登録されていません');
    const hash = await hashPassword(password, fromBase64(account.salt), account.iterations);
    if (account.name !== name.trim() || hash !== account.hash) {
      throw new Error('ユーザー名またはパスワードが違います');
    }
    this.session.setItem(SESSION_KEY, account.uid);
    return { uid: account.uid, name: account.name };
  }

  async logout(): Promise<void> {
    this.session.removeItem(SESSION_KEY);
  }

  private readAccount(): StoredAccount | null {
    const raw = this.storage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAccount;
    } catch {
      return null;
    }
  }
}
