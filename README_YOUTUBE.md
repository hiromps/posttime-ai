# YouTube Data API v3 連携ガイド

## 概要
このプロジェクトは YouTube Data API v3 と連携して、YouTubeチャンネルのデータを取得・分析できます。

## セットアップ

### 1. Google Cloud Console でAPIキーを取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. 「APIとサービス」→「ライブラリ」から YouTube Data API v3 を有効化
4. 「APIとサービス」→「認証情報」から APIキーを作成
5. APIキーにHTTPリファラー制限を設定：
   - `http://localhost:3000/*`
   - `https://posttime-ai.pages.dev/*`

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```env
# Supabase（認証用）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

## 使用方法

### 開発環境での起動

```bash
npm install
npm run dev
```

### アクセス方法

1. ログイン: http://localhost:3000/login
2. YouTube データ分析: http://localhost:3000/dashboard/youtube-data

### 検索可能な形式

- `@yourhandle` - YouTubeハンドル名
- `チャンネル名` - チャンネル名で検索
- `https://youtube.com/channel/UCxxxxxx` - チャンネルURL
- `UCxxxxxxxxxxxxxx` - チャンネルID

## 機能

- ✅ チャンネル統計情報の表示
- ✅ 動画パフォーマンスの分析
- ✅ エンゲージメント率の追跡
- ✅ 最適な投稿時間の提案
- ✅ 視聴者エンゲージメントの可視化

## トラブルシューティング

### 403 エラーが出る場合
- Google Cloud Console でHTTPリファラー制限を確認
- APIキーが正しく設定されているか確認

### データが表示されない場合
- ブラウザのコンソールでエラーを確認
- YouTube Data API v3 が有効になっているか確認