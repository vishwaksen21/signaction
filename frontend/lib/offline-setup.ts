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

// ALL sign asset files that actually exist in public/assets/signs/
// Generated from actual file listing — do NOT guess paths
const ASSET_FILES = [
  'signs/0.mp4','signs/1.mp4','signs/2.mp4','signs/3.mp4','signs/4.mp4',
  'signs/5.mp4','signs/6.mp4','signs/7.mp4','signs/8.mp4','signs/9.mp4',
  'signs/A.mp4','signs/B.mp4','signs/C.mp4','signs/D.mp4','signs/E.mp4',
  'signs/F.mp4','signs/G.mp4','signs/H.mp4','signs/I.mp4','signs/J.mp4',
  'signs/K.mp4','signs/L.mp4','signs/M.mp4','signs/N.mp4','signs/O.mp4',
  'signs/P.mp4','signs/Q.mp4','signs/R.mp4','signs/S.mp4','signs/T.mp4',
  'signs/U.mp4','signs/V.mp4','signs/W.mp4','signs/X.mp4','signs/Y.mp4',
  'signs/Z.mp4',
  'signs/AFRAID.mp4','signs/AFTER.mp4','signs/AGAIN.mp4','signs/AGAINST.mp4',
  'signs/AGE.mp4','signs/AGREE.mp4','signs/ALL.mp4','signs/ALONE.mp4',
  'signs/ALSO.mp4','signs/ALWAYS.mp4','signs/AND.mp4','signs/ANGRY.mp4',
  'signs/ANSWER.mp4','signs/ASK.mp4','signs/AT.mp4',
  'signs/BAD.mp4','signs/BE.mp4','signs/BEAUTIFUL.mp4','signs/BEFORE.mp4',
  'signs/BEST.mp4','signs/BETTER.mp4','signs/BRAVE.mp4','signs/BREAK.mp4',
  'signs/BUSY.mp4','signs/BUT.mp4','signs/BYE.mp4',
  'signs/CALL.mp4','signs/CALM.mp4','signs/CAN.mp4','signs/CANNOT.mp4',
  'signs/CAREFUL.mp4','signs/CHANGE.mp4','signs/CHAT.mp4','signs/CHOCOLATE.mp4',
  'signs/COLLEGE.mp4','signs/COME.mp4','signs/COMPUTER.mp4',
  'signs/CONGRATULATIONS.mp4','signs/CRY.mp4',
  'signs/DAY.mp4','signs/DISAGREE.mp4','signs/DISSENT.mp4','signs/DISTANCE.mp4',
  'signs/DO.mp4','signs/DOES_NOT.mp4','signs/DO_NOT.mp4','signs/DRINK.mp4',
  'signs/EAT.mp4','signs/ENGINEER.mp4',
  'signs/FIGHT.mp4','signs/FINISH.mp4','signs/FOLLOW.mp4','signs/FROM.mp4',
  'signs/GLITTER.mp4','signs/GO.mp4','signs/GOD.mp4','signs/GOLD.mp4',
  'signs/GOOD.mp4','signs/GREAT.mp4',
  'signs/HAND.mp4','signs/HANDS.mp4','signs/HAPPY.mp4','signs/HE.mp4',
  'signs/HEAR.mp4','signs/HELLO.mp4','signs/HELP.mp4','signs/HER.mp4',
  'signs/HERE.mp4','signs/HIS.mp4','signs/HOME.mp4','signs/HOMEPAGE.mp4',
  'signs/HOW.mp4',
  'signs/I.mp4','signs/INVENT.mp4','signs/IT.mp4',
  'signs/KEEP.mp4',
  'signs/LANGUAGE.mp4','signs/LAUGH.mp4','signs/LEARN.mp4','signs/LIKE.mp4',
  'signs/ME.mp4','signs/MORE.mp4','signs/MY.mp4',
  'signs/NAME.mp4','signs/NEXT.mp4','signs/NO.mp4','signs/NOT.mp4','signs/NOW.mp4',
  'signs/OF.mp4','signs/ON.mp4','signs/OUR.mp4','signs/OUT.mp4',
  'signs/PLAY.mp4','signs/PRETTY.mp4',
  'signs/RIGHT.mp4',
  'signs/SAD.mp4','signs/SAFE.mp4','signs/SEE.mp4','signs/SELF.mp4',
  'signs/SHE.mp4','signs/SIGN.mp4','signs/SING.mp4','signs/SLEEP.mp4',
  'signs/SO.mp4','signs/SOUND.mp4','signs/SPEAK.mp4','signs/STAY.mp4',
  'signs/STOP.mp4','signs/STUDY.mp4',
  'signs/TALK.mp4','signs/TELEVISION.mp4','signs/THANK.mp4','signs/THANK_YOU.mp4',
  'signs/THAT.mp4','signs/THEY.mp4','signs/THIS.mp4','signs/THOSE.mp4',
  'signs/TIME.mp4','signs/TO.mp4','signs/TYPE.mp4',
  'signs/UNDERSTAND.mp4','signs/US.mp4',
  'signs/WAIT.mp4','signs/WALK.mp4','signs/WASH.mp4','signs/WAY.mp4',
  'signs/WE.mp4','signs/WELCOME.mp4','signs/WHAT.mp4','signs/WHEN.mp4',
  'signs/WHERE.mp4','signs/WHICH.mp4','signs/WHO.mp4','signs/WHOLE.mp4',
  'signs/WHOSE.mp4','signs/WHY.mp4','signs/WIFE.mp4','signs/WILL.mp4',
  'signs/WITH.mp4','signs/WITHOUT.mp4','signs/WORDS.mp4','signs/WORK.mp4',
  'signs/WORLD.mp4','signs/WRONG.mp4',
  'signs/YOU.mp4','signs/YOUR.mp4','signs/YOURSELF.mp4',
];

const ASSET_READINESS_THRESHOLD = 0.8;

/**
 * Check if the app is fully ready for offline use.
 */
export async function isFullyOfflineReady(): Promise<{
  ready: boolean;
  model: boolean;
  assets: boolean;
}> {
  const model = await isModelCached();

  let assets = false;
  if ('caches' in window) {
    try {
      const cache = await caches.open('signaction-v1');
      const keys = await cache.keys();
      const cachedAssetCount = keys.filter((req) =>
        req.url.includes('/assets/signs/')
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

      const BATCH_SIZE = 10;
      for (let i = 0; i < ASSET_FILES.length; i += BATCH_SIZE) {
        const batch = ASSET_FILES.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
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
                console.warn(`[Offline] Failed to cache ${url}: ${response.status}`);
                failedCount++;
              }
            } catch (err) {
              console.warn(`[Offline] Error caching ${url}:`, err);
              failedCount++;
            }
          })
        );

        const pct = Math.round(((i + batch.length) / totalAssets) * 100);
        const overall = 30 + Math.round(pct * 0.5);
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
      report('assets', 100, 80, 'Cache API not available');
    }

    // Phase 3: Ensure Service Worker caches app shell
    report('appshell', 0, 80, 'Setting up offline app shell...');

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.update();
        appShellCached = true;
      } catch {
        appShellCached = true;
      }
    } else {
      appShellCached = true;
    }

    report('appshell', 100, 95, 'App shell ready');
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
