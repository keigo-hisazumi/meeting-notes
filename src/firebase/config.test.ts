import { describe, expect, it } from 'vitest';
import { parseFirebaseConfig, readFirebaseConfig } from './config';

const expected = {
  apiKey: 'key',
  authDomain: 'example.firebaseapp.com',
  projectId: 'example',
  storageBucket: 'example.firebasestorage.app',
  messagingSenderId: '123',
  appId: '1:123:web:abc',
};

describe('parseFirebaseConfig', () => {
  it('JSON を解析する', () => {
    expect(parseFirebaseConfig(JSON.stringify(expected))).toEqual(expected);
  });

  it('Firebase コンソールのコードをそのまま解析する', () => {
    const snippet = `// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "key",
  authDomain: "example.firebaseapp.com",
  projectId: "example",
  storageBucket: "example.firebasestorage.app",
  messagingSenderId: "123",
  appId: "1:123:web:abc",
};`;
    expect(parseFirebaseConfig(snippet)).toEqual(expected);
  });

  it('必須の値が欠けていれば null を返す', () => {
    expect(parseFirebaseConfig(JSON.stringify({ ...expected, projectId: '' }))).toBeNull();
    expect(parseFirebaseConfig('{"apiKey":"key"}')).toBeNull();
  });

  it('空や解析できない値は null を返す', () => {
    expect(parseFirebaseConfig(undefined)).toBeNull();
    expect(parseFirebaseConfig('')).toBeNull();
    expect(parseFirebaseConfig('not a config')).toBeNull();
  });
});

describe('readFirebaseConfig', () => {
  it('VITE_FIREBASE_CONFIG から読み込む', () => {
    expect(readFirebaseConfig({ VITE_FIREBASE_CONFIG: JSON.stringify(expected) })).toEqual(expected);
    expect(readFirebaseConfig({})).toBeNull();
  });
});
