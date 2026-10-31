import type { FirebaseOptions } from 'firebase/app';

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;

/**
 * Firebase コンソールの firebaseConfig を解析する。
 * JSON のほか、コンソールに表示される JavaScript のオブジェクトの形
 * （`const firebaseConfig = { apiKey: "..." };` のようにキーにクォートが無い形）もそのまま受け付ける。
 * 解析できない場合や必須の値が欠けている場合は null を返す。
 */
export function parseFirebaseConfig(raw: string | undefined): FirebaseOptions | null {
  if (!raw?.trim()) return null;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end < start) return null;
  const objectText = raw.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(objectText);
  } catch {
    try {
      parsed = JSON.parse(
        objectText
          .replace(/\/\/[^\n]*/g, '') // 行コメント
          .replace(/'/g, '"') // シングルクォート
          .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":') // クォートの無いキー
          .replace(/,\s*}/g, '}'), // 末尾のカンマ
      );
    } catch {
      return null;
    }
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const config = parsed as Record<string, unknown>;
  return REQUIRED_KEYS.every((key) => typeof config[key] === 'string' && config[key])
    ? (config as FirebaseOptions)
    : null;
}

/**
 * ビルド時の環境変数 VITE_FIREBASE_CONFIG から Firebase の設定を読み込む。
 * GitHub Actions では Actions variables の FIREBASE_CONFIG から、ローカルでは `.env.local` から渡す。
 */
export function readFirebaseConfig(env: Record<string, string | undefined> = import.meta.env): FirebaseOptions | null {
  return parseFirebaseConfig(env.VITE_FIREBASE_CONFIG);
}
