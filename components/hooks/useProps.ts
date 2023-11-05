import { useContext, createContext } from 'react';

interface Props {
  userInfo: UserInfo | undefined;
}

export const PropsContext = createContext<Props>({
  userInfo: undefined,
});

export const useProps = () => {
  return useContext(PropsContext);
};
