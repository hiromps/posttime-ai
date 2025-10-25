'use client';

import { useState } from 'react';
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
  Medal,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
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
import {
  youtubeChannel,
  optimalPostTimes,
  heatmapData,
  pastVideos,
  performanceData,
  sampleUser,
  dashboardStats
} from '@/data/dummyData';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 5;

  // ページネーション計算
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = pastVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(pastVideos.length / videosPerPage);

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

                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                    {sampleUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700">{sampleUser.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
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
                    <p className="text-3xl font-bold">{dashboardStats.totalVideos}</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span>+12%</span>
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
                    <p className="text-3xl font-bold">{dashboardStats.totalViews.toLocaleString()}</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span>+8.3%</span>
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
                    <p className="text-3xl font-bold">{dashboardStats.averageEngagement}%</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span>+2.1%</span>
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
                    <p className="text-sm text-gray-600 mb-1">登録者増加率</p>
                    <p className="text-3xl font-bold">+{dashboardStats.subscriberGrowth}%</p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span>+5.4%</span>
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
              <h2 className="text-xl font-bold mb-4">接続中のアカウント</h2>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Youtube className="w-12 h-12 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{youtubeChannel.channelName}</h3>
                  <p className="text-gray-600">登録者数: {youtubeChannel.subscriberCount.toLocaleString()}人</p>
                </div>
                <Badge variant="success">接続中</Badge>
              </div>
            </Card>
          </motion.div>

          {/* 最適投稿時間 */}
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
                {optimalPostTimes.map((time) => (
                  <div
                    key={time.rank}
                    className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                        ${time.rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                        ${time.rank === 2 ? 'bg-gray-300 text-gray-700' : ''}
                        ${time.rank === 3 ? 'bg-orange-400 text-orange-900' : ''}
                      `}>
                        {time.rank === 1 && <Medal className="w-6 h-6" />}
                        {time.rank !== 1 && time.rank}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="text-lg font-bold">
                          {time.dayOfWeek} {time.hour}:00
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{time.reason}</p>
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

          {/* ヒートマップ */}
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

          {/* エンゲージメント推移グラフ */}
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

          {/* 過去の投稿テーブル */}
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
                            <div className="w-16 h-9 bg-gray-200 rounded flex-shrink-0"></div>
                            <span className="font-medium text-sm">{video.title}</span>
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
                          <Button variant="outline" size="sm">詳細</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ページネーション */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  {indexOfFirstVideo + 1}-{Math.min(indexOfLastVideo, pastVideos.length)} / {pastVideos.length}件
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
        </main>
      </div>
    </div>
  );
}
