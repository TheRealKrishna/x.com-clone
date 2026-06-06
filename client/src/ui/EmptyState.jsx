import React from "react";

/**
 * Large centered empty-state message used by feeds, lists, search, etc.
 */
export default function EmptyState({ title, subtitle, icon }) {
  return (
    <div
      style={{
        padding: "48px 32px",
        textAlign: "center",
        maxWidth: 380,
        margin: "0 auto",
      }}
    >
      {icon && <i className={icon} style={{ fontSize: 40, color: "var(--text-primary)", marginBottom: 16 }} />}
      {title && <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}>{title}</h2>}
      {subtitle && <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.5, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}
