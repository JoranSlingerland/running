import { createContext, useContext } from 'react';

import { UseFetchResult } from '@hooks/useFetch';

interface Props {
  userInfo: UseFetchResult<UserInfo, undefined> | undefined;
  userSettings: UseFetchResult<UserSettings, undefined> | undefined;
}

export const PropsContext = createContext<Props>({
  userInfo: undefined,
  userSettings: undefined,
});

export const useProps = () => {
  return useContext(PropsContext);
};
