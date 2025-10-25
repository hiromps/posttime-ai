-- PostTime-AI Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth連携)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube Channels table
CREATE TABLE IF NOT EXISTS youtube_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id TEXT UNIQUE NOT NULL,
  channel_name TEXT NOT NULL,
  channel_icon TEXT,
  subscriber_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  videos_analyzed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube Videos table
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
  video_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimal Post Times table
CREATE TABLE IF NOT EXISTS optimal_post_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),
  average_views INTEGER DEFAULT 0,
  average_engagement DECIMAL(5,2) DEFAULT 0,
  sample_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, day_of_week, hour)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_youtube_channels_user_id ON youtube_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_channel_id ON youtube_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_published_at ON youtube_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_optimal_post_times_channel_id ON optimal_post_times(channel_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimal_post_times ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- YouTube Channels policies
CREATE POLICY "Users can view own channels" ON youtube_channels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own channels" ON youtube_channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels" ON youtube_channels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels" ON youtube_channels
  FOR DELETE USING (auth.uid() = user_id);

-- YouTube Videos policies
CREATE POLICY "Users can view videos of own channels" ON youtube_videos
  FOR SELECT USING (
    channel_id IN (
      SELECT id FROM youtube_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert videos to own channels" ON youtube_videos
  FOR INSERT WITH CHECK (
    channel_id IN (
      SELECT id FROM youtube_channels WHERE user_id = auth.uid()
    )
  );

-- Optimal Post Times policies
CREATE POLICY "Users can view optimal times of own channels" ON optimal_post_times
  FOR SELECT USING (
    channel_id IN (
      SELECT id FROM youtube_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert optimal times to own channels" ON optimal_post_times
  FOR INSERT WITH CHECK (
    channel_id IN (
      SELECT id FROM youtube_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update optimal times of own channels" ON optimal_post_times
  FOR UPDATE USING (
    channel_id IN (
      SELECT id FROM youtube_channels WHERE user_id = auth.uid()
    )
  );

-- Functions

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youtube_channels_updated_at
  BEFORE UPDATE ON youtube_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_optimal_post_times_updated_at
  BEFORE UPDATE ON optimal_post_times
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - for testing)
-- INSERT INTO users (id, email, name, plan) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'demo@posttime-ai.com', 'デモユーザー', 'pro');
