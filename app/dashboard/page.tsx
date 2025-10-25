'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Menu,
  Bell,
  ChevronDown,
  Users,
  Eye,
  Heart,
  Youtube,
  Medal,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  LogOut,
  Settings
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getChannelInfo, getChannelVideos, analyzeOptimalPostTimes, generateHeatmapFromVideos, resolveChannelId } from '@/lib/youtube';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 5;

  // 認証状態管理
  const [user, setUser] = useState<{email?: string} | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // データ状態管理
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState<{channelName: string; subscriberCount: number} | null>(null);
  const [videos, setVideos] = useState<{id: string; title: string; thumbnail: string; publishedAt: string; viewCount: number; engagementRate: number}[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<{dayOfWeek: number; hour: number; averageViews: number; averageEngagement: number; sampleSize: number}[]>([]);
  const [heatmapData, setHeatmapData] = useState<{day: number; hour: number; value: number}[]>([]);
  const [performanceData, setPerformanceData] = useState<{date: string; views: number; engagement: number}[]>([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    averageEngagement: 0,
    subscriberGrowth: 0
  });

  // チャンネルデータを取得
  const fetchChannelData = async (input: string) => {
    setLoading(true);
    try {
      // チャンネルIDを解決（@ハンドル、URL、チャンネルIDに対応）
      const resolvedChannelId = await resolveChannelId(input);

      // チャンネル情報取得
      const channel = await getChannelInfo(resolvedChannelId);
      setChannelData(channel);

      // 動画一覧取得
      const videoList = await getChannelVideos(resolvedChannelId, 50);
      setVideos(videoList);

      // 最適投稿時間分析
      const optimal = analyzeOptimalPostTimes(videoList);
      setOptimalTimes(optimal);

      // ヒートマップ生成
      const heatmap = generateHeatmapFromVideos(videoList);
      setHeatmapData(heatmap);

      // パフォーマンスグラフデータ生成（過去30日）
      const performanceGraph = generatePerformanceGraph(videoList);
      setPerformanceData(performanceGraph);

      // 統計計算
      const totalViews = videoList.reduce((sum: number, v: {viewCount: number}) => sum + v.viewCount, 0);
      const avgEngagement = videoList.length > 0
        ? videoList.reduce((sum: number, v: {engagementRate: number}) => sum + v.engagementRate, 0) / videoList.length
        : 0;

      setStats({
        totalVideos: videoList.length,
        totalViews,
        averageEngagement: parseFloat(avgEngagement.toFixed(1)),
        subscriberGrowth: 0 // APIでは取得不可のため0
      });

      // ローカルストレージに保存（入力値とチャンネルIDの両方）
      localStorage.setItem('lastChannelInput', input);
      localStorage.setItem('lastChannelId', resolvedChannelId);
    } catch (error) {
      console.error('Error fetching channel data:', error);
      const errorMessage = error instanceof Error ? error.message : 'データの取得に失敗しました。';
      alert(`エラー: ${errorMessage}\n\n入力例:\n・チャンネルID: UCxxxxxxxxxxxxxx\n・@ハンドル: @Galaxy0324\n・URL: https://youtube.com/@Galaxy0324`);
    } finally {
      setLoading(false);
    }
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

  // 初回ロード時に前回のチャンネル情報を読み込み
  useEffect(() => {
    if (!authLoading && user) {
      const lastChannelInput = localStorage.getItem('lastChannelInput');
      if (lastChannelInput) {
        setChannelId(lastChannelInput);
        fetchChannelData(lastChannelInput);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

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

  // パフォーマンスグラフデータ生成
  const generatePerformanceGraph = (videoList: {publishedAt: string; viewCount: number; engagementRate: number}[]) => {
    // 動画を日付でグループ化して過去30日分のデータを作成
    const sortedVideos = [...videoList].sort((a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );

    const graphData: {date: string; views: number; engagement: number}[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

      // その日に公開された動画を探す
      const dayVideos = sortedVideos.filter(v => {
        const videoDate = new Date(v.publishedAt);
        return videoDate.toDateString() === date.toDateString();
      });

      const views = dayVideos.reduce((sum, v) => sum + v.viewCount, 0);
      const engagement = dayVideos.length > 0
        ? dayVideos.reduce((sum, v) => sum + v.engagementRate, 0) / dayVideos.length
        : 0;

      graphData.push({
        date: dateStr,
        views: Math.round(views),
        engagement: Math.round(engagement * 10) / 10
      });
    }

    return graphData;
  };

  // 曜日のラベル
  const dayLabels = ['月', '火', '水', '木', '金', '土', '日'];

  // ヒートマップ用の色取得関数
  const getHeatColor = (value: number) => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-orange-500';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-blue-400';
    return 'bg-blue-200';
  };

  // ページネーション計算
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(videos.length / videosPerPage);

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
                <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
              </div>

              <div className="flex items-center space-x-4">
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

                  {/* ドロップダウンメニュー */}
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
          {/* チャンネルID入力セクション */}
          {!channelData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="text-center py-12">
                  <Youtube className="w-16 h-16 mx-auto mb-4 text-red-600" />
                  <h2 className="text-2xl font-bold mb-2">YouTubeチャンネルを接続</h2>
                  <p className="text-gray-600 mb-6">
                    チャンネルID、@ハンドル名、URLのいずれかを入力してください
                  </p>
                  <div className="max-w-md mx-auto flex gap-4">
                    <Input
                      type="text"
                      placeholder="@Galaxy0324 または UCxxxxxx"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && channelId && !loading) {
                          fetchChannelData(channelId);
                        }
                      }}
                    />
                    <Button onClick={() => fetchChannelData(channelId)} disabled={loading || !channelId}>
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          接続
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 mt-4 space-y-1">
                    <p className="font-semibold">入力例:</p>
                    <p>• @ハンドル: @Galaxy0324</p>
                    <p>• チャンネルID: UCAU1BvGtvG_DKy70U6P3p1A</p>
                    <p>• URL: https://youtube.com/@Galaxy0324</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* データ表示（チャンネルが接続されている場合） */}
          {channelData && (
            <>
              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0 }}
                >
                  <Card hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">総動画数</p>
                        <p className="text-3xl font-bold">{stats.totalVideos}</p>
                        <div className="flex items-center mt-2 text-sm text-green-600">
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          <span>分析済み</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Youtube className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">総視聴回数</p>
                        <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>累計</span>
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
                        <p className="text-3xl font-bold">{stats.averageEngagement}%</p>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>いいね+コメント</span>
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
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">登録者数</p>
                        <p className="text-3xl font-bold">{channelData.subscriberCount.toLocaleString()}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>現在</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* 接続SNSカード */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">接続中のアカウント</h2>
                    <Button variant="outline" size="sm" onClick={() => {
                      setChannelData(null);
                      setChannelId('');
                      localStorage.removeItem('lastChannelId');
                      localStorage.removeItem('lastChannelInput');
                    }}>
                      変更
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Youtube className="w-12 h-12 text-red-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{channelData.channelName}</h3>
                      <p className="text-gray-600">登録者数: {channelData.subscriberCount.toLocaleString()}人</p>
                    </div>
                    <Badge variant="success">接続中</Badge>
                  </div>
                </Card>
              </motion.div>

              {/* 最適投稿時間 */}
              {optimalTimes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">最適投稿時間 TOP3</h2>
                      <Badge variant="purple">AI分析</Badge>
                    </div>

                    <div className="space-y-4">
                      {optimalTimes.map((time, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex-shrink-0">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                              ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                              ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                              ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                            `}>
                              {index === 0 && <Medal className="w-6 h-6" />}
                              {index !== 0 && index + 1}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="w-5 h-5 text-purple-600" />
                              <span className="text-lg font-bold">
                                {dayLabels[time.dayOfWeek]}曜日 {time.hour}:00
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span>{time.averageViews.toLocaleString()}回</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4 text-pink-600" />
                                <span>{time.averageEngagement}%</span>
                              </div>
                              <Badge variant="gray" size="sm">
                                サンプル: {time.sampleSize}件
                              </Badge>
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
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Card>
                    <h2 className="text-xl font-bold mb-6">投稿パフォーマンス分析</h2>
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

              {/* エンゲージメント推移グラフ */}
              {performanceData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <Card>
                    <h2 className="text-xl font-bold mb-6">エンゲージメント推移（過去30日）</h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
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
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="views"
                            stroke="#2563eb"
                            strokeWidth={2}
                            name="視聴回数"
                            dot={false}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="engagement"
                            stroke="#9333ea"
                            strokeWidth={2}
                            name="エンゲージメント率(%)"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* 過去の投稿テーブル */}
              {videos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <Card>
                    <h2 className="text-xl font-bold mb-6">最近の投稿</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">動画</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">公開日時</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">視聴回数</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">エンゲージメント</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">アクション</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentVideos.map((video) => (
                            <tr key={video.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-16 h-9 object-cover rounded flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x67/gray/white?text=No+Image';
                                    }}
                                  />
                                  <span className="font-medium text-sm line-clamp-2">{video.title}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{video.publishedAt}</td>
                              <td className="py-3 px-4 text-right font-medium">{video.viewCount.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">
                                <Badge variant={video.engagementRate >= 6 ? 'success' : 'gray'}>
                                  {video.engagementRate}%
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <a
                                  href={`https://youtube.com/watch?v=${video.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm">詳細</Button>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ページネーション */}
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600">
                        {indexOfFirstVideo + 1}-{Math.min(indexOfLastVideo, videos.length)} / {videos.length}件
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === page
                                ? 'bg-purple-600 text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
