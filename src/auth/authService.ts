import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
}

/** 認証処理を抽象化したインターフェース（実装は FirebaseAuthService） */
export interface AuthService {
  /** ログイン状態の変化を購読する。初回の状態確定時にも呼ばれる */
  onChange(listener: (user: AuthUser | null) => void): () => void;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

/**
 * Firebase Authentication のメールアドレスとパスワードによるログイン。
 * ユーザーは Firebase コンソールで作成し、アプリからの新規登録はできないようにしている。
 */
export class FirebaseAuthService implements AuthService {
  constructor(private readonly auth: Auth) {}

  onChange(listener: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) =>
      listener(user ? { uid: user.uid, email: user.email ?? '' } : null),
    );
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email.trim(), password);
    } catch (error) {
      throw new Error(loginErrorMessage(error));
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}

/** Firebase Authentication のエラーを画面に表示するメッセージに変換する */
export function loginErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : '';
  if (code.startsWith('auth/api-key-not-valid')) return 'Firebase の設定（API キー）が正しくありません';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'メールアドレスまたはパスワードが違います';
    case 'auth/too-many-requests':
      return 'ログインの試行回数が多すぎます。しばらくしてから再度お試しください';
    case 'auth/network-request-failed':
      return 'ネットワークに接続できません';
    default:
      return 'ログインに失敗しました';
  }
}
