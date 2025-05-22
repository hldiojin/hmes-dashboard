'use client';

import * as React from 'react';
import type { Viewport } from 'next';
import '@/styles/global.css';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { TitleProvider } from '@/contexts/title-context';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  React.useEffect(() => {
    // Đảm bảo URL luôn là root path
    const handleRouteChange = () => {
      // Chỉ thực hiện khi không ở trang chủ và không phải là link external
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('http')) {
        window.history.replaceState({}, '', '/');
      }
    };

    window.addEventListener('popstate', handleRouteChange);

    // Đảm bảo URL đúng khi trang được tải
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }

    // Đặt tiêu đề mặc định cho trang web
    document.title = 'Hmes-dashboard';

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Chèn favicon
  const faviconUrl = '/favicon.ico'; // Đường dẫn đến file favicon

  return (
    <html lang="en">
      <head>
        <title>Hmes-dashboard</title>
        <meta name="description" content="Hmes Dashboard Application" />
        <link rel="icon" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
      </head>
      <body>
        <LocalizationProvider>
          <UserProvider>
            <TitleProvider defaultTitle="Hmes-dashboard">
              <ThemeProvider>{children}</ThemeProvider>
            </TitleProvider>
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
