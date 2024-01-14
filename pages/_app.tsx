import Navbar from '@modules/navbar';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Footer from '@modules/footer';
import React from 'react';
import useTheme from '@hooks/useTheme';
import { useUserInfo } from '@services/.auth/me';
import { PropsContext } from '@hooks/useProps';
import { useUserSettings } from '@services/user/get';
import { Inter as FontSans } from 'next/font/google';
import { Toaster } from '@ui/sonner';

import { cn } from '@utils/shadcn';

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

function MyApp({ Component, pageProps }: AppProps) {
  const userSettings = useUserSettings();
  const { data: userInfo } = useUserInfo();
  const theme = useTheme(userSettings.data?.dark_mode || 'system');

  const className = () =>
    cn(
      'bg-background font-sans antialiased flex flex-col min-h-screen justify-between',
      fontSans.variable || '',
    );

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
