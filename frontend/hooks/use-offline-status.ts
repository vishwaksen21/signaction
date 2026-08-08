'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isFullyOfflineReady } from '../lib/offline-setup';

export interface OfflineStatus {
  /** Whether the app is fully ready for offline use */
  isReady: boolean;
  /** Whether we're still checking */
  isLoading: boolean;
  /** Model is cached */
  modelCached: boolean;
  /** Assets are cached */
  assetsCached: boolean;
  /** Re-check status */
  refresh: () => Promise<void>;
}

export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState({
    isReady: false,
    isLoading: true,
    modelCached: false,
    assetsCached: false,
  });
  const checkedRef = useRef(false);

  const check = useCallback(async () => {
    setStatus((s) => ({ ...s, isLoading: true }));
    try {
      const { ready, model, assets } = await isFullyOfflineReady();
      setStatus({
        isReady: ready,
        isLoading: false,
        modelCached: model,
        assetsCached: assets,
      });
    } catch {
      setStatus((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      check();
    }
  }, [check]);

  return { ...status, refresh: check };
}
