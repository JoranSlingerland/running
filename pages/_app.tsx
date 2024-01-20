import '../styles/globals.css';

import { Inter as FontSans } from 'next/font/google';
import React, { useEffect } from 'react';

import { PropsContext } from '@hooks/useProps';
import Footer from '@modules/footer';
import Navbar from '@modules/navbar';
import FullScreenLoader from '@modules/loading';
import { useUserInfo } from '@services/.auth/me';
import { useUserSettings } from '@services/user/get';
import { Toaster } from '@ui/sonner';
import { cn } from '@utils/shadcn';
import { ThemeProvider, useTheme } from 'next-themes';

import type { AppProps } from 'next/app';
export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

interface AppContentProps {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <AppContent Component={Component} pageProps={pageProps} />
    </ThemeProvider>
  );
}

function AppContent({ Component, pageProps }: AppContentProps) {
  const { setTheme } = useTheme();
  const userSettings = useUserSettings();
  const userInfo = useUserInfo();

  const className = () =>
    cn(
      'bg-background font-sans antialiased flex flex-col min-h-screen justify-between',
      fontSans.variable || '',
    );

  useEffect(() => {
    if (userSettings?.data?.dark_mode) {
      setTheme(userSettings.data.dark_mode);
    }
  }, [userSettings?.data?.dark_mode, setTheme]);

  return (
    <div className={className()}>
      <PropsContext.Provider
        value={{
          userInfo,
          userSettings,
        }}
      >
        {/* Utilities */}
        <Toaster />
        <FullScreenLoader
          active={userInfo.isLoading || userSettings.isLoading}
        />

        {/* Main content */}
        <Navbar />
        <div className="px-2">
          <Component {...pageProps} />
        </div>
        <Footer />
      </PropsContext.Provider>
    </div>
  );
}

export default MyApp;
