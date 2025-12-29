'use client';

import type React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import {
  ConfigProvider,
  Layout,
  Button,
  Dropdown,
  Avatar,
  App,
  Spin,
} from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

const { Header, Content, Footer } = Layout;
const inter = Inter({ subsets: ['latin'] });

function AppHeader() {
  const { user, signOut } = useAuth();

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: signOut,
    },
  ];

  return (
    <Header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/quizzes" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <BookOutlined className="text-white text-lg" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuizMaster
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Create & Share Quizzes
              </p>
            </div>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Create Quiz Button */}
              <Link href="/quizzes/new">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="h-10 px-6 bg-gradient-to-r from-green-500 to-blue-500 border-0 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span className="hidden sm:inline ml-1">Create Quiz</span>
                </Button>
              </Link>

              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenu }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button
                  type="text"
                  className="h-10 px-3 rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2"
                >
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                  <span className="hidden sm:block text-gray-700 font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                </Button>
              </Dropdown>
            </>
          ) : (
            <Link href="/login">
              <Button
                type="primary"
                className="h-10 px-6 bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Header>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const { isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <App>
          <Layout className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <AppHeader />
            <Content className="pt-16">
              <div className="min-h-[calc(100vh-64px)]">{children}</div>
            </Content>
            <Footer className="text-center bg-white/50 backdrop-blur-sm border-t border-gray-200/50 py-6">
              <div className="max-w-7xl mx-auto px-4">
                <p className="text-gray-600">
                  QuizMaster ©{new Date().getFullYear()} - Create, Share, and
                  Learn with Interactive Quizzes
                </p>
              </div>
            </Footer>
          </Layout>
        </App>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
