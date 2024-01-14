import { useState, useEffect } from 'react';

const useTheme = (initialTheme: ThemeType) => {
  const [themeType, setThemeType] = useState<ThemeType>(initialTheme);

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
    };

    mediaQueryList.addEventListener('change', updateTheme);
    updateTheme();

    return () => {
      mediaQueryList.removeEventListener('change', updateTheme);
    };
  }, [themeType]);

  return { themeType, setThemeType };
};

export default useTheme;
