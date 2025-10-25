# YouTube API 403エラー解決方法

## 🔍 エラー診断

### 1. APIキーテストページで確認

開発環境で以下にアクセス：
```
http://localhost:3000/test-api
```

このページで以下を確認できます：
- APIキーが正しく設定されているか
- 現在のURLとオリジン
- APIリクエストが成功するか

### 2. ブラウザのコンソールで確認

F12キーを押して開発者ツールを開き、Consoleタブで以下を確認：

- `🔍 YouTube API Request:` - リクエストの詳細
- `❌ YouTube API Error:` - エラーの詳細
- `🚨 403 Error Details:` - 403エラーの詳細情報

## 🛠️ 解決手順

### ステップ1: 環境変数の確認

`.env.local` ファイルを確認：

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyC...（あなたのAPIキー）
```

**重要**: `NEXT_PUBLIC_` プレフィックスが必要です！

### ステップ2: Google Cloud Console の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「認証情報」
4. 使用しているAPIキーをクリック

### ステップ3: HTTPリファラー制限の設定

#### 開発環境用
```
http://localhost:3000/*
http://localhost:3000
http://127.0.0.1:3000/*
http://127.0.0.1:3000
```

#### 本番環境用（Cloudflare Pages）
```
https://posttime-ai.pages.dev/*
https://posttime-ai.pages.dev
https://*.pages.dev/*
```

### ステップ4: API制限の設定

1. 「APIの制限」セクションで「キーを制限」を選択
2. 「YouTube Data API v3」のみを選択
3. 保存

### ステップ5: 待機と確認

1. 設定を保存してから **1-2分待つ**
2. ブラウザのキャッシュをクリア（Ctrl+Shift+R）
3. `/test-api` ページでテスト

## 🚨 よくある問題と対策

### 問題1: "Requests from referer <empty> are blocked"

**原因**: Refererヘッダーが送信されていない

**対策**:
- 直接URLアクセスではなく、アプリ内のリンクからアクセス
- HTTPリファラー制限に `http://localhost:3000` を追加（末尾の`/*`なし）

### 問題2: "API key not valid"

**原因**: APIキーが無効または間違っている

**対策**:
1. APIキーを再度コピー（スペースや改行が含まれていないか確認）
2. YouTube Data API v3 が有効になっているか確認
3. 新しいAPIキーを生成

### 問題3: 403エラーが続く

**原因**: 制限設定が反映されていない

**対策**:
1. 一時的に「アプリケーションの制限」を「なし」に設定
2. 動作確認後、HTTPリファラー制限を再設定
3. Cloudflare Pagesの場合、デプロイ後のURLを確認

## 📝 デバッグチェックリスト

- [ ] `.env.local` に `NEXT_PUBLIC_YOUTUBE_API_KEY` が設定されている
- [ ] APIキーに余分なスペースや改行がない
- [ ] YouTube Data API v3 が有効になっている
- [ ] Google Cloud Console でHTTPリファラー制限が正しく設定されている
- [ ] 設定を保存してから1-2分待った
- [ ] ブラウザのキャッシュをクリアした
- [ ] `/test-api` ページでAPIキーのテストが成功する

## 🔧 代替ソリューション

### オプション1: 開発環境での一時的な解決

Google Cloud Console で：
1. APIキーの「アプリケーションの制限」を「なし」に設定
2. 開発とテストを実施
3. 本番環境用に別のAPIキーを作成して制限を設定

### オプション2: サーバーサイドプロキシ

Next.js API Routes を使用してサーバーサイドでAPIを呼び出す方法もありますが、
Cloudflare Pages では動作しないため、クライアントサイド実装を推奨します。

## 📞 サポート

問題が解決しない場合：

1. ブラウザのコンソールログをすべてコピー
2. `/test-api` ページの結果をスクリーンショット
3. Google Cloud Console のAPIキー設定画面をスクリーンショット
4. これらの情報と共に問題を報告してください