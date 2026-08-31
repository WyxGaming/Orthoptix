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

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
