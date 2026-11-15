import { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(() =>
    StorageService.getPendingSyncCount()
  );

  useEffect(() => {
    const refreshPending = () => {
      setPendingCount(StorageService.getPendingSyncCount());
    };

    const handleOnline = () => {
      setIsOnline(true);
      refreshPending();
    };
    const handleOffline = () => {
      setIsOnline(false);
      refreshPending();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('gtepat-offline-queue-updated', refreshPending);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('gtepat-offline-queue-updated', refreshPending);
    };
  }, []);

  return { isOnline, pendingCount };
}
