'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TrendingUp, Mail, Lock } from 'lucide-react';
import { signIn, signInWithGoogle } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInWithGoogle();
      // OAuth認証の場合、リダイレクトが自動的に処理される
    } catch (err) {
      console.error('Google login error:', err);
      setError('Googleログインに失敗しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');

      if (isSignUp) {
        // 新規登録
        const { signUp } = await import('@/lib/auth');
        await signUp(email, password);
        alert('確認メールを送信しました。メールを確認して登録を完了してください。');
        setIsSignUp(false);
      } else {
        // ログイン
        await signIn(email, password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.message || '認証に失敗しました。';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 左側: ブランディングセクション */}
      <div className="lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 p-8 lg:p-12 flex flex-col justify-center text-white">
        <Link href="/" className="mb-8">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-10 h-10" />
            <span className="text-3xl font-bold">PostTime-AI</span>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            SNS投稿の最適時間を
            <br />
            AIが分析
          </h1>
          <p className="text-xl text-purple-100">
            エンゲージメントを最大化し、
            <br />
            あなたのコンテンツを最適なタイミングで届けます
          </p>

          <div className="space-y-4 pt-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI分析</h3>
                <p className="text-purple-100 text-sm">過去のデータから最適な投稿時間を特定</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">複数SNS対応</h3>
                <p className="text-purple-100 text-sm">YouTube、Instagram、Twitter、TikTokを一元管理</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">簡単連携</h3>
                <p className="text-purple-100 text-sm">ワンクリックでSNSアカウントと連携</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 右側: ログインフォーム */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{isSignUp ? '新規登録' : 'ログイン'}</h2>
              <p className="text-gray-600">{isSignUp ? 'アカウントを作成' : 'アカウントにアクセス'}</p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Google ログインボタン */}
            <Button
              variant="outline"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mb-4 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Googleでログイン</span>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* メールログインフォーム */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">ログイン状態を保持</span>
                </label>
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                  パスワードを忘れた？
                </a>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
              >
                {isLoading
                  ? (isSignUp ? '登録中...' : 'ログイン中...')
                  : (isSignUp ? 'アカウント作成' : 'ログイン')
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isSignUp ? (
                  <>
                    すでにアカウントをお持ちの方は{' '}
                    <button
                      onClick={() => setIsSignUp(false)}
                      className="text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      ログイン
                    </button>
                  </>
                ) : (
                  <>
                    アカウントをお持ちでない方は{' '}
                    <button
                      onClick={() => setIsSignUp(true)}
                      className="text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      新規登録
                    </button>
                  </>
                )}
              </p>
            </div>
          </Card>

          <p className="text-center text-gray-500 text-sm mt-8">
            ログインすることで、
            <a href="#" className="text-purple-600 hover:text-purple-700">利用規約</a>
            および
            <a href="#" className="text-purple-600 hover:text-purple-700">プライバシーポリシー</a>
            に同意したものとみなされます。
          </p>
        </motion.div>
      </div>
    </div>
  );
}
