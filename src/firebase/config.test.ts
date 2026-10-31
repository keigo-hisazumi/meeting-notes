import { describe, expect, it } from 'vitest';
import { readFirebaseConfig } from './config';

const env = {
  VITE_FIREBASE_API_KEY: 'key',
  VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'example',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
};

describe('readFirebaseConfig', () => {
  it('環境変数から設定を組み立てる', () => {
    expect(readFirebaseConfig(env)).toEqual({
      apiKey: 'key',
      authDomain: 'example.firebaseapp.com',
      projectId: 'example',
      appId: '1:123:web:abc',
    });
  });

  it('必須の値が欠けていれば null を返す', () => {
    expect(readFirebaseConfig({ ...env, VITE_FIREBASE_PROJECT_ID: '' })).toBeNull();
    expect(readFirebaseConfig({})).toBeNull();
  });
});
