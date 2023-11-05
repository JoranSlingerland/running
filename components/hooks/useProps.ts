import { useContext, createContext } from 'react';
import { UseUserSettings } from '../services/user/get';

interface Props {
  userInfo: UserInfo | undefined;
  userSettings: UseUserSettings | undefined;
}

export const PropsContext = createContext<Props>({
  userInfo: undefined,
  userSettings: undefined,
});

export const useProps = () => {
  return useContext(PropsContext);
};
