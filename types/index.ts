/**
 * PostTime-AI 型定義ファイル
 * アプリケーション全体で使用される型を定義
 */

// YouTubeチャンネル情報
export interface YouTubeChannel {
  channelName: string;
  channelIcon: string;
  subscriberCount: number;
  totalViews: number;
  videosAnalyzed: number;
}

// 最適投稿時間
export interface OptimalPostTime {
  rank: number;
  dayOfWeek: string;
  hour: number;
  averageViews: number;
  averageEngagement: number;
  sampleSize: number;
  reason: string;
}

// ヒートマップデータポイント
export interface HeatmapDataPoint {
  day: number; // 0-6 (月曜日-日曜日)
  hour: number; // 0-23
  value: number; // 0-100のスコア
}

// 過去の投稿データ
export interface PastVideo {
  id: number;
  thumbnail: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  engagementRate: number;
}

// パフォーマンスグラフデータポイント
export interface PerformanceDataPoint {
  date: string;
  views: number;
  engagement: number;
}

// SNSプラットフォーム種別
export type SNSPlatform = 'youtube' | 'instagram' | 'twitter' | 'tiktok';

// SNS接続情報
export interface SNSConnection {
  platform: SNSPlatform;
  connected: boolean;
  comingSoon?: boolean;
  accountName?: string;
  accountIcon?: string;
}

// プランタイプ
export type PlanType = 'free' | 'pro' | 'business';

// 料金プラン
export interface PricingPlan {
  type: PlanType;
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
}

// ユーザー情報
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: PlanType;
}

// ダッシュボード統計
export interface DashboardStats {
  totalVideos: number;
  totalViews: number;
  averageEngagement: number;
  subscriberGrowth: number;
}
