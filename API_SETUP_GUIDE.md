# YouTube API 403エラー解決ガイド

## エラーの内容
```
Failed to load resource: the server responded with a status of 403
Error: YouTube API Error: 403
```

## 解決手順

### 1. Google Cloud Console での設定確認

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「認証情報」へ移動
4. 使用しているAPIキーをクリック

### 2. HTTPリファラー制限の正しい設定

「アプリケーションの制限」セクションで以下を設定：

#### 開発環境用
```
http://localhost:3000/*
http://localhost:3000
http://localhost/*
http://127.0.0.1:3000/*
```

#### 本番環境用
```
https://posttime-ai.pages.dev/*
https://*.pages.dev/*
```

### 3. API制限の設定

「API の制限」セクションで：
1. 「キーを制限」を選択
2. 「YouTube Data API v3」のみを選択

### 4. 設定後の待機

- 変更を保存してから **1-2分待つ**（変更が反映されるまで時間がかかります）

### 5. ブラウザキャッシュのクリア

開発者ツール（F12）で：
1. Networkタブを開く
2. 「Disable cache」にチェック
3. ページを再読み込み（Ctrl+Shift+R）

## 代替解決策：制限なしAPIキー（開発環境のみ）

開発環境でのテスト用として、一時的に制限を外す：

1. Google Cloud Console で APIキーの設定を開く
2. 「アプリケーションの制限」を「なし」に設定
3. 保存して1-2分待つ

**重要**: 本番環境では必ずHTTPリファラー制限を設定してください。

## クライアントサイド実装の確認

現在の実装はクライアントサイドから直接YouTube APIを呼び出しています：

```typescript
// lib/youtube.ts または lib/youtube-api.ts
const response = await fetch(
  `${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&key=${YOUTUBE_API_KEY}`
);
```

この方法では、ブラウザが自動的に以下のヘッダーを送信：
- `Referer: http://localhost:3000/dashboard/...`

このRefererヘッダーがGoogle Cloud Consoleの設定と一致している必要があります。

## デバッグ方法

### 1. Networkタブで確認

1. Chrome DevTools → Network タブ
2. APIリクエストを探す（`googleapis.com`）
3. Request Headers の `Referer` を確認
4. このRefererがGoogle Cloud Consoleの許可リストに含まれているか確認

### 2. エラーレスポンスの詳細確認

403エラーのレスポンスボディに詳細情報が含まれている場合があります：

```json
{
  "error": {
    "code": 403,
    "message": "Requests from referer <empty> are blocked.",
    "errors": [...]
  }
}
```

## よくある問題と対策

### 問題1: "Requests from referer <empty> are blocked"
**原因**: Refererヘッダーが送信されていない
**対策**:
- 直接URLアクセスではなく、アプリケーション内のリンクからアクセス
- メタタグで referrer policy を設定

### 問題2: ワイルドカード設定が機能しない
**原因**: `http://localhost:3000/*` の設定ミス
**対策**:
```
http://localhost:3000/*
http://localhost:3000
```
両方を追加

### 問題3: httpsとhttpの混在
**原因**: 開発環境がhttpだが、httpsで設定している
**対策**: httpとhttps両方を許可リストに追加

## 推奨される最終設定

Google Cloud Console のHTTPリファラー制限：

```
# 開発環境
http://localhost:3000/*
http://localhost:3000
http://127.0.0.1:3000/*
http://127.0.0.1:3000

# 本番環境
https://posttime-ai.pages.dev/*
https://posttime-ai.pages.dev
```

設定後、必ず以下を確認：
1. 設定を保存
2. 1-2分待つ
3. ブラウザキャッシュをクリア
4. ページを再読み込み