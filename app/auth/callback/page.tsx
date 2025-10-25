'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLからコードを取得してセッションを確立
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.search
        );

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=auth_failed');
          return;
        }

        // 認証成功後、ダッシュボードにリダイレクト
        router.push('/dashboard');
      } catch (err) {
        console.error('Unexpected auth error:', err);
        router.push('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">認証処理中...</h2>
        <p className="text-gray-500 mt-2">しばらくお待ちください</p>
      </div>
    </div>
  );
}
