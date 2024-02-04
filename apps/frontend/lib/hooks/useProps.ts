import { createContext, useContext } from 'react';

import { UseFetchResult } from '@hooks/useFetch';

interface Props {
  userSettings: UseFetchResult<UserSettings, undefined> | undefined;
}

export const PropsContext = createContext<Props>({
  userSettings: undefined,
});

export const useProps = () => {
  return useContext(PropsContext);
};
