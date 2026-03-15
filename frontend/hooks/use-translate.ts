'use client';

import { useMutation } from '@tanstack/react-query';
import { translateSpeechOnce, translateText, type TranslateResponse } from '../lib/api';

export function useTranslateText() {
  return useMutation<TranslateResponse, Error, { text: string }>({
    mutationFn: ({ text }: { text: string }) => translateText({ text }),
  });
}

export function useTranslateSpeech() {
  return useMutation<TranslateResponse, Error, { file: File }>({
    mutationFn: ({ file }: { file: File }) => translateSpeechOnce(file),
  });
}
