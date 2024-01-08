import { useState, useEffect } from 'react';
import { theme as antdTheme } from 'antd';
const { darkAlgorithm, defaultAlgorithm } = antdTheme;

type ThemeType = 'light' | 'dark' | 'system';

const useTheme = (dark_mode: ThemeType) => {
  const [themeType, setThemeType] = useState<ThemeType>('system');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setThemeType(mediaQuery.matches ? 'dark' : 'light');
    const listener = (event: MediaQueryListEvent) => {
      setThemeType(event.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  const algorithmTheme =
    dark_mode === 'system'
      ? themeType === 'dark'
        ? darkAlgorithm
        : defaultAlgorithm
      : dark_mode === 'dark'
      ? darkAlgorithm
      : defaultAlgorithm;

  const className =
    dark_mode === 'system'
      ? themeType === 'dark'
        ? 'dark bg-neutral-900'
        : 'bg-white'
      : dark_mode === 'dark'
      ? 'dark bg-neutral-900'
      : 'bg-white';

  return { algorithmTheme, className };
};

export default useTheme;
