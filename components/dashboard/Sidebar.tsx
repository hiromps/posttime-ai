'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  LayoutDashboard,
  Youtube,
  Instagram,
  Twitter,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'ダッシュボード',
      href: '/dashboard',
      active: true
    },
    {
      icon: Youtube,
      label: 'YouTube',
      href: '/dashboard/youtube',
      active: true
    },
    {
      icon: Instagram,
      label: 'Instagram',
      href: '/dashboard/instagram',
      comingSoon: true
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: '/dashboard/twitter',
      comingSoon: true
    },
    {
      icon: () => (
        <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
          TT
        </div>
      ),
      label: 'TikTok',
      href: '/dashboard/tiktok',
      comingSoon: true
    },
  ];

  const bottomItems = [
    { icon: Settings, label: '設定', href: '/dashboard/settings' },
    { icon: User, label: 'プロフィール', href: '/dashboard/profile' },
  ];

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* ロゴ */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold gradient-text">PostTime-AI</span>
            </Link>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.comingSoon ? '#' : item.href}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-lg transition-all
                        ${isActive && item.active
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                          : item.comingSoon
                          ? 'text-gray-400 cursor-not-allowed opacity-60'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={(e) => {
                        if (item.comingSoon) e.preventDefault();
                        if (isMobileOpen && onClose) onClose();
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.comingSoon && (
                        <Badge variant="gray" size="sm">近日公開</Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <ul className="space-y-2">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                          ${isActive
                            ? 'bg-gray-100 text-purple-600'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                        onClick={() => {
                          if (isMobileOpen && onClose) onClose();
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* ログアウトボタン */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">ログアウト</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
