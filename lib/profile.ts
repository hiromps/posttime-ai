/**
 * ユーザープロフィール管理ヘルパー関数
 */

import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  youtube?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * ユーザープロフィールを取得
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
}

/**
 * ユーザープロフィールを更新
 */
export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}

/**
 * ユーザープロフィールを作成（初回登録時）
 */
export async function createUserProfile(userId: string, email: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      name: email.split('@')[0], // デフォルト名はメールアドレスの@前
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
}

/**
 * アバター画像をアップロード
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // ファイルをアップロード
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw uploadError;
  }

  // 公開URLを取得
  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * 古いアバター画像を削除
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  if (!avatarUrl) return;

  // URLからファイルパスを抽出
  const urlParts = avatarUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `avatars/${fileName}`;

  const { error } = await supabase.storage.from('avatars').remove([filePath]);

  if (error) {
    console.error('Error deleting avatar:', error);
    // エラーが発生してもスローしない（画像が既に削除されている可能性があるため）
  }
}

/**
 * パスワードを変更
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

/**
 * メールアドレスを変更
 */
export async function updateEmail(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    console.error('Error updating email:', error);
    throw error;
  }
}
