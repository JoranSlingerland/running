import '../styles/globals.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, useTheme } from 'next-themes';
import React, { useEffect } from 'react';

import { PropsContext } from '@hooks/useProps';
import Footer from '@modules/footer';
import Navbar from '@modules/navbar';
import { useUserSettings } from '@services/user/get';
import { Toaster } from '@ui/sonner';

interface PageProps {
  title: string;
  content: string;
}

interface SessionAppProps extends AppProps {
  session: Session;
  pageProps: PageProps;
}

function MyApp({ Component, pageProps, session }: SessionAppProps) {
  const { setTheme } = useTheme();
  const userSettings = useUserSettings();

  useEffect(() => {
    if (userSettings?.data?.preferences?.dark_mode) {
      setTheme(userSettings.data.preferences.dark_mode);
    }
  }, [
    userSettings.isLoading,
    userSettings?.data?.preferences?.dark_mode,
    setTheme,
  ]);

  return (
    <>
      <Head>
        <title>Running</title>
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider defaultTheme="system" attribute="class">
          <div className="flex min-h-screen flex-col justify-between font-sans antialiased">
            <PropsContext.Provider
              value={{
                userSettings,
              }}
            >
              <Toaster />

              <Navbar />
              <div className="px-1 sm:px-2">
                <Component {...pageProps} />
              </div>
              <Footer />
            </PropsContext.Provider>
          </div>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
