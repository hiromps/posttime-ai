'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';
import { YouTubeConnect } from '@/components/youtube-connect';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Menu, LogOut, Youtube, BarChart3, TrendingUp } from 'lucide-react';

/**
 * YouTube Data API v3 連携ページ
 * チャンネルデータの取得と分析表示
 */
export default function YouTubeDataPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* サイドバー */}
        <Sidebar isMobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* メインコンテンツ */}
        <div className="flex-1">
          {/* ヘッダー */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Youtube className="w-6 h-6 text-red-500" />
                    <h1 className="text-2xl font-bold">YouTube データ分析</h1>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{user?.email}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    ログアウト
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span>リアルタイムデータ</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>AI分析対応</span>
                </div>
              </div>
            </div>
          </header>

          {/* メインコンテンツ */}
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* 説明カード */}
              <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-lg font-bold mb-2">YouTube Data API v3 連携</h2>
                <p className="text-gray-700 mb-3">
                  YouTubeチャンネルのデータをリアルタイムで取得・分析します。
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✅ チャンネル統計情報の表示</li>
                  <li>✅ 動画パフォーマンスの分析</li>
                  <li>✅ エンゲージメント率の追跡</li>
                  <li>✅ 最適な投稿時間の提案</li>
                  <li>✅ 視聴者エンゲージメントの可視化</li>
                </ul>
              </Card>

              {/* YouTube接続コンポーネント */}
              <YouTubeConnect />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}