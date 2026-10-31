import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';
import { loginErrorMessage } from './authService';

describe('loginErrorMessage', () => {
  it('認証情報の誤りは共通のメッセージにする', () => {
    expect(loginErrorMessage(new FirebaseError('auth/invalid-credential', ''))).toBe(
      'メールアドレスまたはパスワードが違います',
    );
    expect(loginErrorMessage(new FirebaseError('auth/user-not-found', ''))).toBe(
      'メールアドレスまたはパスワードが違います',
    );
  });

  it('試行回数の超過を案内する', () => {
    expect(loginErrorMessage(new FirebaseError('auth/too-many-requests', ''))).toContain('試行回数');
  });

  it('API キーの誤りを案内する', () => {
    expect(loginErrorMessage(new FirebaseError('auth/api-key-not-valid.-please-pass-a-valid-api-key.', ''))).toBe(
      'Firebase の設定（API キー）が正しくありません',
    );
  });

  it('不明なエラーは汎用のメッセージにする', () => {
    expect(loginErrorMessage(new Error('unknown'))).toBe('ログインに失敗しました');
  });
});
