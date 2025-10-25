'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // ハッシュフラグメントからセッションを取得
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // セッションを設定
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError(sessionError.message);
            setTimeout(() => router.push('/login?error=session_failed'), 2000);
            return;
          }

          // 認証成功後、ダッシュボードにリダイレクト
          router.push('/dashboard');
        } else {
          // コードベースの認証フロー（PKCEフロー）
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');

          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              console.error('Code exchange error:', exchangeError);
              setError(exchangeError.message);
              setTimeout(() => router.push('/login?error=code_exchange_failed'), 2000);
              return;
            }

            router.push('/dashboard');
          } else {
            // トークンもコードもない場合
            console.error('No authentication parameters found');
            setError('認証パラメータが見つかりません');
            setTimeout(() => router.push('/login?error=no_params'), 2000);
          }
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        setError('予期しないエラーが発生しました');
        setTimeout(() => router.push('/login?error=unexpected'), 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="inline-block rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">認証エラー</h2>
            <p className="text-red-600 mt-2">{error}</p>
            <p className="text-gray-500 text-sm mt-2">ログインページにリダイレクトします...</p>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">認証処理中...</h2>
            <p className="text-gray-500 mt-2">しばらくお待ちください</p>
          </>
        )}
      </div>
    </div>
  );
}
