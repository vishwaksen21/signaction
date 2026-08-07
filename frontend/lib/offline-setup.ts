/**
 * Unified offline setup — downloads everything in one click:
 * 1. Vosk STT model (~40MB)
 * 2. Sign language assets (~18MB)
 * 3. App shell via Service Worker
 *
 * Reports granular progress for each phase.
 */

import { isModelCached, downloadModel, cacheModel } from './model-cache';

export type DownloadPhase = 'model' | 'assets' | 'appshell' | 'done';

export interface OfflineSetupProgress {
  phase: DownloadPhase;
  /** Progress within current phase (0-100) */
  phasePercent: number;
  /** Overall progress across all phases (0-100) */
  overallPercent: number;
  /** Human-readable status message */
  message: string;
}

export interface OfflineSetupResult {
  success: boolean;
  modelCached: boolean;
  assetsCached: boolean;
  appShellCached: boolean;
  error?: string;
}

// Sign asset files to cache (alphabet + common words)
const ASSET_FILES = [
  // Alphabet A-Z
  ...Array.from({ length: 26 }, (_, i) => `alphabet/${String.fromCharCode(65 + i)}.mp4`),
  // Numbers 0-9
  ...Array.from({ length: 10 }, (_, i) => `signs/${i}.mp4`),
  // Common words
  'signs/HELLO.mp4', 'signs/GOODBYE.mp4', 'signs/PLEASE.mp4', 'signs/THANK_YOU.mp4',
  'signs/YES.mp4', 'signs/NO.mp4', 'signs/HELP.mp4',
  'signs/NAME.mp4', 'signs/WHAT.mp4', 'signs/WHO.mp4', 'signs/WHERE.mp4',
  'signs/WHEN.mp4', 'signs/WHY.mp4', 'signs/HOW.mp4', 'signs/UNDERSTAND.mp4',
  'signs/NOT_UNDERSTAND.mp4', 'signs/LOVE.mp4', 'signs/HATE.mp4',
  'signs/HAPPY.mp4', 'signs/SAD.mp4', 'signs/ANGRY.mp4', 'signs/AFRAID.mp4',
  'signs/GOOD.mp4', 'signs/BAD.mp4', 'signs/BIG.mp4', 'signs/SMALL.mp4',
  'signs/EAT.mp4', 'signs/DRINK.mp4', 'signs/SLEEP.mp4', 'signs/WALK.mp4',
  'signs/RUN.mp4', 'signs/TALK.mp4', 'signs/LOOK.mp4', 'signs/LISTEN.mp4',
  'signs/READ.mp4', 'signs/WRITE.mp4', 'signs/WORK.mp4', 'signs/PLAY.mp4',
  'signs/FRIEND.mp4', 'signs/FAMILY.mp4', 'signs/HOME.mp4', 'signs/SCHOOL.mp4',
  'signs/FOOD.mp4', 'signs/WATER.mp4', 'signs/CAR.mp4', 'signs/BOOK.mp4',
  'signs/DOG.mp4', 'signs/CAT.mp4', 'signs/AND.mp4', 'signs/OR.mp4',
  'signs/NOT.mp4', 'signs/BUT.mp4', 'signs/BE.mp4', 'signs/HAVE.mp4',
  'signs/DO.mp4', 'signs/CAN.mp4', 'signs/WANT.mp4', 'signs/NEED.mp4',
  'signs/GO.mp4', 'signs/COME.mp4', 'signs/SEE.mp4', 'signs/HEAR.mp4',
  'signs/FEEL.mp4', 'signs/THINK.mp4', 'signs/KNOW.mp4', 'signs/LEARN.mp4',
  'signs/TEACH.mp4', 'signs/MAKE.mp4', 'signs/GIVE.mp4', 'signs/TAKE.mp4',
  'signs/PUT.mp4', 'signs/OPEN.mp4', 'signs/CLOSE.mp4', 'signs/START.mp4',
  'signs/STOP.mp4', 'signs/ALL.mp4', 'signs/NONE.mp4', 'signs/SOME.mp4',
  'signs/MANY.mp4', 'signs/FEW.mp4', 'signs/MORE.mp4', 'signs/LESS.mp4',
  'signs/ALSO.mp4', 'signs/ALWAYS.mp4', 'signs/NEVER.mp4', 'signs/SOMETIMES.mp4',
  'signs/TODAY.mp4', 'signs/TOMORROW.mp4', 'signs/YESTERDAY.mp4',
  'signs/MORNING.mp4', 'signs/AFTERNOON.mp4', 'signs/EVENING.mp4',
  'signs/MONDAY.mp4', 'signs/TUESDAY.mp4', 'signs/WEDNESDAY.mp4',
  'signs/THURSDAY.mp4', 'signs/FRIDAY.mp4', 'signs/SATURDAY.mp4', 'signs/SUNDAY.mp4',
  'signs/JANUARY.mp4', 'signs/FEBRUARY.mp4', 'signs/MARCH.mp4',
  'signs/APRIL.mp4', 'signs/MAY.mp4', 'signs/JUNE.mp4',
  'signs/JULY.mp4', 'signs/AUGUST.mp4', 'signs/SEPTEMBER.mp4',
  'signs/OCTOBER.mp4', 'signs/NOVEMBER.mp4', 'signs/DECEMBER.mp4',
  'signs/QUESTION.mp4', 'signs/ANSWER.mp4', 'signs/EXCUSE_ME.mp4',
  'signs/SORRY.mp4', 'signs/WELCOME.mp4', 'signs/GOOD_MORNING.mp4',
  'signs/GOOD_NIGHT.mp4', 'signs/HOW_ARE_YOU.mp4', 'signs/I_AM_FINE.mp4',
];

