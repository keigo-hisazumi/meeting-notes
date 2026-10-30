import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { MIN_PASSWORD_LENGTH } from '../auth/authService';

/** ログイン画面。アカウント未登録の場合は初回登録フォームを表示する */
export function LoginPage() {
  const { hasAccount, login, register } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!hasAccount && password !== confirm) {
      setError('確認用パスワードが一致しません');
      return;
    }
    setSubmitting(true);
    try {
      if (hasAccount) await login(name, password);
      else await register(name, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました');
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>{hasAccount ? 'ログイン' : '初回登録'}</h1>
        {!hasAccount && (
          <p className="hint">
            この端末で使うユーザー名とパスワードを登録してください（{MIN_PASSWORD_LENGTH} 文字以上）。
          </p>
        )}
        <label className="field">
          <span>ユーザー名</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" required />
        </label>
        <label className="field">
          <span>パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={hasAccount ? 'current-password' : 'new-password'}
            required
          />
        </label>
        {!hasAccount && (
          <label className="field">
            <span>パスワード（確認）</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary button-block" disabled={submitting}>
          {hasAccount ? 'ログイン' : '登録してはじめる'}
        </button>
      </form>
    </main>
  );
}
