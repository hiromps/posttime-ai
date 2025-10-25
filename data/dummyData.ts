/**
 * PostTime-AI ダミーデータ
 * 開発・デモ用のサンプルデータ
 */

import {
  YouTubeChannel,
  OptimalPostTime,
  HeatmapDataPoint,
  PastVideo,
  PerformanceDataPoint,
  SNSConnection,
  PricingPlan,
  User,
  DashboardStats
} from '@/types';

// YouTubeチャンネル情報
export const youtubeChannel: YouTubeChannel = {
  channelName: "サンプルチャンネル",
  channelIcon: "/images/placeholder-avatar.png",
  subscriberCount: 10523,
  totalViews: 1234567,
  videosAnalyzed: 50
};

// 最適投稿時間（上位3つ）
export const optimalPostTimes: OptimalPostTime[] = [
  {
    rank: 1,
    dayOfWeek: "日曜日",
    hour: 20,
    averageViews: 15234,
    averageEngagement: 5.2,
    sampleSize: 5,
    reason: "あなたの視聴者は日曜日の夜に最もアクティブです。この時間帯は視聴回数が平均より35%高くなっています。"
  },
  {
    rank: 2,
    dayOfWeek: "土曜日",
    hour: 18,
    averageViews: 13891,
    averageEngagement: 4.8,
    sampleSize: 4,
    reason: "週末の夕方は視聴者のリラックスタイムで、エンゲージメントが高い傾向にあります。"
  },
  {
    rank: 3,
    dayOfWeek: "金曜日",
    hour: 21,
    averageViews: 12456,
    averageEngagement: 4.5,
    sampleSize: 6,
    reason: "金曜日の夜は週末前の高揚感から、視聴時間が長くなる傾向があります。"
  }
];

// ヒートマップデータ生成関数
export const generateHeatmapData = (): HeatmapDataPoint[] => {
  const data: HeatmapDataPoint[] = [];
  const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let value = Math.random() * 40 + 20; // 基本値: 20-60

      // 特定の時間帯のスコアを上げる
      if ((hour >= 18 && hour <= 22) && (day >= 4 && day <= 6)) {
        // 金土日の18-22時は高スコア
        value = Math.random() * 30 + 70; // 70-100
      } else if (hour >= 6 && hour <= 9) {
        // 朝6-9時は中程度
        value = Math.random() * 20 + 40; // 40-60
      } else if (hour >= 0 && hour <= 5) {
        // 深夜0-5時は低スコア
        value = Math.random() * 20 + 10; // 10-30
      }

      data.push({
        day,
        hour,
        value: Math.round(value)
      });
    }
  }

  return data;
};

export const heatmapData = generateHeatmapData();

// 過去の投稿データ（10件）
export const pastVideos: PastVideo[] = [
  {
    id: 1,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "【最新】YouTube分析ツールの使い方",
    publishedAt: "2025-10-20 20:00",
    viewCount: 18543,
    engagementRate: 6.2
  },
  {
    id: 2,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "SNS運用で失敗しないための5つのポイント",
    publishedAt: "2025-10-18 18:00",
    viewCount: 15432,
    engagementRate: 5.8
  },
  {
    id: 3,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "初心者向け動画編集講座 Part 1",
    publishedAt: "2025-10-15 21:00",
    viewCount: 13256,
    engagementRate: 5.5
  },
  {
    id: 4,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "バズる動画の作り方を徹底解説",
    publishedAt: "2025-10-12 19:30",
    viewCount: 22145,
    engagementRate: 7.1
  },
  {
    id: 5,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "クリエイター向け収益化ガイド",
    publishedAt: "2025-10-10 20:00",
    viewCount: 11234,
    engagementRate: 4.9
  },
  {
    id: 6,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "撮影機材おすすめ10選",
    publishedAt: "2025-10-07 18:30",
    viewCount: 16789,
    engagementRate: 6.0
  },
  {
    id: 7,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "動画のサムネイル作成テクニック",
    publishedAt: "2025-10-05 21:00",
    viewCount: 14523,
    engagementRate: 5.6
  },
  {
    id: 8,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "YouTube Shortsで伸ばす方法",
    publishedAt: "2025-10-02 19:00",
    viewCount: 19876,
    engagementRate: 6.8
  },
  {
    id: 9,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "チャンネル登録者を増やす裏技",
    publishedAt: "2025-09-28 20:30",
    viewCount: 12890,
    engagementRate: 5.3
  },
  {
    id: 10,
    thumbnail: "/images/placeholder-thumb.jpg",
    title: "コメント欄活性化のコツ",
    publishedAt: "2025-09-25 18:00",
    viewCount: 10234,
    engagementRate: 4.7
  }
];

// パフォーマンスグラフデータ（過去30日分）
export const generatePerformanceData = (): PerformanceDataPoint[] => {
  const data: PerformanceDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    // ランダムなデータ生成（トレンドを持たせる）
    const baseViews = 12000 + Math.random() * 8000;
    const baseEngagement = 4.0 + Math.random() * 2.5;

    data.push({
      date: dateStr,
      views: Math.round(baseViews),
      engagement: Math.round(baseEngagement * 10) / 10
    });
  }

  return data;
};

export const performanceData = generatePerformanceData();

// SNS接続情報
export const snsConnections: SNSConnection[] = [
  {
    platform: 'youtube',
    connected: true,
    accountName: 'サンプルチャンネル',
    accountIcon: '/images/placeholder-avatar.png'
  },
  {
    platform: 'instagram',
    connected: false,
    comingSoon: true
  },
  {
    platform: 'twitter',
    connected: false,
    comingSoon: true
  },
  {
    platform: 'tiktok',
    connected: false,
    comingSoon: true
  }
];

// 料金プラン
export const pricingPlans: PricingPlan[] = [
  {
    type: 'free',
    name: '無料プラン',
    price: 0,
    features: [
      '1つのSNSアカウント',
      '過去30日の分析',
      '週1回の更新',
      '基本的なダッシュボード'
    ]
  },
  {
    type: 'pro',
    name: 'プロプラン',
    price: 980,
    popular: true,
    features: [
      '3つのSNSアカウント',
      '過去1年の分析',
      '毎日更新',
      '競合分析（1つ）',
      'AI詳細レポート'
    ]
  },
  {
    type: 'business',
    name: 'ビジネスプラン',
    price: 2980,
    features: [
      '無制限アカウント',
      '全期間分析',
      'リアルタイム更新',
      '競合分析（5つ）',
      'カスタムレポート',
      'LINE通知連携'
    ]
  }
];

// サンプルユーザー
export const sampleUser: User = {
  id: '1',
  name: '山田太郎',
  email: 'yamada@example.com',
  avatar: '/images/placeholder-avatar.png',
  plan: 'pro'
};

// ダッシュボード統計
export const dashboardStats: DashboardStats = {
  totalVideos: 50,
  totalViews: 1234567,
  averageEngagement: 5.6,
  subscriberGrowth: 12.3
};
