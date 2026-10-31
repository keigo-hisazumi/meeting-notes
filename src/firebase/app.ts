import { initializeApp, type FirebaseApp } from 'firebase/app';
import { browserSessionPersistence, connectAuthEmulator, initializeAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { readFirebaseConfig } from './config';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let services: FirebaseServices | null | undefined;

/** Firebase を初期化して返す。設定が無い場合は null */
export function getFirebase(): FirebaseServices | null {
  if (services !== undefined) return services;
  const config = readFirebaseConfig();
  if (!config) {
    services = null;
    return services;
  }
  const app = initializeApp(config);
  services = {
    app,
    // GitHub Pages の同じオリジンの他アプリとストレージを共有するため、
    // ログイン状態は sessionStorage に保持してタブを閉じたら破棄する
    auth: initializeAuth(app, { persistence: browserSessionPersistence }),
    // オフライン用の永続キャッシュは使わず、端末にデータを残さない（既定のメモリキャッシュ）
    db: getFirestore(app),
  };
  // ローカル開発・動作確認用に Firebase Emulator Suite へ接続する（VITE_FIREBASE_EMULATOR=true）
  if (import.meta.env.VITE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(services.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(services.db, '127.0.0.1', 8080);
  }
  return services;
}
