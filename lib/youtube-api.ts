/**
 * YouTube Data API v3 統合関数
 * チャンネル情報と動画データを取得して表示
 */

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * チャンネルIDを様々な入力形式から取得
 * @param input - チャンネルID、@ハンドル、URL、チャンネル名
 */
export async function resolveChannelId(input: string): Promise<string> {
  // 入力をトリミング
  const trimmed = input.trim();

  // すでにチャンネルIDの場合（UCから始まる）
  if (trimmed.startsWith('UC') && trimmed.length === 24) {
    return trimmed;
  }

  // URLからチャンネルIDを抽出
  if (trimmed.includes('youtube.com')) {
    // チャンネルIDを含むURL
    const channelMatch = trimmed.match(/channel\/(UC[\w-]{22})/);
    if (channelMatch) {
      return channelMatch[1];
    }

    // @ハンドルを含むURL
    const handleMatch = trimmed.match(/youtube\.com\/@([\w-]+)/);
    if (handleMatch) {
      return searchChannelByHandle(handleMatch[1]);
    }
  }

  // @ハンドルの場合
  if (trimmed.startsWith('@')) {
    return searchChannelByHandle(trimmed.substring(1));
  }

  // それ以外はチャンネル名として検索
  return searchChannelByName(trimmed);
}

/**
 * ハンドル名でチャンネルを検索
 */
async function searchChannelByHandle(handle: string): Promise<string> {
  const response = await fetch(
    `${API_BASE}/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=5&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`YouTube API Error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('チャンネルが見つかりません');
  }

  // 最初の結果を返す
  return data.items[0].snippet.channelId;
}

/**
 * チャンネル名で検索
 */
async function searchChannelByName(name: string): Promise<string> {
  const response = await fetch(
    `${API_BASE}/search?part=snippet&q=${encodeURIComponent(name)}&type=channel&maxResults=1&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`YouTube API Error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('チャンネルが見つかりません');
  }

  return data.items[0].snippet.channelId;
}

/**
 * チャンネル情報を取得
 */
export async function fetchChannelInfo(channelId: string) {
  const response = await fetch(
    `${API_BASE}/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`YouTube API Error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('チャンネル情報が取得できません');
  }

  const channel = data.items[0];
  return {
    id: channel.id,
    name: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    thumbnail: channel.snippet.thumbnails.high.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
    viewCount: parseInt(channel.statistics.viewCount || '0'),
    videoCount: parseInt(channel.statistics.videoCount || '0'),
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads
  };
}

/**
 * チャンネルの動画リストを取得
 */
export async function fetchChannelVideos(channelId: string, maxResults: number = 20) {
  // まず検索APIで動画IDリストを取得
  const searchResponse = await fetch(
    `${API_BASE}/search?part=id&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${API_KEY}`
  );

  if (!searchResponse.ok) {
    throw new Error(`YouTube API Error: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  // 動画IDのリストを作成
  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  // 動画の詳細情報を取得
  const videosResponse = await fetch(
    `${API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`
  );

  if (!videosResponse.ok) {
    throw new Error(`YouTube API Error: ${videosResponse.status}`);
  }

  const videosData = await videosResponse.json();

  return videosData.items.map((video: any) => ({
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail: video.snippet.thumbnails.high.url,
    publishedAt: video.snippet.publishedAt,
    duration: parseDuration(video.contentDetails.duration),
    viewCount: parseInt(video.statistics.viewCount || '0'),
    likeCount: parseInt(video.statistics.likeCount || '0'),
    commentCount: parseInt(video.statistics.commentCount || '0'),
    tags: video.snippet.tags || []
  }));
}

/**
 * ISO 8601 duration形式をパース
 */
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 統合データ取得関数
 */
export async function fetchYouTubeData(input: string) {
  try {
    // チャンネルIDを解決
    const channelId = await resolveChannelId(input);

    // チャンネル情報と動画を並列取得
    const [channelInfo, videos] = await Promise.all([
      fetchChannelInfo(channelId),
      fetchChannelVideos(channelId, 30)
    ]);

    // 分析データを計算
    const totalViews = videos.reduce((sum: number, v: any) => sum + v.viewCount, 0);
    const totalLikes = videos.reduce((sum: number, v: any) => sum + v.likeCount, 0);
    const totalComments = videos.reduce((sum: number, v: any) => sum + v.commentCount, 0);
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
    const avgEngagement = videos.length > 0
      ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2)
      : '0';

    return {
      success: true,
      channel: channelInfo,
      videos,
      analytics: {
        totalViews,
        totalLikes,
        totalComments,
        avgViews,
        avgEngagement: parseFloat(avgEngagement),
        videoCount: videos.length
      }
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    };
  }
}

/**
 * 最適な投稿時間を分析
 */
export function analyzePostingTimes(videos: any[]) {
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

  // 平均視聴回数でソート
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
    .filter(item => item.count >= 2) // 最低2本の動画がある時間帯のみ
    .sort((a, b) => b.avgViews - a.avgViews);

  return sorted.slice(0, 5); // TOP5を返す
}