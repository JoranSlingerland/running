import Navbar from '../components/modules/navbar';
import '../styles/globals.css';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import Footer from '../components/modules/footer';
import React from 'react';
import useTheme from '../components/hooks/useTheme';
import { useUserInfo } from '../components/services/.auth/me';
import { PropsContext } from '../components/hooks/useProps';

function MyApp({ Component, pageProps }: AppProps) {
  const { data: userInfo } = useUserInfo();
  const { algorithmTheme, className } = useTheme('system');

  return (
    <PropsContext.Provider
      value={{
        userInfo,
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: algorithmTheme,

          components: {
            List: {
              paddingContentHorizontalLG: 0,
            },
            Form: {
              marginLG: 8,
            },
          },
        }}
      >
        <div className={`min-h-screen flex flex-col ${className}`}>
          <Navbar />
          <div className="flex justify-center px-2 xl:px-0">
            <div className="w-full max-w-7xl">
              <Component {...pageProps} />
            </div>
          </div>
          <Footer />
        </div>
      </ConfigProvider>
    </PropsContext.Provider>
  );
}

export default MyApp;
