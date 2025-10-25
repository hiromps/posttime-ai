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
 * チャンネルIDをハンドル名(@username)から取得
 */
export async function getChannelIdByHandle(handle: string) {
  try {
    // @を除去
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;

    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=id&forHandle=${cleanHandle}&key=${YOUTUBE_API_KEY}`
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
    console.error('Error fetching channel ID by handle:', error);
    throw error;
  }
}

/**
 * チャンネルIDをユーザー名から取得（レガシー形式）
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

/**
 * 様々な形式のチャンネル識別子からチャンネルIDを取得
 * @param input - チャンネルID、@ハンドル、URL、カスタムURLなど
 */
export async function resolveChannelId(input: string): Promise<string> {
  try {
    // URLから抽出
    let identifier = input.trim();

    // YouTube URLの場合、識別子を抽出
    if (identifier.includes('youtube.com/')) {
      const urlMatch = identifier.match(/youtube\.com\/@([^/?]+)/);
      if (urlMatch) {
        identifier = '@' + urlMatch[1];
      } else {
        const channelMatch = identifier.match(/youtube\.com\/channel\/([^/?]+)/);
        if (channelMatch) {
          // すでにチャンネルIDの形式
          return channelMatch[1];
        }
        const customMatch = identifier.match(/youtube\.com\/c\/([^/?]+)/);
        if (customMatch) {
          identifier = customMatch[1];
        }
      }
    }

    // @ハンドル形式の場合
    if (identifier.startsWith('@')) {
      return await getChannelIdByHandle(identifier);
    }

    // UCで始まる場合、すでにチャンネルID
    if (identifier.startsWith('UC')) {
      return identifier;
    }

    // カスタムURLの場合
    try {
      return await getChannelIdByUsername(identifier);
    } catch {
      // ユーザー名でも見つからない場合はハンドルとして試行
      return await getChannelIdByHandle(identifier);
    }
  } catch (error) {
    console.error('Error resolving channel ID:', error);
    throw new Error('チャンネルが見つかりませんでした。正しいチャンネルID、@ハンドル、またはURLを入力してください。');
  }
}

/**
 * トレンドのShorts BGMを取得
 * 人気のShorts動画（日本のトレンド）から音楽情報を抽出
 */
export async function getTrendingShortsMusic(maxResults: number = 20) {
  try {
    // 日本のトレンド動画（Shorts）を取得
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=JP&videoCategoryId=10&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items) {
      return [];
    }

    // Shorts動画のみをフィルタリング（60秒以下）
    const shortsVideos = data.items.filter((video: {contentDetails?: {duration: string}}) => {
      if (!video.contentDetails?.duration) return false;

      // ISO 8601 duration形式をパース (例: PT59S = 59秒)
      const duration = video.contentDetails.duration;
      const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return false;

      const minutes = parseInt(match[1] || '0');
      const seconds = parseInt(match[2] || '0');
      const totalSeconds = minutes * 60 + seconds;

      return totalSeconds <= 60; // 60秒以下
    });

    // 音楽情報を抽出（タイトルや説明から）
    const musicData = shortsVideos.map((video: {
      id: string;
      snippet: {
        title: string;
        description: string;
        thumbnails: {high: {url: string}};
        channelTitle: string;
      };
      statistics: {
        viewCount: string;
        likeCount?: string;
      };
    }) => {
      // タイトルから音楽名を推測（"【音楽名】"や"♪音楽名"などのパターン）
      const musicMatch = video.snippet.title.match(/[【「](.+?)[】」]|♪(.+?)[\s-]|Music:\s*(.+?)[\s-]|BGM:\s*(.+?)[\s-]/i);
      const musicName = musicMatch ? (musicMatch[1] || musicMatch[2] || musicMatch[3] || musicMatch[4]) : video.snippet.title;

      // 説明文から音楽情報を抽出
      const descriptionMusicMatch = video.snippet.description.match(/Music:\s*(.+?)(\n|$)|BGM:\s*(.+?)(\n|$)|曲名:\s*(.+?)(\n|$)/i);
      const descriptionMusic = descriptionMusicMatch ? (descriptionMusicMatch[1] || descriptionMusicMatch[3] || descriptionMusicMatch[5]) : null;

      return {
        videoId: video.id,
        musicName: descriptionMusic || musicName.substring(0, 50), // 最大50文字
        videoTitle: video.snippet.title,
        thumbnail: video.snippet.thumbnails.high.url,
        channelName: video.snippet.channelTitle,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        popularity: parseInt(video.statistics.viewCount || '0') + parseInt(video.statistics.likeCount || '0') * 10
      };
    });

    // 人気度でソート
    const sortedMusic = musicData.sort((a: {popularity: number}, b: {popularity: number}) => b.popularity - a.popularity);

    // 重複する音楽名を除外（簡易的に最初の15文字で判定）
    const uniqueMusic: typeof musicData = [];
    const seenMusic = new Set<string>();

    for (const music of sortedMusic) {
      const musicKey = music.musicName.substring(0, 15).toLowerCase();
      if (!seenMusic.has(musicKey)) {
        seenMusic.add(musicKey);
        uniqueMusic.push(music);
      }
    }

    return uniqueMusic.slice(0, 10); // TOP10を返す
  } catch (error) {
    console.error('Error fetching trending shorts music:', error);
    throw error;
  }
}

/**
 * 人気のMusic動画（日本のトレンド）を取得
 */
export async function getTrendingMusicVideos(maxResults: number = 20) {
  try {
    // 日本のトレンド動画（音楽カテゴリー）を取得
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&regionCode=JP&videoCategoryId=10&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items) {
      return [];
    }

    return data.items.map((video: {
      id: string;
      snippet: {
        title: string;
        thumbnails: {high: {url: string}};
        channelTitle: string;
      };
      statistics: {
        viewCount: string;
        likeCount?: string;
      };
    }, index: number) => ({
      rank: index + 1,
      videoId: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      channelName: video.snippet.channelTitle,
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0')
    }));
  } catch (error) {
    console.error('Error fetching trending music videos:', error);
    throw error;
  }
}
