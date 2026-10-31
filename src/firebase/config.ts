import type { FirebaseOptions } from 'firebase/app';

/**
 * ビルド時の環境変数から Firebase の設定を読み込む。
 * GitHub Actions では Actions variables（FIREBASE_*）から、ローカルでは `.env.local` から渡す。
 * 必須の値が欠けている場合は null を返す。
 */
export function readFirebaseConfig(env: Record<string, string | undefined> = import.meta.env): FirebaseOptions | null {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  return Object.values(config).every((value) => value) ? config : null;
}
