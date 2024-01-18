import { useEffect, useState } from 'react';

const useTheme = (initialTheme: ThemeType): Theme => {
  const [themeType, setThemeType] = useState<ThemeType>(initialTheme);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    const documentClassList = document.documentElement.classList;

    const updateTheme = () => {
      const systemPrefersDark = mediaQueryList.matches;
      const className =
        themeType === 'dark' || (themeType === 'system' && systemPrefersDark)
          ? 'dark'
          : '';
      documentClassList.remove('dark');
      if (className) documentClassList.add(className);
      if (className) setTheme('dark');
      else setTheme('light');
    };

    mediaQueryList.addEventListener('change', updateTheme);
    updateTheme();

    return () => {
      mediaQueryList.removeEventListener('change', updateTheme);
    };
  }, [themeType]);

  return { themeType, setThemeType, theme };
};

export default useTheme;
