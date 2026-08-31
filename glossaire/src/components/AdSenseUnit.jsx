import { useEffect, useRef } from "react";
import { adsenseEnabled, ADSENSE_CLIENT } from "@/lib/adsense";

let scriptPromise = null;

/** Charge le script AdSense une seule fois par page. */
export function ensureAdSenseScript() {
  if (!adsenseEnabled || typeof document === "undefined") return Promise.resolve();
  if (window.adsbygoogle) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-og-adsense="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("AdSense script")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-og-adsense", "1");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("AdSense script"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Bloc publicitaire AdSense (display responsive).
 * Ne s'affiche que si client + slot sont configurés.
 */
export default function AdSenseUnit({
  slot,
  format = "auto",
  layout,
  layoutKey,
  className = "",
  style,
  label = "Publicité",
}) {
  const insRef = useRef(null);
  const filledRef = useRef(false);

  useEffect(() => {
    if (!adsenseEnabled || !slot || filledRef.current) return;

    let cancelled = false;

    ensureAdSenseScript()
      .then(() => {
        if (cancelled || !insRef.current || filledRef.current) return;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          filledRef.current = true;
        } catch (err) {
          console.warn("[AdSense]", err);
        }
      })
      .catch((err) => {
        console.warn("[AdSense]", err);
      });

    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!adsenseEnabled || !slot) return null;

  return (
    <div
      className={`og-ad-wrap ${className}`.trim()}
      role="complementary"
      aria-label={label}
    >
      <p className="og-ad-label og-eyebrow og-no-print">Publicité</p>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: "90px", ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  );
}
