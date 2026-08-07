'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  translateTextOffline,
  isOfflineSTTReady,
  downloadSTTModel,
  type OfflineTranslateResult,
  type ModelDownloadProgress,
} from '../lib/offline-translate';

export interface UseOfflineTranslate {
  /** Whether offline STT model is downloaded and ready */
  isModelReady: boolean;
  /** Whether model is currently being downloaded */
  isDownloading: boolean;
  /** Download progress (0-100) */
  downloadProgress: number;
  /** Download the offline STT model */
  downloadModel: () => Promise<void>;
  /** Translate text offline (no server) */
  translateText: (text: string) => OfflineTranslateResult;
  /** Last translation result */
  result: OfflineTranslateResult | null;
  /** Error message */
  error: string | null;
}

export function useOfflineTranslate(): UseOfflineTranslate {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [result, setResult] = useState<OfflineTranslateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checkedRef = useRef(false);

  // Check if model is cached on mount
  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      isOfflineSTTReady().then(setIsModelReady).catch(() => {});
    }
  }, []);

  const downloadModelFn = useCallback(async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);
    try {
      await downloadSTTModel((progress: ModelDownloadProgress) => {
        setDownloadProgress(progress.percent);
      });
      setIsModelReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const translateTextFn = useCallback((text: string) => {
    try {
      setError(null);
      const res = translateTextOffline(text);
      setResult(res);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Translation failed';
      setError(msg);
      return { tokens: [], gestures: [], gloss: '' };
    }
  }, []);

  return {
    isModelReady,
    isDownloading,
    downloadProgress,
    downloadModel: downloadModelFn,
    translateText: translateTextFn,
    result,
    error,
  };
}
