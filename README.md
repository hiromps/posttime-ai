# PostTime-AI（ポストタイム・エーアイ）

![PostTime-AI Logo](https://via.placeholder.com/800x200/9333EA/FFFFFF?text=PostTime-AI)

**SNS投稿の最適時間をAIが分析し、エンゲージメントを最大化するオールインワンSaaS**

YouTube、Instagram、Twitter(X)、TikTokなど複数のSNSプラットフォームの投稿最適時間をAI分析で特定し、クリエイターのエンゲージメントを最大化します。

## 🎯 プロジェクト概要

PostTime-AIは、SNSクリエイター向けの投稿最適時間分析SaaSアプリケーションです。過去の投稿データからAIが視聴者の最もアクティブな時間帯を特定し、エンゲージメント向上をサポートします。

### 主な機能

- ✅ **AI分析による最適時間提案** - 過去のデータから最適な投稿時間をTOP3で表示
- ✅ **ヒートマップ分析** - 曜日×時間帯の投稿パフォーマンスを視覚化
- ✅ **複数SNS対応** - YouTube（対応済）、Instagram、Twitter、TikTok（近日公開）
- ✅ **オールインワンダッシュボード** - 全SNSを一つの画面で管理
- ✅ **詳細な統計情報** - 視聴回数、エンゲージメント率、登録者増加率など
- ✅ **パフォーマンス推移グラフ** - 過去30日間のエンゲージメント推移を可視化

## 🚀 技術スタック

- **フレームワーク:** Next.js 14 (App Router)
- **言語:** TypeScript 5
- **スタイリング:** Tailwind CSS 3.4
- **アニメーション:** Framer Motion
- **アイコン:** Lucide React
- **グラフ:** Recharts
- **デプロイ:** Cloudflare Pages

## 📁 プロジェクト構造

```
PostTime-AI/
├── app/                      # Next.js App Router
│   ├── page.tsx             # ランディングページ
│   ├── login/               # ログインページ
│   │   └── page.tsx
│   ├── dashboard/           # ダッシュボード
│   │   └── page.tsx
│   ├── globals.css          # グローバルスタイル
│   └── layout.tsx           # ルートレイアウト
├── components/              # Reactコンポーネント
│   ├── ui/                  # 共通UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   └── dashboard/           # ダッシュボード専用コンポーネント
│       └── Sidebar.tsx
├── data/                    # データファイル
│   └── dummyData.ts         # ダミーデータ
├── types/                   # TypeScript型定義
│   └── index.ts
├── public/                  # 静的ファイル
│   └── images/              # 画像ファイル
├── next.config.mjs          # Next.js設定（Cloudflare Pages対応）
├── tailwind.config.ts       # Tailwind CSS設定
└── package.json             # 依存関係
```

## 🛠️ セットアップ

### 前提条件

- Node.js 18.x以上
- npm または yarn

### インストール手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/yourusername/PostTime-AI.git
cd PostTime-AI
```

2. **依存関係のインストール**

```bash
npm install
# または
yarn install
```

3. **開発サーバーの起動**

```bash
npm run dev
# または
yarn dev
```

4. **ブラウザでアクセス**

```
http://localhost:3000
```

## 🔌 YouTube API統合（NEW!）

### 実装済み機能

PostTime-AIは実際のYouTube Data API v3と統合されています。

#### 利用可能な機能
- ✅ チャンネル情報の取得（登録者数、総視聴回数など）
- ✅ 動画一覧の取得（最大50件）
- ✅ 動画統計の取得（視聴回数、いいね数、コメント数）
- ✅ エンゲージメント率の自動計算
- ✅ 最適投稿時間のAI分析
- ✅ ヒートマップデータの生成

#### APIテストページ

開発サーバーを起動後、以下のURLでAPIテスト機能を利用できます：

```
http://localhost:3000/api-test
```

**使い方:**
1. YouTubeチャンネルIDを入力
2. 「データ取得」ボタンをクリック
3. リアルタイムでチャンネル情報と最適投稿時間が表示されます

#### API関数の使用例

```typescript
import { getChannelInfo, getChannelVideos, analyzeOptimalPostTimes } from '@/lib/youtube';

// チャンネル情報を取得
const channel = await getChannelInfo('UCxxxxxxxxxxxxxx');

// 動画一覧を取得
const videos = await getChannelVideos('UCxxxxxxxxxxxxxx', 50);

// 最適投稿時間を分析
const optimalTimes = analyzeOptimalPostTimes(videos);
```

## 🎨 デザインガイドライン

### カラーパレット

- **Primary:** Purple-600 (#9333ea) → Blue-600 (#2563eb) グラデーション
- **Success:** Green-500
- **Warning:** Yellow-500
- **Error:** Red-500
- **Gray Scale:** Gray-50 ~ Gray-900

### SNSブランドカラー

- **YouTube:** Red-600 (#FF0000)
- **Instagram:** Purple-Pink グラデーション
- **Twitter:** Blue-500 (#1DA1F2)
- **TikTok:** Black (#000000)

## 📦 ビルドとデプロイ

### Cloudflare Pages向けビルド

このプロジェクトはCloudflare Pages向けに最適化されています。

```bash
npm run build
```

ビルド後、`out/` ディレクトリに静的ファイルが出力されます。

### Cloudflare Pagesデプロイ設定

- **ビルドコマンド:** `npm run build`
- **ビルド出力ディレクトリ:** `out`
- **Node.jsバージョン:** 18.x

### 環境変数設定

プロジェクトルートに `.env.local` ファイルを作成してください：

```env
# YouTube Data API（実装済み✅）
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# Instagram API（近日対応）
# NEXT_PUBLIC_INSTAGRAM_APP_ID=your_app_id_here
# NEXT_PUBLIC_INSTAGRAM_APP_SECRET=your_app_secret_here

# Twitter API（近日対応）
# NEXT_PUBLIC_TWITTER_API_KEY=your_api_key_here
# NEXT_PUBLIC_TWITTER_API_SECRET=your_api_secret_here

# TikTok API（近日対応）
# NEXT_PUBLIC_TIKTOK_CLIENT_KEY=your_client_key_here
# NEXT_PUBLIC_TIKTOK_CLIENT_SECRET=your_client_secret_here
```

**YouTube Data API キーの取得方法:**
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成
3. YouTube Data API v3を有効化
4. 認証情報でAPIキーを作成
5. `.env.local`に追加

## 🎯 料金プラン

### 無料プラン
- 1つのSNSアカウント
- 過去30日の分析
- 週1回の更新
- 基本的なダッシュボード

### プロプラン（¥980/月）
- 3つのSNSアカウント
- 過去1年の分析
- 毎日更新
- 競合分析（1つ）
- AI詳細レポート

### ビジネスプラン（¥2,980/月）
- 無制限アカウント
- 全期間分析
- リアルタイム更新
- 競合分析（5つ）
- カスタムレポート
- LINE通知連携

## 🔒 セキュリティ

- OAuth 2.0による安全なSNS連携
- ユーザーデータの暗号化
- HTTPS通信の強制
- CSRF保護
- XSS対策

## 📱 レスポンシブ対応

- **モバイル（sm）:** ハンバーガーメニュー、1カラムレイアウト
- **タブレット（md）:** 2カラムレイアウト
- **デスクトップ（lg+）:** フルレイアウト、サイドバー固定

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順に従ってください：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

## 👥 開発者

開発: Claude Code with AI Assistant

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [Framer Motion](https://www.framer.com/motion/) - アニメーションライブラリ
- [Lucide React](https://lucide.dev/) - アイコンライブラリ
- [Recharts](https://recharts.org/) - チャートライブラリ
- [Cloudflare Pages](https://pages.cloudflare.com/) - ホスティング

## 📞 サポート

ご質問やサポートが必要な場合は、GitHubのIssuesからお問い合わせください。

---

**PostTime-AI** - SNS投稿の最適時間をAIが分析 🚀
