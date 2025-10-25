/**
 * Supabase ヘルパー関数
 * データベース操作を簡単にするためのユーティリティ
 */

import { supabase } from './supabase';

/**
 * ユーザー情報を取得
 */
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * ユーザー情報を作成
 */
export async function createUser(user: {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan?: 'free' | 'pro' | 'business';
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(
  userId: string,
  updates: {
    name?: string;
    avatar_url?: string;
    plan?: 'free' | 'pro' | 'business';
  }
) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * YouTubeチャンネルを保存
 */
export async function saveYouTubeChannel(channel: {
  user_id: string;
  channel_id: string;
  channel_name: string;
  channel_icon: string;
  subscriber_count: number;
  total_views: number;
  videos_analyzed: number;
}) {
  const { data, error } = await supabase
    .from('youtube_channels')
    .upsert([channel], { onConflict: 'channel_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ユーザーのYouTubeチャンネル一覧を取得
 */
export async function getUserYouTubeChannels(userId: string) {
  const { data, error } = await supabase
    .from('youtube_channels')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * YouTubeチャンネルを削除
 */
export async function deleteYouTubeChannel(channelId: string) {
  const { error } = await supabase
    .from('youtube_channels')
    .delete()
    .eq('id', channelId);

  if (error) throw error;
}

/**
 * YouTube動画を一括保存
 */
export async function saveYouTubeVideos(videos: Array<{
  channel_id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  engagement_rate: number;
}>) {
  const { data, error } = await supabase
    .from('youtube_videos')
    .upsert(videos, { onConflict: 'video_id' })
    .select();

  if (error) throw error;
  return data;
}

/**
 * チャンネルの動画一覧を取得
 */
export async function getChannelVideos(channelId: string, limit = 50) {
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('channel_id', channelId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * 最適投稿時間を保存
 */
export async function saveOptimalPostTimes(times: Array<{
  channel_id: string;
  day_of_week: number;
  hour: number;
  average_views: number;
  average_engagement: number;
  sample_size: number;
}>) {
  const { data, error } = await supabase
    .from('optimal_post_times')
    .upsert(times, { onConflict: 'channel_id,day_of_week,hour' })
    .select();

  if (error) throw error;
  return data;
}

/**
 * チャンネルの最適投稿時間を取得
 */
export async function getOptimalPostTimes(channelId: string) {
  const { data, error } = await supabase
    .from('optimal_post_times')
    .select('*')
    .eq('channel_id', channelId)
    .order('average_views', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * チャンネルの最適投稿時間TOP3を取得
 */
export async function getTopOptimalPostTimes(channelId: string, limit = 3) {
  const { data, error } = await supabase
    .from('optimal_post_times')
    .select('*')
    .eq('channel_id', channelId)
    .gte('sample_size', 2) // 最低2件のサンプルが必要
    .order('average_views', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * チャンネルの統計情報を取得
 */
export async function getChannelStats(channelId: string) {
  // 動画数
  const { count: videoCount } = await supabase
    .from('youtube_videos')
    .select('*', { count: 'exact', head: true })
    .eq('channel_id', channelId);

  // 総視聴回数
  const { data: videos } = await supabase
    .from('youtube_videos')
    .select('view_count, engagement_rate')
    .eq('channel_id', channelId);

  const totalViews = videos?.reduce((sum, v) => sum + v.view_count, 0) || 0;
  const avgEngagement =
    videos && videos.length > 0
      ? videos.reduce((sum, v) => sum + v.engagement_rate, 0) / videos.length
      : 0;

  return {
    totalVideos: videoCount || 0,
    totalViews,
    averageEngagement: parseFloat(avgEngagement.toFixed(1)),
  };
}

/**
 * ヒートマップデータを取得
 */
export async function getHeatmapData(channelId: string) {
  const { data, error } = await supabase
    .from('optimal_post_times')
    .select('day_of_week, hour, average_views')
    .eq('channel_id', channelId);

  if (error) throw error;

  // 0-100にスケーリング
  const maxViews = Math.max(...(data?.map(d => d.average_views) || [0]));

  return data?.map(d => ({
    day: d.day_of_week,
    hour: d.hour,
    value: maxViews > 0 ? Math.round((d.average_views / maxViews) * 100) : 0,
  })) || [];
}
