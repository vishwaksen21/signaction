import type { DictionaryItem } from './api';

export const WORST_CASE_ITEMS: DictionaryItem[] = [
  {
    token: 'ALEXANDRA_WISNIEWSKA_KOWALCZYK_ISL_GESTURE',
    url: '/assets/signs/HELLO.mp4',
    media_type: 'mp4',
  },
  {
    token: 'BARTHOLOMEW_FITZGERALD_AT_NORTHWIND_INDUSTRIES_HOLDINGS_ENTERPRISE_TRANSLATION_CORP',
    url: '/assets/signs/THANK_YOU.mp4',
    media_type: 'mp4',
  },
  {
    token: '👩🏽‍💻_PRIYA_DEVELOPER',
    url: '/assets/signs/GOOD_MORNING.mp4',
    media_type: 'mp4',
  },
  {
    token: '🦊_FOX',
    url: '/assets/signs/WELCOME.mp4',
    media_type: 'mp4',
  },
  {
    token: 'J',
    url: '/assets/signs/HELP.mp4',
    media_type: 'mp4',
  },
  {
    token: '',
    url: '/assets/signs/HELLO.mp4',
    media_type: 'mp4',
  },
  {
    token: '<script>alert(1)</script> &amp; <b>TEST</b>',
    url: '/assets/signs/THANK_YOU.mp4',
    media_type: 'mp4',
  },
  {
    token: 'ĐẶNG_THỊ_NGỌC_HÂN',
    url: '/assets/signs/WELCOME.mp4',
    media_type: 'mp4',
  },
  {
    token: '王秀英_WANG_XIUYING',
    url: '/assets/signs/GOOD_MORNING.mp4',
    media_type: 'mp4',
  },
  {
    token: 'نور_الهدى_عبد_الرحمن',
    url: '/assets/signs/HELP.mp4',
    media_type: 'mp4',
  },
  {
    token: '   SPACED   TOKEN   ',
    url: '/assets/signs/HELLO.mp4',
    media_type: 'mp4',
  },
  {
    token: 'BROKEN_MEDIA_404_TEST',
    url: '/assets/signs/non_existent_corrupted_video_file.mp4',
    media_type: 'mp4',
  },
  {
    token: 'LONG_MEDIA_BADGE_OVERFLOW',
    url: '/assets/signs/HELLO.mp4',
    media_type: 'mp4_ultra_hd_av1_high_compression_video' as any,
  },
];

export const SINGLE_ITEM: DictionaryItem[] = [
  {
    token: 'SOLITARY_GESTURE',
    url: '/assets/signs/HELLO.mp4',
    media_type: 'mp4',
  },
];

export const EMPTY_ITEMS: DictionaryItem[] = [];

export const HUGE_ITEMS: DictionaryItem[] = Array.from({ length: 1284 }).map((_, i) => ({
  token: `GESTURE_ITEM_${i + 1}`,
  url: '/assets/signs/HELLO.mp4',
  media_type: 'mp4',
}));
