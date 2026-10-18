import { createContext, useContext } from 'react';

export const PreloaderContext = createContext({
  isLoading: false,
  isExiting: false,
  showPreloader: () => {},
  hidePreloader: () => {},
  withPreloader: (promise) => promise,
});

export const usePreloader = () => useContext(PreloaderContext);

export default PreloaderContext;
