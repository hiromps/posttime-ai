'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { getChannelInfo, getChannelVideos, analyzeOptimalPostTimes, generateHeatmapFromVideos } from '@/lib/youtube';

export default function APITestPage() {
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    if (!channelId) {
      setError('チャンネルIDを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // チャンネル情報を取得
      const channel = await getChannelInfo(channelId);
      setChannelData(channel);

      // 動画一覧を取得
      const videoList = await getChannelVideos(channelId, 50);
      setVideos(videoList);

      // 最適投稿時間を分析
      const optimal = analyzeOptimalPostTimes(videoList);
      setOptimalTimes(optimal);

      console.log('Channel:', channel);
      console.log('Videos:', videoList);
      console.log('Optimal Times:', optimal);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 gradient-text">YouTube API テスト</h1>

        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-4">チャンネルID入力</h2>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="チャンネルID (例: UCxxxxxxxxxxxxxx)"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
            <Button onClick={handleFetchData} disabled={loading}>
              {loading ? '取得中...' : 'データ取得'}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ※ YouTubeチャンネルページのURLから取得できます（例: youtube.com/channel/UCxxxxxxxxxxxxxx）
          </p>
        </Card>

        {error && (
          <Card className="mb-8 bg-red-50 border-2 border-red-200">
            <p className="text-red-600 font-semibold">エラー: {error}</p>
          </Card>
        )}

        {channelData && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-4">チャンネル情報</h2>
            <div className="space-y-2">
              <p><strong>チャンネル名:</strong> {channelData.channelName}</p>
              <p><strong>登録者数:</strong> {channelData.subscriberCount.toLocaleString()}人</p>
              <p><strong>総視聴回数:</strong> {channelData.totalViews.toLocaleString()}回</p>
              <p><strong>動画数:</strong> {channelData.videosAnalyzed}本</p>
            </div>
          </Card>
        )}

        {optimalTimes.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-4">最適投稿時間 TOP3</h2>
            <div className="space-y-4">
              {optimalTimes.map((time, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">
                      #{index + 1} {dayNames[time.dayOfWeek]}曜日 {time.hour}:00
                    </span>
                    <span className="text-sm text-gray-600">
                      サンプル: {time.sampleSize}件
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>平均視聴回数: {time.averageViews.toLocaleString()}回</span>
                    <span>平均エンゲージメント: {time.averageEngagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {videos.length > 0 && (
          <Card>
            <h2 className="text-2xl font-bold mb-4">最近の動画（{videos.length}件）</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {videos.slice(0, 10).map((video) => (
                <div key={video.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{video.title}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>視聴: {video.viewCount.toLocaleString()}</span>
                    <span>エンゲージメント: {video.engagementRate}%</span>
                    <span>{video.publishedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 className="font-bold mb-2">💡 使い方のヒント</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>1. YouTubeチャンネルIDを入力してください</li>
            <li>2. 「データ取得」ボタンをクリック</li>
            <li>3. チャンネル情報と最適投稿時間が表示されます</li>
            <li>4. ブラウザのコンソールで詳細データを確認できます（F12キー）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
