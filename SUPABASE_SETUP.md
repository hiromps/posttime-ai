# Supabase セットアップガイド

このガイドでは、PostTime-AIでSupabaseデータベースを設定する手順を説明します。

## 📋 前提条件

- Supabaseアカウント（[https://supabase.com](https://supabase.com)で作成）
- プロジェクトの環境変数が設定済み

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - Project name: `posttime-ai`
   - Database Password: 強力なパスワードを設定
   - Region: 最寄りのリージョンを選択（例: ap-northeast-1）
4. 「Create new project」をクリック

### 2. データベーススキーマの適用

1. Supabase Dashboard で「SQL Editor」を開く
2. `supabase/schema.sql` ファイルの内容をコピー
3. SQL Editorに貼り付けて実行（Run）

これにより以下のテーブルが作成されます：
- `users` - ユーザー情報
- `youtube_channels` - YouTubeチャンネル情報
- `youtube_videos` - YouTube動画データ
- `optimal_post_times` - 最適投稿時間データ

### 3. Row Level Security (RLS) の確認

スキーマ実行後、以下のRLSポリシーが自動的に設定されます：
- ✅ ユーザーは自分のデータのみ閲覧・編集可能
- ✅ チャンネルデータは所有者のみアクセス可能
- ✅ 動画データと分析結果も同様に保護

### 4. 環境変数の設定

`.env.local` ファイルに以下を追加（既に設定済み）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://wkoyschcknyngqwewrbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. 認証設定（オプション）

Supabase Authを使用する場合：

1. Dashboard > Authentication > Providers
2. Email、Google、GitHubなどを有効化
3. Redirect URLsを設定：
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 📊 テーブル構造

### users テーブル
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
name TEXT NOT NULL
avatar_url TEXT
plan TEXT ('free', 'pro', 'business')
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### youtube_channels テーブル
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
channel_id TEXT UNIQUE NOT NULL
channel_name TEXT NOT NULL
channel_icon TEXT
subscriber_count INTEGER
total_views BIGINT
videos_analyzed INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### youtube_videos テーブル
```sql
id UUID PRIMARY KEY
channel_id UUID REFERENCES youtube_channels(id)
video_id TEXT UNIQUE NOT NULL
title TEXT NOT NULL
thumbnail TEXT
published_at TIMESTAMPTZ NOT NULL
view_count INTEGER
like_count INTEGER
comment_count INTEGER
engagement_rate DECIMAL(5,2)
created_at TIMESTAMPTZ
```

### optimal_post_times テーブル
```sql
id UUID PRIMARY KEY
channel_id UUID REFERENCES youtube_channels(id)
day_of_week INTEGER (0-6)
hour INTEGER (0-23)
average_views INTEGER
average_engagement DECIMAL(5,2)
sample_size INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
UNIQUE(channel_id, day_of_week, hour)
```

## 🔧 使用例

### チャンネルデータの保存

```typescript
import { saveYouTubeChannel } from '@/lib/supabase-helpers';

const channel = await saveYouTubeChannel({
  user_id: 'user-uuid',
  channel_id: 'UCxxxxxxxxxxxxxx',
  channel_name: 'サンプルチャンネル',
  channel_icon: 'https://...',
  subscriber_count: 10000,
  total_views: 1000000,
  videos_analyzed: 50
});
```

### 最適投稿時間の取得

```typescript
import { getTopOptimalPostTimes } from '@/lib/supabase-helpers';

const optimalTimes = await getTopOptimalPostTimes('channel-uuid', 3);
// TOP3の最適投稿時間を取得
```

### チャンネル統計の取得

```typescript
import { getChannelStats } from '@/lib/supabase-helpers';

const stats = await getChannelStats('channel-uuid');
console.log(stats);
// { totalVideos: 50, totalViews: 1000000, averageEngagement: 5.6 }
```

## 🔒 セキュリティ

### Row Level Security (RLS)

すべてのテーブルでRLSが有効化されています：

- **users**: 自分のデータのみ閲覧・更新可能
- **youtube_channels**: 自分のチャンネルのみ管理可能
- **youtube_videos**: 自分のチャンネルの動画のみアクセス可能
- **optimal_post_times**: 自分のチャンネルの分析結果のみ閲覧可能

### APIキーの管理

- **SUPABASE_URL**: 公開OK
- **SUPABASE_ANON_KEY**: 公開OK（RLSで保護）
- **SUPABASE_SERVICE_ROLE_KEY**: 絶対に公開しない（管理用）

## 📈 パフォーマンス最適化

作成済みのインデックス：
- `idx_youtube_channels_user_id` - ユーザーごとのチャンネル検索
- `idx_youtube_videos_channel_id` - チャンネルごとの動画検索
- `idx_youtube_videos_published_at` - 日付順ソート
- `idx_optimal_post_times_channel_id` - 分析結果の高速取得

## 🐛 トラブルシューティング

### 接続エラー

```
Error: Invalid API key
```
→ `.env.local`の環境変数を確認

### RLSエラー

```
Error: new row violates row-level security policy
```
→ Supabase Authで認証していることを確認

### スキーマエラー

```
Error: relation "users" does not exist
```
→ `schema.sql`を実行していることを確認

## 📞 サポート

問題が発生した場合：
1. Supabase Dashboard > Logs を確認
2. Browser Console でエラーメッセージを確認
3. GitHubのIssuesで報告

---

**PostTime-AI x Supabase** - 強力なデータ分析基盤 🚀