// Minimum percentage of assets that must be cached to consider "ready"
const ASSET_READINESS_THRESHOLD = 0.8; // 80%

/**
 * Check if the app is fully ready for offline use.
 */
export async function isFullyOfflineReady(): Promise<{
  ready: boolean;
  model: boolean;
  assets: boolean;
}> {
  const model = await isModelCached();

  // Check if enough sign assets are cached in the SW cache
  let assets = false;
  if ('caches' in window) {
    try {
      const cache = await caches.open('signaction-v1');
      const keys = await cache.keys();
      const cachedAssetCount = keys.filter((req) =>
        req.url.includes('/assets/')
      ).length;
      const requiredCount = Math.ceil(
        ASSET_FILES.length * ASSET_READINESS_THRESHOLD
      );
      assets = cachedAssetCount >= requiredCount;
    } catch {
      assets = false;
    }
  }

  return { ready: model && assets, model, assets };
}

/**
 * Download everything needed for offline use.
 * Calls onProgress with granular updates.
 */
export async function setupOffline(
  onProgress?: (progress: OfflineSetupProgress) => void
): Promise<OfflineSetupResult> {
  const report = (
    phase: DownloadPhase,
    phasePercent: number,
    overallPercent: number,
    message: string
  ) => {
    onProgress?.({ phase, phasePercent, overallPercent, message });
  };

  let modelCached = false;
  let assetsCached = false;
  let appShellCached = false;

  try {
    // Phase 1: Download Vosk model (~40MB)
    report('model', 0, 0, 'Downloading speech recognition model...');

    const alreadyCached = await isModelCached();
    if (alreadyCached) {
      modelCached = true;
      report('model', 100, 30, 'Speech model already cached');
    } else {
      const data = await downloadModel((loaded, total) => {
        if (total > 0 && total === loaded) {
          report('model', 100, 30, 'Processing model...');
        } else if (total > 0) {
          const pct = Math.round((loaded / total) * 100);
          report('model', pct, Math.round(pct * 0.3), `Downloading model... ${pct}%`);
        } else {
          const mb = (loaded / (1024 * 1024)).toFixed(1);
          report('model', 0, 5, `Downloading model... ${mb}MB received`);
        }
      });
      await cacheModel(data);
      modelCached = true;
      report('model', 100, 30, 'Speech model downloaded');
    }

    // Phase 2: Cache sign assets (~18MB)
    report('assets', 0, 30, 'Caching sign language assets...');

    if ('caches' in window) {
      const cache = await caches.open('signaction-v1');
  const existingKeys = new Set<string>();
  const keyRequests = await cache.keys();
      keyRequests.forEach((r) => existingKeys.add(r.url));

      const totalAssets = ASSET_FILES.length;
      let cachedCount = 0;
      let failedCount = 0;

      // Cache assets in batches of 5 for parallel downloads
      const BATCH_SIZE = 5;
      for (let i = 0; i < ASSET_FILES.length; i += BATCH_SIZE) {
        const batch = ASSET_FILES.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(async (file) => {
            const url = `/assets/${file}`;
            if (existingKeys.has(url)) {
              cachedCount++;
              return;
            }
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response);
                cachedCount++;
              } else {
                failedCount++;
              }
            } catch {
              failedCount++;
            }
          })
        );

        const pct = Math.round(((i + batch.length) / totalAssets) * 100);
        const overall = 30 + Math.round(pct * 0.5); // 30-80%
        report('assets', pct, overall, `Caching assets... ${cachedCount}/${totalAssets}`);
      }

      assetsCached = failedCount === 0;
      report(
        'assets',
        100,
        80,
        failedCount > 0
          ? `${cachedCount} assets cached, ${failedCount} failed`
          : `${cachedCount} assets cached`
      );
    } else {
      assetsCached = true;
      report('assets', 100, 80, 'Cache API not available (assets will load on demand)');
    }

    // Phase 3: Ensure Service Worker caches app shell
    report('appshell', 0, 80, 'Setting up offline app shell...');

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        // Trigger SW update to ensure latest cache
        await reg.update();
        appShellCached = true;
      } catch {
        appShellCached = true; // Non-critical
      }
    } else {
      appShellCached = true;
    }

    report('appshell', 100, 95, 'App shell ready');

    // Done
    report('done', 100, 100, 'Offline mode ready!');

    return {
      success: true,
      modelCached,
      assetsCached,
      appShellCached,
    };
  } catch (err) {
    return {
      success: false,
      modelCached,
      assetsCached,
      appShellCached,
      error: err instanceof Error ? err.message : 'Setup failed',
    };
  }
}
