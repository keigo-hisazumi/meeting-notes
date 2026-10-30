import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Header } from './components/Header';
import { DataProvider } from './data/DataContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MemoEditPage } from './pages/MemoEditPage';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <DataProvider key={user.uid} uid={user.uid}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/memos/new" element={<MemoEditPage />} />
        <Route path="/memos/:id" element={<MemoEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataProvider>
  );
}

export function App() {
  // GitHub Pages ではサーバー側でルーティングできないため HashRouter を使う
  return (
    <HashRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <div className="app-body">
            <AppRoutes />
          </div>
        </div>
      </AuthProvider>
    </HashRouter>
  );
}
