'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDictionary, type DictionaryItem } from '../lib/api';

export function useDictionary() {
  return useQuery<{ items: DictionaryItem[] }, Error>({
    queryKey: ['dictionary'],
    queryFn: fetchDictionary,
  });
}
