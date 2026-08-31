/** Configuration Google AdSense (variables VITE_* au build). */

export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT?.trim() || "";

export const ADSENSE_SLOT_SIDEBAR =
  import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR?.trim() || "";

/** Jusqu'à 5 emplacements inline, séparés par des virgules dans .env */
export const ADSENSE_SLOTS_INLINE: string[] = (
  import.meta.env.VITE_ADSENSE_SLOTS_INLINE?.trim() || ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .slice(0, 5);

export const MAX_INLINE_ADS = 5;

export const adsenseEnabled = Boolean(ADSENSE_CLIENT);

export const adsenseSidebarEnabled = adsenseEnabled && Boolean(ADSENSE_SLOT_SIDEBAR);

export const adsenseInlineEnabled =
  adsenseEnabled && ADSENSE_SLOTS_INLINE.length > 0;

/** Jusqu'à maxAds espacements répartis uniformément (1 pub max par trou). */
export function pickInlineAdGaps(
  gapCount: number,
  maxAds: number,
  slots: string[]
): { gapIndex: number; slot: string }[] {
  if (gapCount <= 0 || slots.length === 0) return [];

  const adCount = Math.min(maxAds, gapCount, slots.length);
  if (adCount <= 0) return [];

  const gapIndices: number[] = [];
  if (adCount === 1) {
    gapIndices.push(Math.floor((gapCount - 1) / 2));
  } else {
    for (let i = 0; i < adCount; i++) {
      gapIndices.push(Math.round((i * (gapCount - 1)) / (adCount - 1)));
    }
  }

  const unique = [...new Set(gapIndices)].sort((a, b) => a - b);
  return unique.map((gapIndex, slotIndex) => ({
    gapIndex,
    slot: slots[slotIndex],
  }));
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
