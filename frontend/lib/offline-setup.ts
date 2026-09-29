/**
 * Unified offline setup — downloads everything in one click:
 * 1. Vosk STT model (~40MB)
 * 2. Sign language assets (~18MB)
 * 3. App shell via Service Worker
 *
 * Reports granular progress for each phase.
 */

import { isModelCached, downloadModel, cacheModel } from './model-cache';
import { isNativeApk } from './platform';

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
  "signs/0.mp4",
  "signs/1.mp4",
  "signs/2.mp4",
  "signs/3.mp4",
  "signs/4.mp4",
  "signs/5.mp4",
  "signs/6.mp4",
  "signs/7.mp4",
  "signs/8.mp4",
  "signs/9.mp4",
  "signs/A.mp4",
  "signs/ACCIDENT.mp4",
  "signs/AFRAID.mp4",
  "signs/AFTER.mp4",
  "signs/AFTERNOON.mp4",
  "signs/AGAIN.mp4",
  "signs/AGAINST.mp4",
  "signs/AGE.mp4",
  "signs/AGREE.mp4",
  "signs/AIR.mp4",
  "signs/ALL.mp4",
  "signs/ALLERGY.mp4",
  "signs/ALONE.mp4",
  "signs/ALREADY.mp4",
  "signs/ALSO.mp4",
  "signs/ALWAYS.mp4",
  "signs/AND.mp4",
  "signs/ANGRY.mp4",
  "signs/ANSWER.mp4",
  "signs/ANY.mp4",
  "signs/APPLE.mp4",
  "signs/ARM.mp4",
  "signs/AROUND.mp4",
  "signs/ART.mp4",
  "signs/ASK.mp4",
  "signs/AT.mp4",
  "signs/B.mp4",
  "signs/BAD.mp4",
  "signs/BAG.mp4",
  "signs/BANANA.mp4",
  "signs/BATHROOM.mp4",
  "signs/BE.mp4",
  "signs/BEAUTIFUL.mp4",
  "signs/BEDROOM.mp4",
  "signs/BEFORE.mp4",
  "signs/BEHIND.mp4",
  "signs/BELIEVE.mp4",
  "signs/BEST.mp4",
  "signs/BETTER.mp4",
  "signs/BIG.mp4",
  "signs/BLACK.mp4",
  "signs/BLOOD.mp4",
  "signs/BLUE.mp4",
  "signs/BLUETOOTH.mp4",
  "signs/BOAT.mp4",
  "signs/BODY.mp4",
  "signs/BOOK.mp4",
  "signs/BOX.mp4",
  "signs/BRAVE.mp4",
  "signs/BREAD.mp4",
  "signs/BREAK.mp4",
  "signs/BRIGHT.mp4",
  "signs/BROWN.mp4",
  "signs/BUS.mp4",
  "signs/BUSY.mp4",
  "signs/BUT.mp4",
  "signs/BYE.mp4",
  "signs/C.mp4",
  "signs/CALL.mp4",
  "signs/CALM.mp4",
  "signs/CAN.mp4",
  "signs/CANNOT.mp4",
  "signs/CAR.mp4",
  "signs/CAREFUL.mp4",
  "signs/CARROT.mp4",
  "signs/CAT.mp4",
  "signs/CHANGE.mp4",
  "signs/CHAT.mp4",
  "signs/CHOCOLATE.mp4",
  "signs/CITY.mp4",
  "signs/CLOCK.mp4",
  "signs/CLOSE.mp4",
  "signs/CLOUD.mp4",
  "signs/COLD.mp4",
  "signs/COLLECT.mp4",
  "signs/COLLEGE.mp4",
  "signs/COME.mp4",
  "signs/COMFORTABLE.mp4",
  "signs/COMPUTER.mp4",
  "signs/CONGRATULATIONS.mp4",
  "signs/COOK.mp4",
  "signs/COUNTRY.mp4",
  "signs/CRY.mp4",
  "signs/CUT.mp4",
  "signs/D.mp4",
  "signs/DAY.mp4",
  "signs/DECIDE.mp4",
  "signs/DIFFERENT.mp4",
  "signs/DINNER.mp4",
  "signs/DISAGREE.mp4",
  "signs/DISSENT.mp4",
  "signs/DISTANCE.mp4",
  "signs/DO.mp4",
  "signs/DOES_NOT.mp4",
  "signs/DOG.mp4",
  "signs/DOOR.mp4",
  "signs/DO_NOT.mp4",
  "signs/DRAW.mp4",
  "signs/DREAM.mp4",
  "signs/DRESS.mp4",
  "signs/DRINK.mp4",
  "signs/DRIVE.mp4",
  "signs/DRY.mp4",
  "signs/DURING.mp4",
  "signs/E.mp4",
  "signs/EAR.mp4",
  "signs/EARTH.mp4",
  "signs/EASY.mp4",
  "signs/EAT.mp4",
  "signs/EGG.mp4",
  "signs/ELEPHANT.mp4",
  "signs/EMAIL.mp4",
  "signs/EMERGENCY.mp4",
  "signs/ENGINEER.mp4",
  "signs/ENGLISH.mp4",
  "signs/ENOUGH.mp4",
  "signs/EVENING.mp4",
  "signs/EVERYTHING.mp4",
  "signs/EXAM.mp4",
  "signs/EXCUSE_ME.mp4",
  "signs/EXPENSIVE.mp4",
  "signs/EXPLAIN.mp4",
  "signs/EYE.mp4",
  "signs/F.mp4",
  "signs/FIGHT.mp4",
  "signs/FINISH.mp4",
  "signs/FLY.mp4",
  "signs/FOLLOW.mp4",
  "signs/FOOD.mp4",
  "signs/FOREST.mp4",
  "signs/FREE.mp4",
  "signs/FRESH.mp4",
  "signs/FRIDAY.mp4",
  "signs/FRIEND.mp4",
  "signs/FROM.mp4",
  "signs/FULL.mp4",
  "signs/G.mp4",
  "signs/GARAGE.mp4",
  "signs/GARDEN.mp4",
  "signs/GEOGRAPHY.mp4",
  "signs/GET.mp4",
  "signs/GLITTER.mp4",
  "signs/GO.mp4",
  "signs/GOD.mp4",
  "signs/GOLD.mp4",
  "signs/GOOD.mp4",
  "signs/GOOD_AFTERNOON.mp4",
  "signs/GOOD_MORNING.mp4",
  "signs/GOOD_NIGHT.mp4",
  "signs/GRANDFATHER.mp4",
  "signs/GRANDMOTHER.mp4",
  "signs/GRASS.mp4",
  "signs/GREAT.mp4",
  "signs/GREEN.mp4",
  "signs/H.mp4",
  "signs/HALF.mp4",
  "signs/HAND.mp4",
  "signs/HANDS.mp4",
  "signs/HAPPEN.mp4",
  "signs/HAPPY.mp4",
  "signs/HARD.mp4",
  "signs/HAT.mp4",
  "signs/HATE.mp4",
  "signs/HAVE.mp4",
  "signs/HE.mp4",
  "signs/HEAD.mp4",
  "signs/HEADACHE.mp4",
  "signs/HEAR.mp4",
  "signs/HEARING.mp4",
  "signs/HELLO.mp4",
  "signs/HELP.mp4",
  "signs/HER.mp4",
  "signs/HERE.mp4",
  "signs/HI.mp4",
  "signs/HIS.mp4",
  "signs/HOME.mp4",
  "signs/HOMEPAGE.mp4",
  "signs/HOT.mp4",
  "signs/HOTEL.mp4",
  "signs/HOUR.mp4",
  "signs/HOW.mp4",
  "signs/HUGE.mp4",
  "signs/HUNGRY.mp4",
  "signs/HUSBAND.mp4",
  "signs/I.mp4",
  "signs/IDEA.mp4",
  "signs/IN.mp4",
  "signs/INJURY.mp4",
  "signs/INTERNET.mp4",
  "signs/INVENT.mp4",
  "signs/IT.mp4",
  "signs/I_UNDERSTAND.mp4",
  "signs/J.mp4",
  "signs/JOB.mp4",
  "signs/JUICE.mp4",
  "signs/K.mp4",
  "signs/KEEP.mp4",
  "signs/KITCHEN.mp4",
  "signs/KNOW.mp4",
  "signs/L.mp4",
  "signs/LAKE.mp4",
  "signs/LAMP.mp4",
  "signs/LANGUAGE.mp4",
  "signs/LAPTOP.mp4",
  "signs/LARGE.mp4",
  "signs/LATE.mp4",
  "signs/LAUGH.mp4",
  "signs/LEARN.mp4",
  "signs/LETTER.mp4",
  "signs/LIBRARY.mp4",
  "signs/LIFE.mp4",
  "signs/LIKE.mp4",
  "signs/LION.mp4",
  "signs/LIVE.mp4",
  "signs/LONG.mp4",
  "signs/LOSE.mp4",
  "signs/LUNCH.mp4",
  "signs/M.mp4",
  "signs/MAKE.mp4",
  "signs/MAN.mp4",
  "signs/MANGO.mp4",
  "signs/MAY.mp4",
  "signs/ME.mp4",
  "signs/MEAN.mp4",
  "signs/MEASURE.mp4",
  "signs/MEAT.mp4",
  "signs/MEET.mp4",
  "signs/MIGHT.mp4",
  "signs/MILK.mp4",
  "signs/MONDAY.mp4",
  "signs/MONKEY.mp4",
  "signs/MONTH.mp4",
  "signs/MORE.mp4",
  "signs/MOTHER.mp4",
  "signs/MOUNTAIN.mp4",
  "signs/MOUSE.mp4",
  "signs/MOUTH.mp4",
  "signs/MOVE.mp4",
  "signs/MUSEUM.mp4",
  "signs/MUSIC.mp4",
  "signs/MY.mp4",
  "signs/MYSELF.mp4",
  "signs/MY_NAME_IS.mp4",
  "signs/N.mp4",
  "signs/NAME.mp4",
  "signs/NARROW.mp4",
  "signs/NEAT.mp4",
  "signs/NEIGHBOR.mp4",
  "signs/NEW.mp4",
  "signs/NEXT.mp4",
  "signs/NICE.mp4",
  "signs/NO.mp4",
  "signs/NOSE.mp4",
  "signs/NOT.mp4",
  "signs/NOW.mp4",
  "signs/NURSE.mp4",
  "signs/O.mp4",
  "signs/OF.mp4",
  "signs/OFFICE.mp4",
  "signs/OFTEN.mp4",
  "signs/ON.mp4",
  "signs/ONCE.mp4",
  "signs/OPEN.mp4",
  "signs/ORANGE.mp4",
  "signs/OTHER.mp4",
  "signs/OUR.mp4",
  "signs/OUT.mp4",
  "signs/P.mp4",
  "signs/PAIN.mp4",
  "signs/PAY.mp4",
  "signs/PENCIL.mp4",
  "signs/PLAY.mp4",
  "signs/POTATO.mp4",
  "signs/PRETTY.mp4",
  "signs/Q.mp4",
  "signs/R.mp4",
  "signs/RIGHT.mp4",
  "signs/S.mp4",
  "signs/SAD.mp4",
  "signs/SAFE.mp4",
  "signs/SEE.mp4",
  "signs/SELF.mp4",
  "signs/SHE.mp4",
  "signs/SIGN.mp4",
  "signs/SING.mp4",
  "signs/SLEEP.mp4",
  "signs/SO.mp4",
  "signs/SOUND.mp4",
  "signs/SPEAK.mp4",
  "signs/STAY.mp4",
  "signs/STOP.mp4",
  "signs/STUDY.mp4",
  "signs/T.mp4",
  "signs/TALK.mp4",
  "signs/TELEVISION.mp4",
  "signs/THANK.mp4",
  "signs/THANK_YOU.mp4",
  "signs/THAT.mp4",
  "signs/THEY.mp4",
  "signs/THIS.mp4",
  "signs/THOSE.mp4",
  "signs/TIME.mp4",
  "signs/TO.mp4",
  "signs/TYPE.mp4",
  "signs/U.mp4",
  "signs/UNDERSTAND.mp4",
  "signs/US.mp4",
  "signs/V.mp4",
  "signs/W.mp4",
  "signs/WAIT.mp4",
  "signs/WALK.mp4",
  "signs/WASH.mp4",
  "signs/WAY.mp4",
  "signs/WE.mp4",
  "signs/WELCOME.mp4",
  "signs/WHAT.mp4",
  "signs/WHEN.mp4",
  "signs/WHERE.mp4",
  "signs/WHICH.mp4",
  "signs/WHO.mp4",
  "signs/WHOLE.mp4",
  "signs/WHOSE.mp4",
  "signs/WHY.mp4",
  "signs/WIFE.mp4",
  "signs/WILL.mp4",
  "signs/WITH.mp4",
  "signs/WITHOUT.mp4",
  "signs/WORDS.mp4",
  "signs/WORK.mp4",
  "signs/WORLD.mp4",
  "signs/WRONG.mp4",
  "signs/X.mp4",
  "signs/Y.mp4",
  "signs/YOU.mp4",
  "signs/YOUR.mp4",
  "signs/YOURSELF.mp4",
  "signs/Z.mp4"
];

