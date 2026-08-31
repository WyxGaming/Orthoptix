import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdSenseUnit from "@/components/AdSenseUnit";
import { adsenseSidebarEnabled, ADSENSE_SLOT_SIDEBAR } from "@/lib/adsense";

const COLLAPSED_KEY = "og-ads-sidebar-collapsed";

export default function AdSenseSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "1"
  );

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  if (!adsenseSidebarEnabled) return null;

  return (
    <aside
      className={`og-ad-sidebar og-no-print ${collapsed ? "collapsed" : ""}`}
      aria-label="Encart publicitaire"
    >
      <button
        type="button"
        className="og-ad-sidebar-toggle"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Afficher la publicité" : "Masquer la publicité"}
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="og-ad-sidebar-panel">
        <AdSenseUnit
          slot={ADSENSE_SLOT_SIDEBAR}
          format="auto"
          className="og-ad-sidebar-unit"
          style={{ minHeight: "250px", width: "100%" }}
          label="Encart publicitaire latéral"
        />
      </div>
    </aside>
  );
}
