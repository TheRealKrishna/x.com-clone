import React from "react";
import Styles from "./Tabs.module.css";

/**
 * Horizontal tab bar. `tabs` = [{ key, label }]. Calls onChange(key).
 */
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className={Styles.tabs} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          className={`${Styles.tab} ${active === t.key ? Styles.tabActive : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
