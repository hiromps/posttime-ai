/**
 * YouTube Data API v3 クライアントサイド実装
 * ブラウザから直接APIを呼び出す際のデバッグ機能付き
 */

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const API_BASE = 'https://www.googleapis.com/youtube/v3';

// デバッグモード
const DEBUG = true;

/**
 * APIリクエストのラッパー関数（デバッグ情報付き）
 */
async function apiRequest(endpoint: string, params: Record<string, string>) {
  // APIキーをパラメータに追加
  params.key = API_KEY || '';

  // URLを構築
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  if (DEBUG) {
    console.log('🔍 YouTube API Request:', {
      url: url.toString(),
      endpoint,
      params,
      apiKeyPresent: !!API_KEY,
      origin: window.location.origin,
      referer: document.referrer || window.location.href
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (DEBUG) {
        console.error('❌ YouTube API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          message: data.error?.message,
          details: data.error?.errors
        });
      }

      // エラーメッセージを詳細化
      if (response.status === 403) {
        const errorMessage = data.error?.message || 'Access forbidden';
        if (errorMessage.includes('referer')) {
          throw new Error(
            `APIキーのHTTPリファラー制限エラー: ${errorMessage}\n` +
            `現在のオリジン: ${window.location.origin}\n` +
            `Google Cloud ConsoleでこのURLを許可してください。`
          );
        }
        throw new Error(`API アクセス拒否 (403): ${errorMessage}`);
      }

      throw new Error(`YouTube API Error: ${response.status} - ${data.error?.message || response.statusText}`);
    }

    if (DEBUG) {
      console.log('✅ YouTube API Success:', {
        endpoint,
        itemCount: data.items?.length || 0,
        pageInfo: data.pageInfo
      });
    }

    return data;
  } catch (error) {
    if (DEBUG) {
      console.error('🚨 API Request Failed:', error);
    }
    throw error;
  }
}

/**
 * チャンネルIDを検索
 */
export async function searchChannel(query: string): Promise<string> {
  const trimmed = query.trim();

  // すでにチャンネルIDの場合
  if (trimmed.startsWith('UC') && trimmed.length === 24) {
    return trimmed;
  }

  // URLからチャンネルIDを抽出
  if (trimmed.includes('youtube.com')) {
    const channelMatch = trimmed.match(/channel\/(UC[\w-]{22})/);
    if (channelMatch) {
      return channelMatch[1];
    }
  }

  // @ハンドルまたはチャンネル名で検索
  const searchQuery = trimmed.startsWith('@') ? trimmed.substring(1) : trimmed;

  const data = await apiRequest('search', {
    part: 'snippet',
    q: searchQuery,
    type: 'channel',
    maxResults: '1'
  });

  if (!data.items || data.items.length === 0) {
    throw new Error('チャンネルが見つかりません');
  }

  return data.items[0].snippet.channelId;
}

/**
 * チャンネル情報を取得
 */
export async function getChannelInfo(channelId: string) {
  const data = await apiRequest('channels', {
    part: 'snippet,statistics,contentDetails',
    id: channelId
  });

  if (!data.items || data.items.length === 0) {
    throw new Error('チャンネル情報が取得できません');
  }

  const channel = data.items[0];
  return {
    id: channel.id,
    name: channel.snippet.title,
    description: channel.snippet.description,
    thumbnail: channel.snippet.thumbnails.high.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
    viewCount: parseInt(channel.statistics.viewCount || '0'),
    videoCount: parseInt(channel.statistics.videoCount || '0')
  };
}

/**
 * チャンネルの動画を取得
 */
export async function getChannelVideos(channelId: string, maxResults: number = 20) {
  // 動画IDリストを取得
  const searchData = await apiRequest('search', {
    part: 'id',
    channelId: channelId,
    order: 'date',
    type: 'video',
    maxResults: maxResults.toString()
  });

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  // 動画IDのリストを作成
  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  // 動画の詳細情報を取得
  const videosData = await apiRequest('videos', {
    part: 'snippet,statistics,contentDetails',
    id: videoIds
  });

  return videosData.items.map((video: any) => ({
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail: video.snippet.thumbnails.high.url,
    publishedAt: video.snippet.publishedAt,
    duration: parseDuration(video.contentDetails.duration),
    viewCount: parseInt(video.statistics.viewCount || '0'),
    likeCount: parseInt(video.statistics.likeCount || '0'),
    commentCount: parseInt(video.statistics.commentCount || '0')
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
export async function fetchYouTubeChannelData(input: string) {
  try {
    console.log('🎬 YouTube Data Fetch Start:', input);

    // チャンネルIDを解決
    const channelId = await searchChannel(input);
    console.log('📺 Channel ID:', channelId);

    // チャンネル情報と動画を取得
    const [channelInfo, videos] = await Promise.all([
      getChannelInfo(channelId),
      getChannelVideos(channelId, 30)
    ]);

    // 分析データを計算
    const totalViews = videos.reduce((sum: number, v: any) => sum + v.viewCount, 0);
    const totalLikes = videos.reduce((sum: number, v: any) => sum + v.likeCount, 0);
    const totalComments = videos.reduce((sum: number, v: any) => sum + v.commentCount, 0);
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
    const avgEngagement = videos.length > 0
      ? parseFloat(((totalLikes + totalComments) / totalViews * 100).toFixed(2))
      : 0;

    console.log('✨ Data Fetch Success:', {
      channel: channelInfo.name,
      videoCount: videos.length,
      totalViews
    });

    return {
      success: true,
      channel: channelInfo,
      videos,
      analytics: {
        totalViews,
        totalLikes,
        totalComments,
        avgViews,
        avgEngagement,
        videoCount: videos.length
      }
    };
  } catch (error) {
    console.error('💥 YouTube Data Fetch Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    };
  }
}