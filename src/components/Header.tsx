import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="app-header">
      <Link to="/" className="app-title">
        打ち合わせメモ
      </Link>
      {user && (
        <div className="header-user">
          <span className="header-name">{user.email}</span>
          <button type="button" className="button button-ghost" onClick={() => void logout()}>
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
}
