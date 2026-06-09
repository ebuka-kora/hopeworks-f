import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { PulseBeatLoader } from '../components/PulseBeatLoader';

interface LoadingOverlayContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextType | null>(null);

export function useLoadingOverlay() {
  return useContext(LoadingOverlayContext);
}

export function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Processing...');
  const countRef = useRef(0);

  const showLoading = useCallback((msg = 'Processing...') => {
    countRef.current += 1;
    setMessage(msg);
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) {
      setVisible(false);
    }
  }, []);

  return (
    <LoadingOverlayContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && <PulseBeatLoader message={message} />}
    </LoadingOverlayContext.Provider>
  );
}
