import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

/** ログイン画面。アカウントは Firebase コンソールで作成したものだけを使う */
export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました');
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>ログイン</h1>
        <label className="field">
          <span>メールアドレス</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </label>
        <label className="field">
          <span>パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary button-block" disabled={submitting}>
          ログイン
        </button>
      </form>
    </main>
  );
}
