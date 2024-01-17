import { createContext, useContext } from 'react';

import { UseUserSettings } from '@services/user/get';

interface Props {
  userInfo: UserInfo | undefined;
  userSettings: UseUserSettings | undefined;
  theme: Theme;
}

export const PropsContext = createContext<Props>({
  userInfo: undefined,
  userSettings: undefined,
  theme: {
    themeType: 'system',
    setThemeType: () => {},
    theme: 'dark',
  },
});

export const useProps = () => {
  return useContext(PropsContext);
};
