import '../styles/globals.css';

import { Inter as FontSans } from 'next/font/google';
import React from 'react';

import { PropsContext } from '@hooks/useProps';
import useTheme from '@hooks/useTheme';
import Footer from '@modules/footer';
import Navbar from '@modules/navbar';
import FullScreenLoader from '@modules/loading';
import { useUserInfo } from '@services/.auth/me';
import { useUserSettings } from '@services/user/get';
import { Toaster } from '@ui/sonner';
import { cn } from '@utils/shadcn';

import type { AppProps } from 'next/app';
export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

function MyApp({ Component, pageProps }: AppProps) {
  const userSettings = useUserSettings();
  const userInfo = useUserInfo();
  const theme = useTheme(userSettings.data?.dark_mode || 'system');

  const className = () =>
    cn(
      'bg-background font-sans antialiased flex flex-col min-h-screen justify-between',
      fontSans.variable || '',
    );

  if (userInfo.isLoading || userSettings.isLoading || !theme) {
    return (
      <div className={className()}>
        <FullScreenLoader />
      </div>
    );
  }

  return (
    <div className={className()}>
      <PropsContext.Provider
        value={{
          userInfo,
          userSettings,
          theme,
        }}
      >
        <Toaster />
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
