/**
 * Supabase クライアント設定
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * データベーステーブルの型定義
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          plan: 'free' | 'pro' | 'business';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'business';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'business';
          updated_at?: string;
        };
      };
      youtube_channels: {
        Row: {
          id: string;
          user_id: string;
          channel_id: string;
          channel_name: string;
          channel_icon: string;
          subscriber_count: number;
          total_views: number;
          videos_analyzed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel_id: string;
          channel_name: string;
          channel_icon: string;
          subscriber_count: number;
          total_views: number;
          videos_analyzed: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          channel_name?: string;
          channel_icon?: string;
          subscriber_count?: number;
          total_views?: number;
          videos_analyzed?: number;
          updated_at?: string;
        };
      };
      youtube_videos: {
        Row: {
          id: string;
          channel_id: string;
          video_id: string;
          title: string;
          thumbnail: string;
          published_at: string;
          view_count: number;
          like_count: number;
          comment_count: number;
          engagement_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          video_id: string;
          title: string;
          thumbnail: string;
          published_at: string;
          view_count: number;
          like_count: number;
          comment_count: number;
          engagement_rate: number;
          created_at?: string;
        };
      };
      optimal_post_times: {
        Row: {
          id: string;
          channel_id: string;
          day_of_week: number;
          hour: number;
          average_views: number;
          average_engagement: number;
          sample_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          day_of_week: number;
          hour: number;
          average_views: number;
          average_engagement: number;
          sample_size: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          average_views?: number;
          average_engagement?: number;
          sample_size?: number;
          updated_at?: string;
        };
      };
    };
  };
}
