# 打ち合わせメモ

仕事の打ち合わせのメモを日付ごとに記録し、打ち合わせで出たタスクとダッシュボードで追加したタスクをまとめて管理する Web アプリです。現在はデータをブラウザ内（localStorage）に保存し、将来 Firebase に移行する想定です。

## 主な機能

- ログイン画面（初回はユーザー名とパスワードを登録し、以降は自分だけがログインできる）
- ダッシュボードからのタスクの追加
- ダッシュボードとメモで追加したタスクの一覧表示（チェックで取り消し線、削除ボタンで一覧から削除）
- 直近 3 件のメモのカード表示と、それ以降のメモのリンク一覧
- 日付ごとのメモの作成・編集・削除（日付の初期値は今日で、変更も可能）
- 同じ日付のメモへの連番（`#1`、`#2` …）の自動付番
- メモごとのタスクの追加

## 使い方

1. 初回アクセス時にユーザー名とパスワード（8 文字以上）を登録する
2. ダッシュボードの「＋ メモを新規作成」からメモ作成画面を開く
3. 日付・タイトル・メモ本文を入力し、必要ならタスクを追加して「保存」を押す
4. ダッシュボードのタスク一覧でチェックを付けて完了にし、不要になったら「削除」で一覧から消す

## データの保存とログイン

- メモとタスクは localStorage の `meeting-notes:users/{uid}/memos` と `meeting-notes:users/{uid}/tasks` に保存する。データはその端末・ブラウザ内にだけ残り、他の端末とは同期されない
- ログイン情報は PBKDF2 でハッシュ化したパスワードを localStorage に保存し、ログイン状態は sessionStorage に保持する（タブを閉じるとログアウトされる）
- 現在のログインは、端末を触れる他人に見られないようにするための簡易的な仕組みで、データ自体は暗号化していない。GitHub Pages の同じオリジンで動く他のアプリからは localStorage を読めるため、機密性の高い内容は記録しない
- パスワードを忘れた場合は、ブラウザのサイトデータ（`meeting-notes:` で始まる localStorage のキー）を削除すると初回登録からやり直せる（メモとタスクも消える）

## Firebase への移行

データの読み書きは `src/data/repository.ts` の `Repository`、ログインは `src/auth/authService.ts` の `AuthService` で抽象化している。Firebase の準備ができたら次の手順で移行する。

1. Firestore を使う `Repository` 実装と、Firebase Authentication を使う `AuthService` 実装を追加する
2. `src/data/DataContext.tsx` と `src/auth/AuthContext.tsx` で使う実装を差し替える
3. `firestore.rules`（`users/{uid}` 配下を本人だけが読み書きできるルール）をデプロイする
4. 同じ日付のメモの連番は、Firestore ではトランザクションで採番する

## 技術スタック

- TypeScript
- React
- React Router（GitHub Pages で動かすため `HashRouter` を使用）
- Vite
- Vitest
- GitHub Pages

## 開発

### 必要な環境

- Node.js 22

### コマンド

```bash
npm ci             # 依存関係のインストール
npm run dev        # 開発サーバーの起動
npm run build      # 型チェックと本番ビルド（dist/ に出力）
npm run preview    # ビルド結果の確認
npm run type-check # 型チェック
npm test           # ユニットテスト
```

## ディレクトリ構成

```text
.
├── src/
│   ├── auth/          # ログイン処理（AuthService と React のコンテキスト）
│   ├── components/    # ヘッダー・タスク一覧などの共通コンポーネント
│   ├── data/          # メモとタスクの型・Repository・localStorage 実装
│   ├── lib/           # 日付やメモの連番などの処理
│   ├── pages/         # ログイン・ダッシュボード・メモ作成画面
│   └── test/          # テスト用のヘルパー
├── public/            # ファビコンなどの静的ファイル
├── firestore.rules    # Firebase 移行後の Firestore セキュリティルール
├── index.html         # エントリーポイントの HTML
└── vite.config.ts     # Vite と Vitest の設定
```

## デプロイ

- main への PR マージ時に GitHub Pages（<https://keigo-hisazumi.github.io/meeting-notes/>）へデプロイされる
- PR ごとに `pr-<番号>/` 配下へプレビューがデプロイされる

## 開発ルール

[`AGENTS.md`](./AGENTS.md) を参照してください（開発ルールの正本）。

## ライセンス

MIT License
