'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Menu,
  Bell,
  ChevronDown,
  Users,
  Eye,
  Heart,
  Youtube,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Video,
  ThumbsUp,
  MessageSquare,
  LogOut,
  Settings,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getChannelInfo, getChannelVideos, analyzeOptimalPostTimes, generateHeatmapFromVideos } from '@/lib/youtube';
import { getCurrentUser, signOut } from '@/lib/auth';

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
}

interface ChannelData {
  channelId: string;
  channelName: string;
  channelIcon: string;
  subscriberCount: number;
  totalViews: number;
  videosAnalyzed: number;
}

export default function YouTubeDashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 認証状態管理
  const [user, setUser] = useState<{email?: string} | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // データ状態管理
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<{dayOfWeek: number; hour: number; averageViews: number; averageEngagement: number; sampleSize: number}[]>([]);
  const [heatmapData, setHeatmapData] = useState<{day: number; hour: number; value: number}[]>([]);

  // 分析データ
  const [engagementTrend, setEngagementTrend] = useState<{date: string; engagement: number; views: number}[]>([]);
  const [videoPerformance, setVideoPerformance] = useState<{title: string; views: number; engagement: number}[]>([]);
  const [contentTypeDistribution, setContentTypeDistribution] = useState<{name: string; value: number}[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    avgViews: 0,
    avgEngagement: 0,
    totalLikes: 0,
    totalComments: 0,
    viewsGrowth: 0,
    engagementGrowth: 0
  });

  // チャンネルデータを取得
  const fetchChannelData = async (channelId: string) => {
    setLoading(true);
    try {
      // チャンネル情報取得
      const channel = await getChannelInfo(channelId);
      setChannelData(channel);

      // 動画一覧取得（最大50件）
      const videoList = await getChannelVideos(channelId, 50);
      setVideos(videoList);

      // 最適投稿時間分析
      const optimal = analyzeOptimalPostTimes(videoList);
      setOptimalTimes(optimal);

      // ヒートマップ生成
      const heatmap = generateHeatmapFromVideos(videoList);
      setHeatmapData(heatmap);

      // エンゲージメント推移データ生成
      const trend = generateEngagementTrend(videoList);
      setEngagementTrend(trend);

      // 動画パフォーマンスTOP10
      const topVideos = videoList
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10)
        .map(v => ({
          title: v.title.length > 30 ? v.title.substring(0, 30) + '...' : v.title,
          views: v.viewCount,
          engagement: v.engagementRate
        }));
      setVideoPerformance(topVideos);

      // コンテンツタイプ分布（仮のデータ - 実際はタイトルやタグから分類）
      const distribution = analyzeContentTypes(videoList);
      setContentTypeDistribution(distribution);

      // 週次統計
      const stats = calculateWeeklyStats(videoList);
      setWeeklyStats(stats);

    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      alert('YouTubeデータの取得に失敗しました。チャンネルが接続されているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  // エンゲージメント推移データ生成
  const generateEngagementTrend = (videoList: VideoData[]) => {
    const sortedVideos = [...videoList]
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      .slice(-30); // 最新30件

    return sortedVideos.map(v => ({
      date: new Date(v.publishedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      engagement: v.engagementRate,
      views: Math.round(v.viewCount / 1000) // 千単位に変換
    }));
  };

  // コンテンツタイプ分析（タイトルから簡易的に分類）
  const analyzeContentTypes = (videoList: VideoData[]) => {
    const types: {[key: string]: number} = {
      'チュートリアル': 0,
      'レビュー': 0,
      'Vlog': 0,
      'ゲーム実況': 0,
      'その他': 0
    };

    videoList.forEach(video => {
      const title = video.title.toLowerCase();
      if (title.includes('tutorial') || title.includes('解説') || title.includes('使い方')) {
        types['チュートリアル']++;
      } else if (title.includes('review') || title.includes('レビュー')) {
        types['レビュー']++;
      } else if (title.includes('vlog') || title.includes('日常')) {
        types['Vlog']++;
      } else if (title.includes('ゲーム') || title.includes('実況') || title.includes('game')) {
        types['ゲーム実況']++;
      } else {
        types['その他']++;
      }
    });

    return Object.entries(types)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  // 週次統計計算
  const calculateWeeklyStats = (videoList: VideoData[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = videoList.filter(v => new Date(v.publishedAt) >= oneWeekAgo);
    const lastWeek = videoList.filter(v => {
      const date = new Date(v.publishedAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    const avgViews = thisWeek.length > 0
      ? Math.round(thisWeek.reduce((sum: number, v) => sum + v.viewCount, 0) / thisWeek.length)
      : 0;

    const avgEngagement = thisWeek.length > 0
      ? parseFloat((thisWeek.reduce((sum: number, v) => sum + v.engagementRate, 0) / thisWeek.length).toFixed(1))
      : 0;

    const totalLikes = thisWeek.reduce((sum: number, v) => sum + v.likeCount, 0);
    const totalComments = thisWeek.reduce((sum: number, v) => sum + v.commentCount, 0);

    const lastWeekAvgViews = lastWeek.length > 0
      ? lastWeek.reduce((sum: number, v) => sum + v.viewCount, 0) / lastWeek.length
      : 0;

    const lastWeekAvgEngagement = lastWeek.length > 0
      ? lastWeek.reduce((sum: number, v) => sum + v.engagementRate, 0) / lastWeek.length
      : 0;

    const viewsGrowth = lastWeekAvgViews > 0
      ? parseFloat(((avgViews - lastWeekAvgViews) / lastWeekAvgViews * 100).toFixed(1))
      : 0;

    const engagementGrowth = lastWeekAvgEngagement > 0
      ? parseFloat(((avgEngagement - lastWeekAvgEngagement) / lastWeekAvgEngagement * 100).toFixed(1))
      : 0;

    return {
      avgViews,
      avgEngagement,
      totalLikes,
      totalComments,
      viewsGrowth,
      engagementGrowth
    };
  };

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // 初回ロード時にチャンネル情報を読み込み
  useEffect(() => {
    if (!authLoading && user) {
      const lastChannelId = localStorage.getItem('lastChannelId');
      if (lastChannelId) {
        fetchChannelData(lastChannelId);
      } else {
        router.push('/dashboard');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, router]);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('ログアウトに失敗しました');
    }
  };

  // 認証読み込み中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">読み込み中...</h2>
        </div>
      </div>
    );
  }

  // チャンネル未接続
  if (!loading && !channelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <div className="text-center py-12 px-8">
            <Youtube className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold mb-2">YouTubeチャンネル未接続</h2>
            <p className="text-gray-600 mb-6">
              まずダッシュボードでYouTubeチャンネルを接続してください。
            </p>
            <Link href="/dashboard">
              <Button>
                ダッシュボードへ戻る
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const dayLabels = ['月', '火', '水', '木', '金', '土', '日'];

  // ヒートマップ用の色取得関数
  const getHeatColor = (value: number) => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-orange-500';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-blue-400';
    return 'bg-blue-200';
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* サイドバー */}
      <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* メインコンテンツ */}
      <div className="flex-1 lg:ml-64">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">YouTube分析</h1>
                  <p className="text-sm text-gray-600">{channelData?.channelName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => channelData && fetchChannelData(channelData.channelId)}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  更新
                </Button>

                <button className="relative p-2 rounded-lg hover:bg-gray-100">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block font-medium text-gray-700">
                      {user?.email?.split('@')[0] || 'ユーザー'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">無料プラン</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 block"
                    >
                      <Settings className="w-4 h-4" />
                      <span>プロフィール設定</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-b-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ログアウト</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* チャンネル概要 */}
          {channelData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <Youtube className="w-10 h-10 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{channelData.channelName}</h2>
                    <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{channelData.subscriberCount.toLocaleString()} 登録者</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Video className="w-4 h-4" />
                        <span>{videos.length} 動画分析</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{channelData.totalViews.toLocaleString()} 総視聴回数</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="success">接続中</Badge>
                </div>
              </Card>
            </motion.div>
          )}

          {/* 週次統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">平均視聴回数</p>
                    <p className="text-3xl font-bold">{weeklyStats.avgViews.toLocaleString()}</p>
                    <div className={`flex items-center mt-2 text-sm ${weeklyStats.viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {weeklyStats.viewsGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      <span>{Math.abs(weeklyStats.viewsGrowth)}% 先週比</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">平均エンゲージメント</p>
                    <p className="text-3xl font-bold">{weeklyStats.avgEngagement}%</p>
                    <div className={`flex items-center mt-2 text-sm ${weeklyStats.engagementGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {weeklyStats.engagementGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      <span>{Math.abs(weeklyStats.engagementGrowth)}% 先週比</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">総いいね数</p>
                    <p className="text-3xl font-bold">{weeklyStats.totalLikes.toLocaleString()}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      <span>今週</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">総コメント数</p>
                    <p className="text-3xl font-bold">{weeklyStats.totalComments.toLocaleString()}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span>今週</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* エンゲージメント推移とコンテンツタイプ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <h2 className="text-xl font-bold mb-6">エンゲージメント推移</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis yAxisId="left" stroke="#888" />
                      <YAxis yAxisId="right" orientation="right" stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="views"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="視聴回数(千)"
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="engagement"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="エンゲージメント率(%)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <h2 className="text-xl font-bold mb-6">コンテンツタイプ分布</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contentTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* 動画パフォーマンスTOP10 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card>
              <h2 className="text-xl font-bold mb-6">動画パフォーマンス TOP10</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={videoPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="title" type="category" width={150} stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" name="視聴回数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* 最適投稿時間 */}
          {optimalTimes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">最適投稿時間 TOP3</h2>
                  <Badge variant="purple">AI分析</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {optimalTimes.map((time, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                          ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                          ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                          ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                        `}>
                          {index + 1}
                        </div>
                        <Badge variant="gray" size="sm">
                          {time.sampleSize}件
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="text-lg font-bold">
                          {dayLabels[time.dayOfWeek]}曜日
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="text-lg font-bold">
                          {time.hour}:00
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">平均視聴回数</span>
                          <span className="font-semibold">{time.averageViews.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">平均エンゲージメント</span>
                          <span className="font-semibold">{time.averageEngagement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ヒートマップ */}
          {heatmapData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <Card>
                <h2 className="text-xl font-bold mb-6">投稿パフォーマンスヒートマップ</h2>
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    {/* 時間ラベル */}
                    <div className="flex mb-2">
                      <div className="w-12"></div>
                      {Array.from({ length: 24 }, (_, i) => (
                        <div key={i} className="w-8 text-center text-xs text-gray-600">
                          {i}
                        </div>
                      ))}
                    </div>

                    {/* ヒートマップ */}
                    {dayLabels.map((day, dayIndex) => (
                      <div key={day} className="flex items-center mb-1">
                        <div className="w-12 text-sm text-gray-600 font-medium">{day}</div>
                        {Array.from({ length: 24 }, (_, hourIndex) => {
                          const dataPoint = heatmapData.find(
                            (d) => d.day === dayIndex && d.hour === hourIndex
                          );
                          const value = dataPoint?.value || 0;

                          return (
                            <div
                              key={hourIndex}
                              className={`w-8 h-8 m-0.5 rounded ${getHeatColor(value)} cursor-pointer hover:scale-110 transition-transform`}
                              title={`${day} ${hourIndex}:00 - スコア: ${value}`}
                            />
                          );
                        })}
                      </div>
                    ))}

                    {/* 凡例 */}
                    <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-600">
                      <span>低</span>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 bg-blue-200 rounded"></div>
                        <div className="w-6 h-6 bg-blue-400 rounded"></div>
                        <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                        <div className="w-6 h-6 bg-orange-500 rounded"></div>
                        <div className="w-6 h-6 bg-red-500 rounded"></div>
                      </div>
                      <span>高</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* 最近の動画リスト */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.0 }}
          >
            <Card>
              <h2 className="text-xl font-bold mb-6">最近の動画（最新10件）</h2>
              <div className="space-y-4">
                {videos.slice(0, 10).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-18 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{video.title}</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{video.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{video.likeCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{video.commentCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>{video.engagementRate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={video.engagementRate >= 6 ? 'success' : 'gray'}>
                        {video.engagementRate}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-2">{video.publishedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
