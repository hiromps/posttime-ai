/**
 * YouTube Data API v3 ユーティリティ関数
 */

interface YouTubeVideoSnippet {
  id: { videoId: string };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
      default: { url: string };
    };
    description: string;
  };
}

interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
      default: { url: string };
    };
    description: string;
  };
  statistics: {
    viewCount: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails?: {
    duration: string;
  };
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * チャンネル情報を取得
 */
export async function getChannelInfo(channelId: string) {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = data.items[0];

    return {
      channelId: channel.id,
      channelName: channel.snippet.title,
      channelIcon: channel.snippet.thumbnails.default.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount),
      totalViews: parseInt(channel.statistics.viewCount),
      videosAnalyzed: parseInt(channel.statistics.videoCount),
      description: channel.snippet.description,
    };
  } catch (error) {
    console.error('Error fetching channel info:', error);
    throw error;
  }
}

/**
 * チャンネルの動画一覧を取得
 */
export async function getChannelVideos(channelId: string, maxResults: number = 50) {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items) {
      return [];
    }

    // 各動画の詳細情報を取得
    const videoIds = data.items.map((item: YouTubeVideoSnippet) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!detailsResponse.ok) {
      throw new Error(`YouTube API Error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    return detailsData.items.map((video: YouTubeVideoDetails) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url,
      publishedAt: new Date(video.snippet.publishedAt).toLocaleString('ja-JP'),
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      commentCount: parseInt(video.statistics.commentCount || '0'),
      // エンゲージメント率 = (いいね数 + コメント数) / 視聴回数 * 100
      engagementRate: parseInt(video.statistics.viewCount || '0') > 0
        ? parseFloat(
            (
              ((parseInt(video.statistics.likeCount || '0') + parseInt(video.statistics.commentCount || '0')) /
                parseInt(video.statistics.viewCount || '0')) *
              100
            ).toFixed(1)
          )
        : 0,
    }));
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    throw error;
  }
}

/**
 * 動画の詳細情報を取得
 */
export async function getVideoDetails(videoId: string) {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = data.items[0];

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      publishedAt: new Date(video.snippet.publishedAt),
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      commentCount: parseInt(video.statistics.commentCount || '0'),
      duration: video.contentDetails?.duration || '',
      engagementRate: parseInt(video.statistics.viewCount || '0') > 0
        ? parseFloat(
            (
              ((parseInt(video.statistics.likeCount || '0') + parseInt(video.statistics.commentCount || '0')) /
                parseInt(video.statistics.viewCount || '0')) *
              100
            ).toFixed(1)
          )
        : 0,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

interface VideoAnalysisData {
  publishedAt: string;
  viewCount: number;
  engagementRate: number;
}

/**
 * 投稿時間の最適化分析
 * （実際のAI分析機能は別途実装が必要）
 */
export function analyzeOptimalPostTimes(videos: VideoAnalysisData[]) {
  // 動画を曜日と時間帯でグループ化
  const timeSlots: { [key: string]: { views: number; engagement: number; count: number } } = {};

  videos.forEach((video) => {
    const date = new Date(video.publishedAt);
    const dayOfWeek = date.getDay(); // 0 = 日曜日
    const hour = date.getHours();
    const key = `${dayOfWeek}-${hour}`;

    if (!timeSlots[key]) {
      timeSlots[key] = { views: 0, engagement: 0, count: 0 };
    }

    timeSlots[key].views += video.viewCount;
    timeSlots[key].engagement += video.engagementRate;
    timeSlots[key].count += 1;
  });

  // 平均を計算してソート
  const results = Object.entries(timeSlots)
    .map(([key, data]) => {
      const [dayOfWeek, hour] = key.split('-').map(Number);
      return {
        dayOfWeek,
        hour,
        averageViews: Math.round(data.views / data.count),
        averageEngagement: parseFloat((data.engagement / data.count).toFixed(1)),
        sampleSize: data.count,
      };
    })
    .filter((item) => item.sampleSize >= 2) // 最低2件のサンプルが必要
    .sort((a, b) => b.averageViews - a.averageViews);

  return results.slice(0, 3); // TOP3を返す
}

/**
 * ヒートマップデータを生成
 */
export function generateHeatmapFromVideos(videos: VideoAnalysisData[]) {
  const heatmap: { [key: string]: number } = {};

  // 初期化
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmap[`${day}-${hour}`] = 0;
    }
  }

  // データを集計
  videos.forEach((video) => {
    const date = new Date(video.publishedAt);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const key = `${dayOfWeek}-${hour}`;

    heatmap[key] += video.viewCount;
  });

  // 正規化（0-100のスコアに変換）
  const maxViews = Math.max(...Object.values(heatmap));
  const normalized = Object.entries(heatmap).map(([key, views]) => {
    const [day, hour] = key.split('-').map(Number);
    return {
      day,
      hour,
      value: maxViews > 0 ? Math.round((views / maxViews) * 100) : 0,
    };
  });

  return normalized;
}

/**
 * チャンネルIDをユーザー名から取得
 */
export async function getChannelIdByUsername(username: string) {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=id&forUsername=${username}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Channel not found');
    }

    return data.items[0].id;
  } catch (error) {
    console.error('Error fetching channel ID:', error);
    throw error;
  }
}
