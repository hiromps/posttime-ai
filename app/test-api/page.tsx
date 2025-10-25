'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * YouTube API キーのテストページ
 * APIキーが正しく設定されているか確認
 */
export default function TestAPIPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const testAPIKey = async () => {
    setTesting(true);
    setError('');
    setResult(null);

    try {
      // 最小限のAPIリクエスト（チャンネル情報を取得）
      const testChannelId = 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Google Developers チャンネル
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${testChannelId}&key=${API_KEY}`;

      console.log('🔍 テストリクエスト:', {
        url,
        apiKeyPresent: !!API_KEY,
        apiKeyLength: API_KEY?.length,
        origin: window.location.origin
      });

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ APIエラー:', data);

        if (response.status === 403) {
          const errorMsg = data.error?.message || '';
          if (errorMsg.includes('referer')) {
            setError(
              `HTTPリファラー制限エラー:\n\n` +
              `Google Cloud Console で以下のURLを許可してください:\n` +
              `• ${window.location.origin}/*\n` +
              `• ${window.location.origin}`
            );
          } else if (errorMsg.includes('API key not valid')) {
            setError(
              `APIキーが無効です:\n\n` +
              `1. APIキーが正しくコピーされているか確認\n` +
              `2. YouTube Data API v3 が有効か確認\n` +
              `3. .env.local の設定を確認`
            );
          } else {
            setError(`APIエラー (${response.status}): ${errorMsg}`);
          }
        } else {
          setError(`APIエラー (${response.status}): ${data.error?.message || 'Unknown error'}`);
        }
        return;
      }

      console.log('✅ API成功:', data);
      setResult({
        success: true,
        channelName: data.items[0].snippet.title,
        description: data.items[0].snippet.description
      });

    } catch (err) {
      console.error('💥 エラー:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">YouTube API キーテスト</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">環境変数の状態</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-gray-600">NEXT_PUBLIC_YOUTUBE_API_KEY: </span>
              {API_KEY ? (
                <span className="text-green-600">
                  設定済み ({API_KEY.substring(0, 10)}...{API_KEY.substring(API_KEY.length - 4)})
                </span>
              ) : (
                <span className="text-red-600">未設定</span>
              )}
            </div>
            <div>
              <span className="text-gray-600">現在のURL: </span>
              <span className="text-blue-600">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">オリジン: </span>
              <span className="text-blue-600">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">APIキーのテスト</h2>
          <p className="text-gray-600 mb-4">
            Google Developers チャンネルの情報を取得してAPIキーが正しく動作するかテストします。
          </p>
          <Button
            onClick={testAPIKey}
            disabled={testing || !API_KEY}
            className="mb-4"
          >
            {testing ? 'テスト中...' : 'APIをテスト'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-700 mb-2">エラー</h3>
              <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {result && result.success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-700 mb-2">✅ 成功！</h3>
              <p className="text-green-600">APIキーは正常に動作しています。</p>
              <div className="mt-2 text-sm">
                <p><strong>チャンネル名:</strong> {result.channelName}</p>
                <p><strong>説明:</strong> {result.description?.substring(0, 100)}...</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">設定手順</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>.env.local ファイルを作成</li>
            <li>NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key を追加</li>
            <li>開発サーバーを再起動（npm run dev）</li>
            <li>Google Cloud Console でHTTPリファラー制限を設定</li>
            <li>このページでテストを実行</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}