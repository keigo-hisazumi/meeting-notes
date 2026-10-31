# 打ち合わせメモ

仕事の打ち合わせのメモを日付ごとに記録し、打ち合わせで出たタスクとダッシュボードで追加したタスクをまとめて管理する Web アプリです。データは Firebase（Authentication と Cloud Firestore）に保存し、どの端末からでも同じデータを使えます。

## 主な機能

- メールアドレスとパスワードでのログイン（Firebase コンソールで作成した自分のアカウントだけが使える）
- ダッシュボードからのタスクの追加
- ダッシュボードとメモで追加したタスクの一覧表示（チェックで取り消し線、削除ボタンで一覧から削除）
- 直近 3 件のメモの全文表示と、それ以降のメモのリンク一覧
- 日付ごとのメモの作成・編集・削除（日付の初期値は今日で、変更も可能）
- 同じ日付のメモへの連番（`#1`、`#2` …）の自動付番
- メモごとのタスクの追加

## 使い方

1. Firebase コンソールで作成したメールアドレスとパスワードでログインする
2. ダッシュボードの「＋ メモを新規作成」からメモ作成画面を開く
3. 日付とメモ本文を入力し、必要ならタスクを追加して画面上部の「保存」を押す
4. ダッシュボードのタスク一覧でチェックを付けて完了にし、不要になったら「削除」で一覧から消す

## データの保存とログイン

- メモは `users/{uid}/memos`、タスクは `users/{uid}/tasks`、日付ごとの連番の管理は `users/{uid}/memoCounters/{日付}` に保存する
- `firestore.rules` で、ログインしている本人の `users/{uid}` 配下だけを読み書きできるようにしている
- 同じ日付のメモの連番は、Firestore のトランザクションで採番する
- GitHub Pages の同じオリジンで動く他のアプリとブラウザのストレージを共有するため、ログイン状態は sessionStorage に保持し（タブを閉じるとログアウトされる）、Firestore のオフライン用の永続キャッシュは使わない
- 以前のバージョンでブラウザ（localStorage）に保存したメモとタスクは Firebase に取り込まない。不要であれば、ブラウザのサイトデータから `meeting-notes:` で始まるキーを削除する

## Firebase の設定

初回だけ次の設定が必要です。

1. Firebase コンソールでプロジェクトを作成し、ウェブアプリを追加して `firebaseConfig` の値を控える
2. Authentication の「ログイン方法」でメール / パスワードを有効にする
3. Authentication の「ユーザー」で自分のアカウントを追加する
4. Authentication の「設定」→「ユーザー アクション」で、作成（登録）を無効にする（自分以外がアカウントを作れないようにする）
5. Cloud Firestore のデータベースを作成する
6. `firestore.rules` の内容を Firestore の「ルール」に貼り付けて公開するか、`npx firebase-tools deploy --only firestore:rules --project <プロジェクト ID>` でデプロイする
7. GitHub のリポジトリの Settings →「Secrets and variables」→「Actions」→「Variables」に `FIREBASE_CONFIG` を追加し、値に `firebaseConfig` を貼り付ける（下の例のような JSON のほか、Firebase コンソールに表示されるコードをそのまま貼り付けてもよい）
8. Google Cloud コンソールの「API とサービス」→「認証情報」で、ブラウザ用 API キーに HTTP リファラーの制限（`https://keigo-hisazumi.github.io/*` と、ローカル開発用の `http://localhost:*/*`）を付ける
9. Actions の「Deploy to GitHub Pages」を手動実行し、設定を含めてビルドし直す

`FIREBASE_CONFIG` の値の例:

```json
{
  "apiKey": "AIza...",
  "authDomain": "<プロジェクト ID>.firebaseapp.com",
  "projectId": "<プロジェクト ID>",
  "storageBucket": "<プロジェクト ID>.firebasestorage.app",
  "messagingSenderId": "123456789012",
  "appId": "1:123456789012:web:abcdef"
}
```

`apiKey`・`authDomain`・`projectId`・`appId` は必須です。

Firebase の設定がビルドに含まれていない場合、アプリは「Firebase の設定がありません」と表示します。

## 技術スタック

- TypeScript
- React
- React Router（GitHub Pages で動かすため `HashRouter` を使用）
- Firebase（Authentication / Cloud Firestore）
- Vite
- Vitest
- GitHub Pages

## 開発

### 必要な環境

- Node.js 22

### ローカルでの Firebase の設定

`.env.example` を `.env.local` にコピーし、`VITE_FIREBASE_CONFIG` に `firebaseConfig` を JSON で 1 行に書く（`.env.local` はコミットしない）。

Firebase Emulator Suite を使う場合は、Java をインストールしたうえで次のコマンドでエミュレーターを起動し、`.env.local` の `VITE_FIREBASE_EMULATOR` を `true` にする。ユーザーはエミュレーターの Auth に作成する。

```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-meeting-notes
```

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
│   ├── auth/          # ログイン処理（Firebase Authentication と React のコンテキスト）
│   ├── components/    # ヘッダー・タスク一覧などの共通コンポーネント
│   ├── data/          # メモとタスクの型・Repository・Firestore 実装
│   ├── firebase/      # Firebase の設定の読み込みと初期化
│   ├── lib/           # 日付やメモの連番などの処理
│   └── pages/         # ログイン・ダッシュボード・メモ作成画面
├── public/            # ファビコンなどの静的ファイル
├── .env.example       # ローカル開発用の Firebase 設定の雛形
├── firebase.json      # Firebase CLI の設定（ルールのデプロイ・エミュレーター）
├── firestore.rules    # Firestore のセキュリティルール
├── index.html         # エントリーポイントの HTML
└── vite.config.ts     # Vite と Vitest の設定
```

## デプロイ

- main への PR マージ時に GitHub Pages（<https://keigo-hisazumi.github.io/meeting-notes/>）へデプロイされる
- PR ごとに `pr-<番号>/` 配下へプレビューがデプロイされる
- どちらも Firebase の設定は Actions variables の `FIREBASE_CONFIG` からビルド時に渡す

## 開発ルール

[`AGENTS.md`](./AGENTS.md) を参照してください（開発ルールの正本）。

## ライセンス

MIT License
