import '../styles/globals.css';

import { Inter as FontSans } from 'next/font/google';
import React, { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

import { PropsContext } from '@hooks/useProps';
import Footer from '@modules/footer';
import Navbar from '@modules/navbar';
import FullScreenLoader from '@modules/loading';
import { useUserSettings } from '@services/user/get';
import { Toaster } from '@ui/sonner';
import { cn } from '@utils/shadcn';
import { ThemeProvider, useTheme } from 'next-themes';

import type { AppProps } from 'next/app';
export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

interface PageProps {
  title: string;
  content: string;
}

interface AppContentProps {
  Component: AppProps['Component'];
  pageProps: PageProps;
}

interface SessionAppProps extends AppProps {
  session: Session;
  pageProps: PageProps;
}

function MyApp({ Component, pageProps, session }: SessionAppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider defaultTheme="system" attribute="class">
        <AppContent Component={Component} pageProps={pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}

function AppContent({ Component, pageProps }: AppContentProps) {
  const { setTheme } = useTheme();
  const userSettings = useUserSettings();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!userSettings.isLoading) {
      setHasLoadedOnce(true);
    }

    if (userSettings?.data?.preferences?.dark_mode) {
      setTheme(userSettings.data.preferences.dark_mode);
    }
  }, [
    userSettings.isLoading,
    userSettings?.data?.preferences?.dark_mode,
    setTheme,
  ]);

  // Main content
  return (
    <div
      className={cn(
        'font-sans antialiased flex flex-col min-h-screen justify-between',
        fontSans.variable || '',
      )}
    >
      <PropsContext.Provider
        value={{
          userSettings,
        }}
      >
        <Toaster />

        <Navbar />
        <div className="px-2">
          <Component {...pageProps} />
        </div>
        <Footer />

        <FullScreenLoader active={userSettings.isLoading && !hasLoadedOnce} />
      </PropsContext.Provider>
    </div>
  );
}

export default MyApp;
