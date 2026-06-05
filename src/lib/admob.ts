// Google AdMob configuration + runtime helpers.
// Real ads only run inside the native Android/iOS wrapper (Capacitor).
// In the web preview, showRewarded() resolves false (no fake rewards).

export const ADMOB = {
  appId: "ca-app-pub-4006345105545851~6206813716",
  rewarded: "ca-app-pub-4006345105545851/9936963715",
  banner: "ca-app-pub-4006345105545851/5806147019",
  interstitial: "ca-app-pub-4006345105545851/8250523124",
} as const;

let initialized = false;

function isNative(): boolean {
  if (typeof window === "undefined") return false;
  // @ts-expect-error injected by Capacitor at runtime
  const cap = window.Capacitor;
  if (!cap) return false;
  try {
    if (typeof cap.isNativePlatform === "function" && cap.isNativePlatform()) return true;
    if (typeof cap.getPlatform === "function") {
      const p = cap.getPlatform();
      if (p === "android" || p === "ios") return true;
    }
    if (cap.platform && cap.platform !== "web") return true;
  } catch { /* noop */ }
  return false;
}

async function ensureInit(): Promise<boolean> {
  if (!isNative()) return false;
  if (initialized) return true;
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.initialize({ initializeForTesting: false });
    initialized = true;
    return true;
  } catch (e) {
    console.warn("[admob] init failed", e);
    return false;
  }
}

/**
 * Show a rewarded ad. Resolves true ONLY if the user fully watched the ad
 * and the reward callback fired. Resolves false on web, load failure,
 * skip, or any error. Caller must grant reward only on `true`.
 */
export async function showRewarded(): Promise<boolean> {
  const ok = await ensureInit();
  if (!ok) return false;
  try {
    const mod = await import("@capacitor-community/admob");
    const { AdMob, RewardAdPluginEvents } = mod;
    let rewarded = false;
    const handle = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
      rewarded = true;
    });
    try {
      await AdMob.prepareRewardVideoAd({ adId: ADMOB.rewarded });
      await AdMob.showRewardVideoAd();
    } finally {
      try { await handle.remove(); } catch { /* noop */ }
    }
    return rewarded;
  } catch (e) {
    console.warn("[admob] rewarded failed", e);
    return false;
  }
}

export async function showInterstitial(): Promise<boolean> {
  const ok = await ensureInit();
  if (!ok) return false;
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.prepareInterstitial({ adId: ADMOB.interstitial });
    await AdMob.showInterstitial();
    return true;
  } catch (e) {
    console.warn("[admob] interstitial failed", e);
    return false;
  }
}

export async function showBanner(): Promise<boolean> {
  const ok = await ensureInit();
  if (!ok) return false;
  try {
    const mod = await import("@capacitor-community/admob");
    const { AdMob, BannerAdPosition, BannerAdSize } = mod;
    await AdMob.showBanner({
      adId: ADMOB.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });
    return true;
  } catch (e) {
    console.warn("[admob] banner failed", e);
    return false;
  }
}

export function isAdMobAvailable(): boolean {
  return isNative();
}
