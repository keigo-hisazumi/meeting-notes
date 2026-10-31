import { useMemo } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { FirebaseAuthService } from './auth/authService';
import { Header } from './components/Header';
import { DataProvider } from './data/DataContext';
import { FirestoreRepository } from './data/firestoreRepository';
import { getFirebase, type FirebaseServices } from './firebase/app';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MemoEditPage } from './pages/MemoEditPage';

function AppRoutes({ firebase }: { firebase: FirebaseServices }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const repo = useMemo(() => (uid ? new FirestoreRepository(firebase.db, uid) : null), [firebase, uid]);

  if (user === undefined) return <p className="empty">読み込み中…</p>;
  if (!user || !repo) return <LoginPage />;

  return (
    <DataProvider key={user.uid} repo={repo}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/memos/new" element={<MemoEditPage />} />
        <Route path="/memos/:id" element={<MemoEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataProvider>
  );
}

/** Firebase の設定がビルドに含まれていない場合の画面 */
function MissingConfig() {
  return (
    <main className="page">
      <section className="card">
        <h2>Firebase の設定がありません</h2>
        <p>
          ビルド時に Firebase の設定（<code>VITE_FIREBASE_CONFIG</code>）が渡されていません。README の「Firebase
          の設定」を確認してください。
        </p>
      </section>
    </main>
  );
}

export function App() {
  const firebase = getFirebase();
  const authService = useMemo(() => (firebase ? new FirebaseAuthService(firebase.auth) : null), [firebase]);

  // GitHub Pages ではサーバー側でルーティングできないため HashRouter を使う
  return (
    <HashRouter>
      {firebase && authService ? (
        <AuthProvider service={authService}>
          <div className="app">
            <Header />
            <div className="app-body">
              <AppRoutes firebase={firebase} />
            </div>
          </div>
        </AuthProvider>
      ) : (
        <div className="app">
          <header className="app-header">
            <span className="app-title">打ち合わせメモ</span>
          </header>
          <div className="app-body">
            <MissingConfig />
          </div>
        </div>
      )}
    </HashRouter>
  );
}
