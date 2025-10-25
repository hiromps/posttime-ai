'use client';

import { useState } from 'react';
import { fetchYouTubeData } from '@/lib/youtube-api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Youtube,
  Users,
  Eye,
  Video,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Clock,
  Search,
  AlertCircle,
  RefreshCw,
  BarChart3
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
  Cell
} from 'recharts';

export function YouTubeConnect() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!input.trim()) {
      setError('チャンネル情報を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await fetchYouTubeData(input);

      if (result.success) {
        setData(result);
        setError('');
        // ローカルストレージに保存
        localStorage.setItem('lastYouTubeChannel', input);
      } else {
        setError(result.error || 'エラーが発生しました');
        setData(null);
      }
    } catch (err) {
      setError('接続エラーが発生しました');
      setData(null);
    }

    setLoading(false);
  };

  // 曜日名
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // パフォーマンスデータを準備
  const performanceData = data?.videos?.slice(0, 10).map((video: any) => ({
    title: video.title.substring(0, 20) + '...',
    views: video.viewCount,
    likes: video.likeCount,
    comments: video.commentCount
  })) || [];

  // エンゲージメント率のデータ
  const engagementData = data?.videos?.slice(0, 7).map((video: any) => ({
    date: new Date(video.publishedAt).toLocaleDateString('ja-JP'),
    engagement: ((video.likeCount + video.commentCount) / video.viewCount * 100).toFixed(2),
    views: video.viewCount
  })) || [];

  // 投稿時間分析
  const postingTimes = data?.videos ? analyzePostingTimes(data.videos) : [];

  return (
    <div className="space-y-6">
      {/* 接続フォーム */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Youtube className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold">YouTube チャンネル接続</h2>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="@yourhandle, チャンネル名, または YouTube URL"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                接続中...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                接続
              </>
            )}
          </Button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </Card>

      {/* チャンネル情報 */}
      {data?.channel && (
        <>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={data.channel.thumbnail}
                alt={data.channel.name}
                className="w-24 h-24 rounded-full"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{data.channel.name}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {data.channel.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                      <Users className="w-4 h-4" />
                      <span>登録者</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {data.channel.subscriberCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                      <Eye className="w-4 h-4" />
                      <span>総再生回数</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {data.channel.viewCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                      <Video className="w-4 h-4" />
                      <span>動画数</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {data.channel.videoCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>平均再生回数</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {data.analytics.avgViews.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 分析サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">エンゲージメント率</p>
                  <p className="text-3xl font-bold">{data.analytics.avgEngagement}%</p>
                  <p className="text-sm text-green-500 mt-1">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    業界平均より高い
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">総いいね数</p>
                  <p className="text-3xl font-bold">{data.analytics.totalLikes.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    過去30本の動画
                  </p>
                </div>
                <ThumbsUp className="w-10 h-10 text-red-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">総コメント数</p>
                  <p className="text-3xl font-bold">{data.analytics.totalComments.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    活発なコミュニティ
                  </p>
                </div>
                <MessageSquare className="w-10 h-10 text-green-500" />
              </div>
            </Card>
          </div>

          {/* パフォーマンスグラフ */}
          {performanceData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">動画パフォーマンス</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" name="再生回数" />
                  <Bar dataKey="likes" fill="#EF4444" name="いいね" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* エンゲージメント推移 */}
          {engagementData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">エンゲージメント率の推移</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#10B981"
                    name="エンゲージメント率(%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* 最適な投稿時間 */}
          {postingTimes.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                最適な投稿時間 TOP5
              </h3>
              <div className="space-y-3">
                {postingTimes.map((time, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-700">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {dayNames[time.day]}曜日 {time.hour}:00
                        </p>
                        <p className="text-sm text-gray-500">
                          サンプル数: {time.count}本
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {time.avgViews.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">平均再生回数</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 最新の動画 */}
          {data.videos && data.videos.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">最新の動画</h3>
              <div className="space-y-4">
                {data.videos.slice(0, 5).map((video: any) => (
                  <div key={video.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-40 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1 line-clamp-2">{video.title}</h4>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>👁 {video.viewCount.toLocaleString()}</span>
                        <span>👍 {video.likeCount.toLocaleString()}</span>
                        <span>💬 {video.commentCount.toLocaleString()}</span>
                        <span>⏱ {video.duration}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// 投稿時間分析関数
function analyzePostingTimes(videos: any[]) {
  const timeSlots: { [key: string]: { views: number; count: number } } = {};

  videos.forEach((video: any) => {
    const date = new Date(video.publishedAt);
    const hour = date.getHours();
    const day = date.getDay();
    const key = `${day}-${hour}`;

    if (!timeSlots[key]) {
      timeSlots[key] = { views: 0, count: 0 };
    }

    timeSlots[key].views += video.viewCount;
    timeSlots[key].count += 1;
  });

  const sorted = Object.entries(timeSlots)
    .map(([key, data]) => {
      const [day, hour] = key.split('-').map(Number);
      return {
        day,
        hour,
        avgViews: Math.round(data.views / data.count),
        count: data.count
      };
    })
    .filter(item => item.count >= 2)
    .sort((a, b) => b.avgViews - a.avgViews);

  return sorted.slice(0, 5);
}