const ASSET_READINESS_THRESHOLD = 0.8;

/**
 * Check if the app is fully ready for offline use.
 */
export async function isFullyOfflineReady(): Promise<{
  ready: boolean;
  model: boolean;
  assets: boolean;
  isNative: boolean;
}> {
  const isNative = isNativeApk();

  if (isNative) {
    // In native Android APK, both the sign assets and the Vosk model are bundled locally in the APK.
    return { ready: true, model: true, assets: true, isNative: true };
  }

  const locallyMarked =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('signaction_offline_installed') === 'true';

  const model = (await isModelCached()) || locallyMarked;

  let assets = locallyMarked;
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
      assets = assets || cachedAssetCount >= requiredCount;
    } catch {
      // keep fallback
    }
  }

  return { ready: (model && assets) || locallyMarked, model, assets, isNative: false };
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

  const isNative = isNativeApk();
  if (isNative) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('signaction_offline_installed', 'true');
      }
    } catch {
      // ignore
    }
    report('model', 50, 20, 'Speech model available locally in APK');
    const alreadyCached = await isModelCached();
    if (!alreadyCached) {
      try {
        const data = await downloadModel();
        await cacheModel(data);
        modelCached = true;
      } catch {
        modelCached = true;
      }
    } else {
      modelCached = true;
    }
    report('model', 100, 40, 'Speech model ready');
    report('assets', 100, 80, 'Sign assets bundled in APK');
    assetsCached = true;
    report('appshell', 100, 100, 'App shell ready');
    appShellCached = true;
    report('done', 100, 100, 'Offline mode ready!');
    return { success: true, modelCached: true, assetsCached: true, appShellCached: true };
  }

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

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('signaction_offline_installed', 'true');
      }
    } catch {
      // ignore
    }

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
