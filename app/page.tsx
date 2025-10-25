'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Brain,
  Layout,
  Zap,
  Youtube,
  Instagram,
  Twitter,
  TrendingUp,
  Check
} from 'lucide-react';
import { pricingPlans } from '@/data/dummyData';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold gradient-text">PostTime-AI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">機能</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">料金</a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">会社情報</a>
            </nav>
            <Link href="/login">
              <Button variant="primary" size="sm">ログイン / 登録</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge variant="purple" className="mb-6">AI分析ツール</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              SNS投稿の
              <span className="gradient-text"> 最適時間 </span>
              を<br />
              AIが分析
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              YouTube、Instagram、Twitter、TikTokの投稿最適時間を
              <br className="hidden sm:block" />
              AI分析でエンゲージメントを最大化
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8">
                  無料で始める
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8">
                デモを見る
              </Button>
            </div>

            {/* 対応SNS */}
            <div className="flex justify-center items-center space-x-8 mb-12">
              <div className="text-center">
                <Youtube className="w-12 h-12 mx-auto mb-2 text-red-600" />
                <Badge variant="success" size="sm">対応</Badge>
              </div>
              <div className="text-center opacity-50">
                <Instagram className="w-12 h-12 mx-auto mb-2" />
                <Badge variant="gray" size="sm">近日公開</Badge>
              </div>
              <div className="text-center opacity-50">
                <Twitter className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                <Badge variant="gray" size="sm">近日公開</Badge>
              </div>
              <div className="text-center opacity-50">
                <div className="w-12 h-12 mx-auto mb-2 bg-black rounded-lg flex items-center justify-center text-white font-bold">
                  TT
                </div>
                <Badge variant="gray" size="sm">近日公開</Badge>
              </div>
            </div>

            {/* モックアップ */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-8 rounded-2xl shadow-2xl border-4 border-gray-200">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400 text-lg">ダッシュボードプレビュー</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">なぜPostTime-AIなのか？</h2>
            <p className="text-xl text-gray-600">データドリブンでエンゲージメントを最大化</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">AIによる最適時間分析</h3>
                  <p className="text-gray-600">
                    過去の投稿データから視聴者が最もアクティブな時間帯を特定
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layout className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">複数SNSを一元管理</h3>
                  <p className="text-gray-600">
                    YouTube、Instagram、Twitter、TikTokを一つのダッシュボードで管理
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">ワンクリックで連携</h3>
                  <p className="text-gray-600">
                    Google、Meta、Twitter APIと簡単に連携して即座に分析開始
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">あなたに最適なプランを選ぶ</h2>
            <p className="text-xl text-gray-600">すべてのプランで14日間の無料トライアル</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="purple" className="text-sm px-4 py-2">Most Popular</Badge>
                  </div>
                )}
                <Card
                  hover
                  className={`h-full ${plan.popular ? 'border-2 border-purple-600' : ''}`}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold">¥{plan.price.toLocaleString()}</span>
                      <span className="text-gray-600">/月</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/login">
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      fullWidth
                    >
                      {plan.type === 'free' ? '無料で始める' : `${plan.name}を選ぶ`}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold">PostTime-AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                SNS投稿の最適時間をAIが分析し、エンゲージメントを最大化
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">プロダクト</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-purple-400 transition-colors">機能</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 transition-colors">料金</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">会社情報</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">運営会社</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">ブログ</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">採用情報</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">利用規約</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">プライバシーポリシー</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 PostTime-AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
