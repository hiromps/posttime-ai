'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  User,
  Lock,
  Camera,
  Save,
  Globe,
  Twitter as TwitterIcon,
  Youtube,
  FileText
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, updateUserProfile, uploadAvatar, deleteAvatar, updatePassword, UserProfile } from '@/lib/profile';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 認証状態
  const [user, setUser] = useState<{id: string; email?: string} | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // プロフィール情報
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // フォーム状態
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // パスワード変更
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        // プロフィール読み込み
        await loadProfile(currentUser.id);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // プロフィール読み込み
  const loadProfile = async (userId: string) => {
    setLoading(true);
    try {
      const profileData = await getUserProfile(userId);
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || '');
        setBio(profileData.bio || '');
        setWebsite(profileData.website || '');
        setTwitter(profileData.twitter || '');
        setYoutube(profileData.youtube || '');
        setAvatarUrl(profileData.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの読み込みに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // アバター画像選択
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: '画像サイズは5MB以下にしてください' });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // プロフィール保存
  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      let newAvatarUrl = avatarUrl;

      // アバター画像をアップロード
      if (avatarFile) {
        // 古いアバターを削除
        if (avatarUrl) {
          await deleteAvatar(avatarUrl);
        }
        newAvatarUrl = await uploadAvatar(user.id, avatarFile);
        setAvatarUrl(newAvatarUrl);
        setAvatarPreview('');
        setAvatarFile(null);
      }

      // プロフィール更新
      const updatedProfile = await updateUserProfile(user.id, {
        name,
        bio,
        website,
        twitter,
        youtube,
        avatar_url: newAvatarUrl,
      });

      setProfile(updatedProfile);
      setMessage({ type: 'success', text: 'プロフィールを保存しました' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // パスワード変更
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードを入力してください' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードが一致しません' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'パスワードは6文字以上で設定してください' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await updatePassword(newPassword);
      setMessage({ type: 'success', text: 'パスワードを変更しました' });
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'パスワードの変更に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">読み込み中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            ダッシュボードに戻る
          </Link>
          <h1 className="text-4xl font-bold gradient-text">プロフィール設定</h1>
          <p className="text-gray-600 mt-2">アカウント情報とプロフィールを管理</p>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* アバターセクション */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <h2 className="text-xl font-bold mb-4">プロフィール画像</h2>
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                    {avatarPreview || avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={avatarPreview || avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-purple-400" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  クリックして画像を変更
                  <br />
                  (最大5MB)
                </p>
              </div>
            </Card>

            {/* アカウント情報 */}
            <Card className="mt-6">
              <h2 className="text-xl font-bold mb-4">アカウント情報</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">メールアドレス</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">プラン</p>
                  <p className="font-medium">無料プラン</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">登録日</p>
                  <p className="font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* プロフィール編集セクション */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <h2 className="text-xl font-bold mb-6">基本情報</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      名前
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="田中太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      自己紹介
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="あなたについて教えてください..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      ウェブサイト
                    </label>
                    <Input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TwitterIcon className="w-4 h-4 inline mr-2" />
                      Twitter / X
                    </label>
                    <Input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="@your_handle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Youtube className="w-4 h-4 inline mr-2" />
                      YouTube チャンネル
                    </label>
                    <Input
                      type="text"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="@YourChannel"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    fullWidth
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : 'プロフィールを保存'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* パスワード変更セクション */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <h2 className="text-xl font-bold mb-6">
                  <Lock className="w-5 h-5 inline mr-2" />
                  パスワード変更
                </h2>

                {!showPasswordChange ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordChange(true)}
                  >
                    パスワードを変更する
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        新しいパスワード
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        パスワード確認
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleChangePassword}
                        disabled={saving}
                      >
                        {saving ? '変更中...' : 'パスワードを変更'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
